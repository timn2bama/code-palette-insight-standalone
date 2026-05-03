import { useState } from 'react';
import { Share2, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OutfitShareProps {
  outfit: {
    id: string;
    name: string;
    image_url?: string;
    tags?: string[];
    description?: string;
  };
}

const OutfitShare = ({ outfit }: OutfitShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [caption, setCaption] = useState('');
  const { toast } = useToast();

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/outfit/${outfit.id}`;
    setShareUrl(url);
    return url;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const url = generateShareUrl();
    const text = caption || `Check out my outfit: ${outfit.name}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}${outfit.image_url ? `&media=${encodeURIComponent(outfit.image_url)}` : ''}`,
      instagram: 'https://www.instagram.com/', // Instagram doesn't support direct URL sharing
    };

    if (platform === 'instagram') {
      toast({
        title: "Instagram Sharing",
        description: "Copy the image and share manually on Instagram",
      });
      return;
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  const downloadImage = async () => {
    if (!outfit.image_url) {
      toast({
        title: "No image available",
        description: "This outfit doesn't have an image to download",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(outfit.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${outfit.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: "Outfit image saved to your device",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: outfit.name,
          text: caption || `Check out my outfit: ${outfit.name}`,
          url: generateShareUrl(),
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy link
      copyToClipboard(generateShareUrl());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={generateShareUrl}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Outfit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Outfit Preview */}
          <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
            {outfit.image_url && (
              <img 
                src={outfit.image_url} 
                alt={outfit.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium">{outfit.name}</h4>
              {outfit.tags && outfit.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {outfit.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {outfit.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{outfit.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Add a caption for your outfit..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Share Link</Label>
            <div className="flex space-x-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleWebShare}
              className="flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Quick Share
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadImage}
              className="flex items-center justify-center"
              disabled={!outfit.image_url}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center"
              >
                <span className="mr-2">🐦</span>
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center"
              >
                <span className="mr-2">📘</span>
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => shareToSocial('pinterest')}
                className="flex items-center justify-center"
              >
                <span className="mr-2">📌</span>
                Pinterest
              </Button>
              
              <Button
                variant="outline"
                onClick={() => shareToSocial('instagram')}
                className="flex items-center justify-center"
              >
                <span className="mr-2">📷</span>
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutfitShare;