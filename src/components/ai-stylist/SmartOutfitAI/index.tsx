import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useOutfitSuggestions } from "./hooks/useOutfitSuggestions";
import { WeatherDisplay } from "./components/WeatherDisplay";
import { PreferencesForm } from "./components/PreferencesForm";
import { SuggestionList } from "./components/SuggestionList";

interface SmartOutfitAIProps {
  onOutfitCreated?: () => void;
}

const SmartOutfitAI = ({ onOutfitCreated }: SmartOutfitAIProps) => {
  const [open, setOpen] = useState(false);
  const {
    loading,
    suggestions,
    weather,
    saving,
    generateSuggestions,
    saveOutfit
  } = useOutfitSuggestions(onOutfitCreated);

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
          <PreferencesForm 
            onGenerate={generateSuggestions} 
            loading={loading} 
          />

          <div className="sr-only" aria-live="polite" role="status">
            {loading && "Analyzing weather and wardrobe to generate suggestions..."}
            {!loading && suggestions.length > 0 && `Generated ${suggestions.length} outfit suggestions.`}
            {!loading && suggestions.length === 0 && weather && "No outfit suggestions could be generated."}
          </div>

          {weather && <WeatherDisplay weather={weather} />}

          <SuggestionList 
            suggestions={suggestions} 
            onSave={saveOutfit} 
            saving={saving} 
          />

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
