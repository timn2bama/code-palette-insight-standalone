import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Star, Calendar, MapPin, Shirt, Palette, Send } from "lucide-react";
import { SocialOutfit } from "@/hooks/useSocialOutfits";
import ProgressiveImage from "@/components/ProgressiveImage";
import { formatDistanceToNow } from 'date-fns';

interface SocialViewOutfitDialogProps {
  outfit: SocialOutfit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike?: (outfitId: string) => void;
  onUnlike?: (outfitId: string) => void;
  onRate?: (outfitId: string, rating: number) => void;
  onComment?: (outfitId: string, content: string) => void;
  userLiked?: boolean;
  userRating?: number;
}

const SocialViewOutfitDialog = ({ 
  outfit, 
  open, 
  onOpenChange,
  onLike,
  onUnlike,
  onRate,
  onComment,
  userLiked = false,
  userRating = 0
}: SocialViewOutfitDialogProps) => {
  const [currentRating, setCurrentRating] = useState(userRating);
  const [isLiked, setIsLiked] = useState(userLiked);
  const [comment, setComment] = useState("");

  const handleLike = () => {
    if (isLiked) {
      onUnlike?.(outfit.id);
      setIsLiked(false);
    } else {
      onLike?.(outfit.id);
      setIsLiked(true);
    }
  };

  const handleRating = (rating: number) => {
    setCurrentRating(rating);
    onRate?.(outfit.id, rating);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      onComment?.(outfit.id, comment.trim());
      setComment("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupItemsByCategory = (items: typeof outfit.outfit_items) => {
    return items.reduce((acc, item) => {
      const category = item.wardrobe_items.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof outfit.outfit_items>);
  };

  const groupedItems = groupItemsByCategory(outfit.outfit_items);
  const categoryOrder = ['tops', 'outerwear', 'bottoms', 'dresses', 'shoes', 'accessories'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={outfit.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {outfit.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl text-primary">{outfit.name}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>by {outfit.profiles?.display_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(outfit.created_at), { addSuffix: true })}</span>
              </div>
              <DialogDescription className="text-base mt-2">
                {outfit.description || "A stylish outfit from the community"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{outfit._count?.likes || 0} likes</span>
              </Button>

              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {outfit._count?.comments || 0} comments
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {outfit.avg_rating ? outfit.avg_rating.toFixed(1) : '0.0'} 
                  ({outfit._count?.ratings || 0} ratings)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">Rate this outfit:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-4 w-4 ${
                      star <= currentRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Info */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {formatDate(outfit.created_at)}
            </div>
            {outfit.occasion && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1)}
              </Badge>
            )}
            {outfit.season && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                {outfit.season.charAt(0).toUpperCase() + outfit.season.slice(1)}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Comments Section (Simplified) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <Button size="sm" onClick={handleSendComment} disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Outfit Items by Category */}
          {outfit.outfit_items.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Shirt className="h-5 w-5" />
                Outfit Items ({outfit.outfit_items.length})
              </div>
              
              {categoryOrder.map(category => {
                const items = groupedItems[category];
                if (!items || items.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-3">
                    <h3 className="font-medium text-foreground capitalize">
                      {category} ({items.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((outfitItem) => (
                        <div
                          key={outfitItem.id}
                          className="bg-secondary/20 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {outfitItem.wardrobe_items.photo_url ? (
                              <ProgressiveImage
                                src={outfitItem.wardrobe_items.photo_url}
                                alt={outfitItem.wardrobe_items.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-subtle rounded-lg flex items-center justify-center text-2xl border border-border">
                                👕
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground">
                                {outfitItem.wardrobe_items.name}
                              </h4>
                              {outfitItem.wardrobe_items.color && (
                                <p className="text-sm text-muted-foreground">
                                  {outfitItem.wardrobe_items.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Show any uncategorized items */}
              {Object.keys(groupedItems).some(cat => !categoryOrder.includes(cat)) && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Other Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedItems)
                      .filter(([category]) => !categoryOrder.includes(category))
                      .flatMap(([, items]) => items)
                      .map((outfitItem) => (
                        <div
                          key={outfitItem.id}
                          className="bg-secondary/20 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {outfitItem.wardrobe_items.photo_url ? (
                              <ProgressiveImage
                                src={outfitItem.wardrobe_items.photo_url}
                                alt={outfitItem.wardrobe_items.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-subtle rounded-lg flex items-center justify-center text-2xl border border-border">
                                👕
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground">
                                {outfitItem.wardrobe_items.name}
                              </h4>
                              {outfitItem.wardrobe_items.color && (
                                <p className="text-sm text-muted-foreground">
                                  {outfitItem.wardrobe_items.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this outfit</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialViewOutfitDialog;