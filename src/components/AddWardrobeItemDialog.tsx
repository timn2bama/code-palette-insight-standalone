import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Image, 
  Crown 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateTextInput, validateImageFile, getSafeErrorMessage, rateLimiter } from "@/lib/security";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useUploadLimits } from "@/hooks/useUploadLimits";
import { logger } from "@/utils/logger";

interface AddWardrobeItemDialogProps {
  onItemAdded: () => void;
}

const AddWardrobeItemDialog = ({ onItemAdded }: AddWardrobeItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { logEvent } = useAuditLog();
  const { canUploadToCategory, getCategoryUsage, uploadLimits, refreshLimits } = useUploadLimits();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
  });


  const categories = [
    "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"
  ];

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        logger.info('Original image dimensions:', img.width, 'x', img.height);
        
        // Optimize for quality and size balance - max 1280px long edge
        const maxSize = 1280;
        let { width, height } = img;
        
        // Always resize if either dimension is over maxSize
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        logger.info('Compressed image dimensions:', width, 'x', height);
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Generate both WebP and JPEG versions
        const promises = [
          new Promise<{blob: Blob | null, type: string}>((resolve) => {
            canvas.toBlob((blob) => {
              resolve({ blob, type: 'image/webp' });
            }, 'image/webp', 0.8);
          }),
          new Promise<{blob: Blob | null, type: string}>((resolve) => {
            canvas.toBlob((blob) => {
              resolve({ blob, type: 'image/jpeg' });
            }, 'image/jpeg', 0.7);
          })
        ];
        
        Promise.all(promises).then((results) => {
          const webp = results[0];
          const jpeg = results[1];
          
          // Pick the smaller format
          let chosenBlob = jpeg.blob;
          let chosenType = jpeg.type;
          let extension = 'jpg';
          
          if (webp.blob && jpeg.blob && webp.blob.size < jpeg.blob.size) {
            chosenBlob = webp.blob;
            chosenType = webp.type;
            extension = 'webp';
          }
          
          if (chosenBlob) {
            logger.info(`Using ${chosenType}, size: ${chosenBlob.size} bytes`);
            
            // Update filename extension
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            const newFileName = `${nameWithoutExt}.${extension}`;
            
            const compressedFile = new File([chosenBlob], newFileName, {
              type: chosenType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    logger.info('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check file type first
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      logger.error('Invalid file type:', file.type);
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    let processedFile = file;
    
    // Always compress images from phone cameras (typically > 2MB) or large images
  if (file.size > 2_000_000) {
      logger.info('File size exceeds 2MB, compressing...', file.size, 'bytes');
      toast({
        title: "Compressing image...",
        description: "Optimizing image for upload",
      });
      processedFile = await compressImage(file);
      logger.info('Compressed file size:', processedFile.size, 'bytes');
    }

    // Final validation on compressed file
    const fileValidation = validateImageFile(processedFile);
    if (!fileValidation.isValid) {
      logger.error('File validation failed:', fileValidation.error);
      toast({
        title: "Invalid file",
        description: fileValidation.error,
        variant: "destructive",
      });
      return;
    }

    logger.info('File passed validation, setting as selected file');

    setSelectedFile(processedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      logger.info('Preview URL created, length:', result?.length);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(processedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limiting check
      if (!rateLimiter.isAllowed('wardrobe-item-creation', 10, 60000)) {
        toast({
          title: "Too many requests",
          description: "Please wait a moment before adding another item.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('No authenticated user found');
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your wardrobe.",
          variant: "destructive",
        });
        return;
      }

      logger.info('User authenticated:', user.id);

      // Check upload limits for selected category
      if (!canUploadToCategory(formData.category)) {
        const usage = getCategoryUsage(formData.category);
        toast({
          title: "Upload limit reached",
          description: `You can only upload ${usage.limit} items per category on the free plan. Upgrade to Premium for unlimited uploads.`,
          variant: "destructive",
        });
        return;
      }

      // Validate and sanitize inputs
      const nameValidation = validateTextInput(formData.name, 'name');
      const colorValidation = validateTextInput(formData.color, 'color');
      const brandValidation = validateTextInput(formData.brand, 'brand');

      if (!nameValidation.isValid) {
        toast({
          title: "Invalid name",
          description: nameValidation.error,
          variant: "destructive",
        });
        return;
      }

      if (!colorValidation.isValid) {
        toast({
          title: "Invalid color",
          description: colorValidation.error,
          variant: "destructive",
        });
        return;
      }

      if (!brandValidation.isValid) {
        toast({
          title: "Invalid brand",
          description: brandValidation.error,
          variant: "destructive",
        });
        return;
      }

      let photoUrl = null;

      // Upload photo if file is selected
      if (selectedFile) {
        logger.info('Starting photo upload...', selectedFile.name, selectedFile.size);
        
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        logger.info('Uploading to path:', fileName);
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('wardrobe-photos')
          .upload(fileName, selectedFile);

        if (uploadError) {
          logger.error('Upload error:', uploadError);
          throw uploadError;
        }

        logger.info('Upload successful:', uploadData);

        const { data: { publicUrl } } = supabase.storage
          .from('wardrobe-photos')
          .getPublicUrl(fileName);
        
        logger.info('Public URL generated:', publicUrl);
        photoUrl = publicUrl;
      }

      logger.info('Final photo URL:', photoUrl);

      // Insert wardrobe item with sanitized data
      const insertData = {
        name: nameValidation.sanitized,
        category: formData.category,
        color: colorValidation.sanitized || null,
        brand: brandValidation.sanitized || null,
        photo_url: photoUrl,
        user_id: user.id,
      };

      logger.info('Inserting wardrobe item:', insertData);

      const { error: insertError, data: insertedData } = await supabase
        .from('wardrobe_items')
        .insert(insertData)
        .select();

      if (insertError) {
        logger.error('Insert error:', insertError);
        throw insertError;
      }

      logger.info('Item inserted successfully:', insertedData);

      // Log the creation for audit purposes
      await logEvent({
        event_type: 'wardrobe_item_created',
        details: {
          item_name: nameValidation.sanitized,
          category: formData.category,
          has_photo: !!photoUrl
        }
      });

      toast({
        title: "Success!",
        description: "Item added to your wardrobe.",
      });

      // Reset form
      setFormData({ name: "", category: "", color: "", brand: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setOpen(false);
      refreshLimits(); // Refresh limits after successful upload
      onItemAdded();

    } catch (error) {
      logger.error('Error adding item:', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="premium" size="lg" className="shadow-glow">
          Add New Item to Wardrobe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Wardrobe Item</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
              {previewUrl ? (
                <div className="space-y-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md"
                    onError={() => {
                      logger.error('Preview image failed to load:', previewUrl);
                    }}
                    onLoad={() => {
                      logger.info('Preview image loaded successfully');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logger.info('Removing preview image');
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload a photo</p>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      logger.info('Opening file picker');
                      document.getElementById('photo')?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Black Blazer"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const usage = getCategoryUsage(category);
                  const isAtLimit = !canUploadToCategory(category);
                  return (
                    <SelectItem key={category} value={category} disabled={isAtLimit}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        {!uploadLimits.isUnlimited && (
                          <span className={`text-xs ml-2 ${isAtLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {usage.used}/{usage.limit}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {formData.category && !uploadLimits.isUnlimited && (
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const usage = getCategoryUsage(formData.category);
                  return `${usage.used}/${usage.limit} items used in this category`;
                })()}
              </div>
            )}
            {!uploadLimits.isUnlimited && (
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  Free plan: 4 items per category. <strong>Upgrade to Premium for unlimited uploads!</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g., Black, Navy, Red"
            />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Zara, H&M, Nike"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.category}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {loading ? "Adding to Wardrobe..." : "💾 Add to Wardrobe"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWardrobeItemDialog;
