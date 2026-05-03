import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Shirt, Palette } from "lucide-react";
import { LogOutfitWornDialog } from "@/components/LogOutfitWornDialog";

interface OutfitItem {
  id: string;
  wardrobe_items: {
    id: string;
    name: string;
    category: string;
    color: string | null;
    photo_url: string | null;
    brand?: string | null;
  } | null;
}

interface Outfit {
  id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  created_at: string;
  outfit_items: OutfitItem[];
}

interface ViewOutfitDialogProps {
  outfit: Outfit;
  children: React.ReactNode;
  onUpdate?: () => void;
}

const ViewOutfitDialog = ({ outfit, children, onUpdate }: ViewOutfitDialogProps) => {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to ensure compatibility with LogOutfitWornDialog's expected type
  const getLoggableOutfit = () => {
    return {
      id: outfit.id,
      name: outfit.name,
      outfit_items: outfit.outfit_items
        .filter(item => item.wardrobe_items !== null)
        .map(item => ({
          wardrobe_items: {
            id: item.wardrobe_items!.id,
            name: item.wardrobe_items!.name,
            category: item.wardrobe_items!.category,
            color: item.wardrobe_items!.color || undefined,
            brand: item.wardrobe_items!.brand || undefined
          }
        }))
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold text-primary">{outfit.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">{outfit.occasion || 'General'}</Badge>
                {outfit.season && <Badge variant="outline" className="capitalize">{outfit.season}</Badge>}
              </div>
            </div>
          </div>
          <DialogDescription className="text-base mt-4">
            {outfit.description || 'No description provided for this outfit.'}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(outfit.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Local Style</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shirt className="h-5 w-5 text-fashion-gold" />
              Outfit Items
            </h3>
            <div className="grid gap-3">
              {outfit.outfit_items.map((item) => {
                if (!item.wardrobe_items) return null;
                const wi = item.wardrobe_items;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors border border-transparent hover:border-secondary">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                      {wi.photo_url ? (
                        <img 
                          src={wi.photo_url} 
                          alt={wi.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                          <Shirt className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary truncate">{wi.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          {wi.category}
                        </Badge>
                        {wi.color && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Palette className="h-3 w-3" />
                            <span>{wi.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <LogOutfitWornDialog outfit={getLoggableOutfit()} onLogged={onUpdate}>
              <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white font-bold h-12 rounded-xl shadow-lg">
                LOG OUTFIT AS WORN TODAY
              </Button>
            </LogOutfitWornDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOutfitDialog;
