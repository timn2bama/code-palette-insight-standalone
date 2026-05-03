import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Plus, Wand2 } from "lucide-react";
import { useOutfitRecommendations } from "@/hooks/useOutfitRecommendations";
import { toast } from "sonner";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  photo_url: string | null;
}

interface OutfitSuggestionsDialogProps {
  baseItem?: ClothingItem;
  children: React.ReactNode;
  onOutfitCreated?: () => void;
}

const OutfitSuggestionsDialog = ({ baseItem, children, onOutfitCreated }: OutfitSuggestionsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [creatingOutfit, setCreatingOutfit] = useState<string | null>(null);
  const { suggestions, loading, generateSuggestions, createOutfitFromSuggestion } = useOutfitRecommendations();

  useEffect(() => {
    if (open) {
      generateSuggestions(baseItem);
    }
  }, [open, baseItem, generateSuggestions]);

  const handleCreateOutfit = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion || !outfitName.trim()) return;

    setCreatingOutfit(suggestionId);
    try {
      await createOutfitFromSuggestion(suggestion, outfitName.trim());
      toast.success(`Created outfit "${outfitName}"`);
      setOpen(false);
      setOutfitName("");
      onOutfitCreated?.();
    } catch (error) {
      toast.error('Failed to create outfit');
    } finally {
      setCreatingOutfit(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Smart Outfit Suggestions
            {baseItem && <span className="text-sm font-normal text-muted-foreground">- Based on {baseItem.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Outfit Name Input */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-1 rounded-lg border">
            <Input
              placeholder="Enter outfit name to create..."
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              className="border-0 focus:ring-0"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <Wand2 className="h-8 w-8 animate-spin mx-auto mb-2 text-accent" />
              <p className="text-muted-foreground">Generating outfit suggestions...</p>
            </div>
          )}

          {/* Suggestions Grid */}
          {!loading && suggestions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">No suggestions available</h3>
              <p className="text-muted-foreground">
                Add more items to your wardrobe to get outfit suggestions
              </p>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Suggestion Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.occasion}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.season}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Match</div>
                          <div className="text-sm font-medium text-accent">
                            {suggestion.matchScore}%
                          </div>
                        </div>
                      </div>

                      {/* Outfit Items */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Items ({suggestion.items.length})</div>
                        <div className="grid grid-cols-2 gap-2">
                          {suggestion.items.map((item, index) => (
                            <div
                              key={`${suggestion.id}-${item.id}-${index}`}
                              className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg"
                            >
                              {item.photo_url ? (
                                <img
                                  src={item.photo_url}
                                  alt={item.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-subtle rounded flex items-center justify-center text-xs">
                                  👕
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {item.category}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Create Button */}
                      <Button
                        variant="gold"
                        className="w-full gap-2"
                        onClick={() => handleCreateOutfit(suggestion.id)}
                        disabled={!outfitName.trim() || creatingOutfit === suggestion.id}
                      >
                        <Plus className="h-4 w-4" />
                        {creatingOutfit === suggestion.id 
                          ? 'Creating...' 
                          : 'Create This Outfit'
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Regenerate Button */}
          {!loading && suggestions.length > 0 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => generateSuggestions(baseItem)}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate New Suggestions
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutfitSuggestionsDialog;