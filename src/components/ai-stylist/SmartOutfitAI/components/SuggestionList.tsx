import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, Lightbulb, Loader2, Save, Shirt } from "lucide-react";
import { AISuggestion } from "../hooks/useOutfitSuggestions";

interface SuggestionListProps {
  suggestions: AISuggestion[];
  onSave: (suggestion: AISuggestion) => void;
  saving: string | null;
}

export const SuggestionList = ({ suggestions, onSave, saving }: SuggestionListProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Outfit Suggestions</h3>
        <Badge variant="secondary">{suggestions.length} suggestions</Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-primary">{suggestion.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.occasion}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.weatherScore}% weather match
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSave(suggestion)}
                  disabled={saving === suggestion.id}
                  className="flex-shrink-0"
                >
                  {saving === suggestion.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Shirt className="h-4 w-4" />
                  Outfit Items ({suggestion.items.length} matched)
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {suggestion.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-secondary/20 rounded p-2">
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
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category}{item.color ? ` • ${item.color}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {suggestion.suggestedItems.length > suggestion.items.length && (
                    <div className="text-xs text-muted-foreground bg-secondary/10 rounded p-2">
                      <strong>Note:</strong> Some suggested items weren't found in your wardrobe: {
                        suggestion.suggestedItems
                          .filter(item => !suggestion.items.some(wardrobeItem => 
                            wardrobeItem.name.toLowerCase().includes(item.toLowerCase())
                          ))
                          .join(', ')
                      }
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Reason & Style Notes */}
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Why this works:
                  </p>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </div>
                
                {suggestion.styleNotes && (
                  <div>
                    <p className="text-sm font-medium">Style Tips:</p>
                    <p className="text-sm text-muted-foreground">{suggestion.styleNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
