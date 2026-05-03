import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  MapPin, 
  Thermometer, 
  Cloud, 
  Shirt, 
  Lightbulb,
  Heart,
  Save,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  photo_url: string | null;
  brand?: string | null;
}

interface AISuggestion {
  id: string;
  name: string;
  items: WardrobeItem[];
  suggestedItems: string[];
  reason: string;
  styleNotes: string;
  occasion: string;
  weatherScore: number;
  aiGenerated: boolean;
}

interface WeatherData {
  temperature: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  location: string;
}

interface SmartOutfitAIProps {
  onOutfitCreated?: () => void;
}

const SmartOutfitAI = ({ onOutfitCreated }: SmartOutfitAIProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [preferences, setPreferences] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const { user } = useAuth();

  const handleGenerateSuggestions = async () => {
    if (!location.trim()) {
      toast.error("Please enter your location");
      return;
    }

    logger.info('Starting Smart AI request...', { location, preferences, userId: user?.id });
    setLoading(true);
    
    try {
      logger.info('Calling supabase function...');
      const { data, error } = await supabase.functions.invoke('smart-outfit-ai', {
        body: {
          location: location.trim(),
          preferences: preferences.trim()
        }
      });

      logger.info('Function response:', { data, error });

      if (error) {
        logger.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        logger.error('Function returned error:', data.error);
        
        // Check if this is a quota limit error
        if (data.error.includes('quota limits') || data.error.includes('temporarily unavailable')) {
          toast.error("AI styling is temporarily unavailable. Please try again later.");
          setWeather(data.weather);
          setSuggestions([]);
          return;
        }
        
        throw new Error(data.error);
      }

      if (data.success && data.message?.includes('test')) {
        // This is a test response, show appropriate message
        toast.info("Smart AI is initializing. Please try again in a moment.");
        setSuggestions([]);
        return;
      }

      if (data.suggestions && data.suggestions.length > 0) {
        logger.info('Success! Got suggestions:', data.suggestions.length);
        setSuggestions(data.suggestions);
        setWeather(data.weather);
        toast.success(`Generated ${data.suggestions.length} AI outfit suggestions!`);
      } else {
        logger.info('No suggestions generated:', data);
        toast.error(data.message || "No suggestions could be generated");
        setSuggestions([]);
      }
    } catch (error: any) {
      logger.error('Error in handleGenerateSuggestions:', error);
      toast.error(`Failed to generate outfit suggestions: ${error.message}`);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async (suggestion: AISuggestion) => {
    if (!user) return;

    setSaving(suggestion.id);
    try {
      // Create the outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: suggestion.name,
          description: `${suggestion.reason}\n\nStyle Notes: ${suggestion.styleNotes}`,
          occasion: suggestion.occasion,
          season: getSeasonFromWeather(weather?.temperature || 70)
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Add matched items to the outfit
      if (suggestion.items.length > 0) {
        const outfitItems = suggestion.items.map(item => ({
          outfit_id: outfit.id,
          wardrobe_item_id: item.id
        }));

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItems);

        if (itemsError) throw itemsError;
      }

      toast.success(`Saved "${suggestion.name}" to your outfits!`);
      onOutfitCreated?.();
    } catch (error) {
      logger.error('Error saving outfit:', error);
      toast.error('Failed to save outfit');
    } finally {
      setSaving(null);
    }
  };

  const getSeasonFromWeather = (temp: number): string => {
    if (temp >= 75) return 'summer';
    if (temp >= 60) return 'spring';
    if (temp >= 45) return 'fall';
    return 'winter';
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('clear') || lower.includes('sun')) return '☀️';
    return '🌤️';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          Smart AI Outfit Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Smart AI Outfit Suggestions
          </DialogTitle>
          <DialogDescription>
            Let AI analyze the weather and your wardrobe to suggest perfect outfits for today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Get Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Location (City, State or Country)
                </label>
                <Input
                  placeholder="e.g., New York, NY or London, UK"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Style Preferences (Optional)
                </label>
                <Textarea
                  placeholder="e.g., I prefer casual looks, I have an important meeting today, I like layering..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <Button 
                onClick={handleGenerateSuggestions}
                disabled={loading || !location.trim()}
                className="w-full"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Weather & Wardrobe...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ARIA Live region for screen readers */}
          <div className="sr-only" aria-live="polite" role="status">
            {loading && "Analyzing weather and wardrobe to generate suggestions..."}
            {!loading && suggestions.length > 0 && `Generated ${suggestions.length} outfit suggestions.`}
            {!loading && suggestions.length === 0 && weather && "No outfit suggestions could be generated."}
          </div>

          {/* Weather Section */}
          {weather && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Current Weather in {weather.location}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getWeatherIcon(weather.condition)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-2xl font-semibold">{Math.round(weather.temperature)}°F</span>
                        <span className="text-muted-foreground">
                          (feels like {Math.round(weather.feelsLike)}°F)
                        </span>
                      </div>
                      <p className="text-muted-foreground capitalize">{weather.condition}</p>
                      <p className="text-sm text-muted-foreground">Humidity: {weather.humidity}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
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
                          onClick={() => handleSaveOutfit(suggestion)}
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
          )}

          {/* Empty State */}
          {!loading && suggestions.length === 0 && weather && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Suggestions Generated</h3>
              <p className="text-muted-foreground mb-4">
                Make sure you have items in your wardrobe and try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartOutfitAI;