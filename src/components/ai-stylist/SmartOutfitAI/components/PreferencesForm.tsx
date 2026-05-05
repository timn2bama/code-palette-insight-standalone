import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

interface PreferencesFormProps {
  onGenerate: (location: string, preferences: string) => void;
  loading: boolean;
}

export const PreferencesForm = ({ onGenerate, loading }: PreferencesFormProps) => {
  const [location, setLocation] = useState("");
  const [preferences, setPreferences] = useState("");

  const handleSubmit = () => {
    onGenerate(location, preferences);
  };

  return (
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
          onClick={handleSubmit}
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
  );
};
