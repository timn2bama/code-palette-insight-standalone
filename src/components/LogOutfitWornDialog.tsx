import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Cloud, Smile, Star, Loader2 } from 'lucide-react';
import { useOutfitLogging } from '@/hooks/useOutfitLogging';

interface LogOutfitWornDialogProps {
  outfit: {
    id: string;
    name: string;
    outfit_items: Array<{
      wardrobe_items: {
        id: string;
        name: string;
        category: string;
        color?: string;
        brand?: string;
      };
    }>;
  };
  children: React.ReactNode;
  onLogged?: () => void;
}

const OCCASIONS = ['work', 'casual', 'formal', 'party', 'date', 'sports', 'home'];
const MOOD_OPTIONS = ['confident', 'comfortable', 'stylish', 'playful', 'professional', 'relaxed', 'bold'];
const MAX_NOTES_LENGTH = 500;
const MAX_LOCATION_LENGTH = 100;

export function LogOutfitWornDialog({ outfit, children, onLogged }: LogOutfitWornDialogProps) {
  const [open, setOpen] = useState(false);
  const { logOutfitWorn, loading } = useOutfitLogging();
  
  const [formData, setFormData] = useState({
    worn_date: new Date().toISOString().split('T')[0],
    occasion: '',
    location: '',
    weather_condition: '',
    weather_temp: undefined as number | undefined,
    mood_tags: [] as string[],
    style_satisfaction: 5,
    comfort_rating: 5,
    notes: '',
  });

  const handleSubmit = async () => {
    const success = await logOutfitWorn(outfit.id, formData);
    if (success) {
      setOpen(false);
      onLogged?.();
    }
  };

  const toggleMood = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      mood_tags: prev.mood_tags.includes(mood)
        ? prev.mood_tags.filter(m => m !== mood)
        : [...prev.mood_tags, mood]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Log Wear History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-secondary/20 p-4 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Outfit</p>
            <h3 className="text-xl font-bold text-primary">{outfit.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Contains {outfit.outfit_items.length} items from your wardrobe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="worn_date">Date Worn</Label>
              <Input 
                id="worn_date" 
                type="date" 
                value={formData.worn_date}
                onChange={(e) => setFormData({...formData, worn_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select 
                value={formData.occasion} 
                onValueChange={(val) => setFormData({...formData, occasion: val})}
              >
                <SelectTrigger id="occasion">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map(occ => (
                    <SelectItem key={occ} value={occ} className="capitalize">{occ}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </Label>
              <Input 
                id="location" 
                placeholder="e.g. Office, Park, Home" 
                maxLength={MAX_LOCATION_LENGTH}
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" /> Weather
              </Label>
              <Input 
                id="weather" 
                placeholder="e.g. Sunny, 72°F" 
                value={formData.weather_condition}
                onChange={(e) => setFormData({...formData, weather_condition: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Smile className="h-4 w-4" /> How did you feel?
            </Label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(mood => (
                <Badge 
                  key={mood}
                  variant={formData.mood_tags.includes(mood) ? "default" : "outline"}
                  className="cursor-pointer capitalize py-1.5 px-3"
                  onClick={() => toggleMood(mood)}
                >
                  {mood}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4 text-fashion-gold" /> Style Satisfaction
              </Label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFormData({...formData, style_satisfaction: rating})}
                    className={`h-8 w-8 rounded-full border transition-all ${
                      formData.style_satisfaction === rating 
                        ? 'bg-primary text-white border-primary scale-110' 
                        : 'bg-transparent text-muted-foreground border-input hover:border-primary'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-blue-500" /> Comfort Rating
              </Label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFormData({...formData, comfort_rating: rating})}
                    className={`h-8 w-8 rounded-full border transition-all ${
                      formData.comfort_rating === rating 
                        ? 'bg-blue-500 text-white border-blue-500 scale-110' 
                        : 'bg-transparent text-muted-foreground border-input hover:border-blue-500'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any other details about this look?" 
              className="resize-none h-24"
              maxLength={MAX_NOTES_LENGTH}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
            <p className="text-[10px] text-right text-muted-foreground">
              {formData.notes.length}/{MAX_NOTES_LENGTH}
            </p>
          </div>

          <Button 
            className="w-full h-12 text-lg font-bold" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving...</>
            ) : "Save History"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
