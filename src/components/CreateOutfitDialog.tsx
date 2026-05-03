import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validateTextInput, getSafeErrorMessage, rateLimiter } from "@/lib/security";
import { useAuditLog } from "@/hooks/useAuditLog";
import { logger } from "@/utils/logger";

interface CreateOutfitDialogProps {
  onOutfitCreated?: () => void;
  children?: React.ReactNode;
  initialItem?: { id: string; name: string };
}

const occasions = [
  "casual", "work", "formal", "date night", "party", 
  "vacation", "gym", "shopping", "brunch", "evening out"
];

const seasons = ["spring", "summer", "fall", "winter", "all seasons"];

const CreateOutfitDialog = ({ onOutfitCreated, children, initialItem }: CreateOutfitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    occasion: "",
    season: ""
  });
  const { user } = useAuth();
  const { logEvent } = useAuditLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) return;

    // Rate limiting check
    if (!rateLimiter.isAllowed('outfit-creation', 20, 60000)) {
      toast.error('Too many requests. Please wait a moment before creating another outfit.');
      return;
    }

    setLoading(true);
    try {
      // Validate and sanitize inputs
      const nameValidation = validateTextInput(formData.name, 'name');
      const descriptionValidation = validateTextInput(formData.description, 'description');

      if (!nameValidation.isValid) {
        toast.error(nameValidation.error || 'Invalid outfit name');
        return;
      }

      if (!descriptionValidation.isValid) {
        toast.error(descriptionValidation.error || 'Invalid description');
        return;
      }
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: nameValidation.sanitized,
          description: descriptionValidation.sanitized || null,
          occasion: formData.occasion || null,
          season: formData.season || null,
          is_public: false
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // If there's an initial item, add it to the outfit
      if (initialItem && outfit) {
        const { error: itemError } = await supabase
          .from('outfit_items')
          .insert({
            outfit_id: outfit.id,
            wardrobe_item_id: initialItem.id
          });

        if (itemError) throw itemError;
      }

      // Log the creation for audit purposes
      await logEvent({
        event_type: 'outfit_created',
        details: {
          outfit_name: nameValidation.sanitized,
          occasion: formData.occasion,
          season: formData.season,
          has_initial_item: !!initialItem
        }
      });

      toast.success(`Outfit "${formData.name}" created successfully!`);
      setFormData({ name: "", description: "", occasion: "", season: "" });
      setOpen(false);
      onOutfitCreated?.();
    } catch (error) {
      logger.error('Error creating outfit:', error);
      toast.error(getSafeErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Outfit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Create New Outfit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Outfit Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Business Meeting Look"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the style or when you'd wear this..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((occasion) => (
                    <SelectItem key={occasion} value={occasion}>
                      {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {initialItem && (
            <div className="bg-secondary/20 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Starting with: <span className="font-medium text-primary">{initialItem.name}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
              {loading ? 'Creating...' : 'Create Outfit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOutfitDialog;