import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Star, Eye, Shirt } from 'lucide-react';
import { SocialOutfit } from '@/hooks/useSocialOutfits';
import ProgressiveImage from '@/components/ProgressiveImage';
import { formatDistanceToNow } from 'date-fns';

interface SocialOutfitCardProps {
  outfit: SocialOutfit;
  onLike: (outfitId: string) => void;
  onUnlike: (outfitId: string) => void;
  onRate: (outfitId: string, rating: number) => void;
  onComment: (outfitId: string) => void;
  onView: (outfit: SocialOutfit) => void;
  userLiked?: boolean;
  userRating?: number;
}

const SocialOutfitCard = ({
  outfit,
  onLike,
  onUnlike,
  onRate,
  onComment,
  onView,
  userLiked = false,
  userRating = 0
}: SocialOutfitCardProps) => {
  const [currentRating, setCurrentRating] = useState(userRating);
  const [isLiked, setIsLiked] = useState(userLiked);

  const handleLike = () => {
    if (isLiked) {
      onUnlike(outfit.id);
      setIsLiked(false);
    } else {
      onLike(outfit.id);
      setIsLiked(true);
    }
  };

  const handleRating = (rating: number) => {
    setCurrentRating(rating);
    onRate(outfit.id, rating);
  };

  const getDisplayImage = () => {
    const itemWithImage = outfit.outfit_items.find(item => item.wardrobe_items.photo_url);
    return itemWithImage?.wardrobe_items.photo_url || null;
  };

  const displayImage = getDisplayImage();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={outfit.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {outfit.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {outfit.profiles?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(outfit.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onView(outfit)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{outfit.name}</h3>
          {outfit.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {outfit.description}
            </p>
          )}
        </div>

        {displayImage && (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <ProgressiveImage
              src={displayImage}
              alt={outfit.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {outfit.occasion && (
            <Badge variant="secondary" className="text-xs">
              {outfit.occasion}
            </Badge>
          )}
          {outfit.season && (
            <Badge variant="outline" className="text-xs">
              {outfit.season}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{outfit._count?.likes || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(outfit.id)}
              className="gap-1 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{outfit._count?.comments || 0}</span>
            </Button>

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {outfit.avg_rating ? outfit.avg_rating.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-3 w-3 ${
                    star <= currentRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shirt className="h-3 w-3" />
          <span>{outfit.outfit_items.length} items</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialOutfitCard;