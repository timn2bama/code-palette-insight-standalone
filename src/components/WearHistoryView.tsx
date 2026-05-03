import { useEffect, useState } from 'react';
import { useOutfitLogging } from '@/hooks/useOutfitLogging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Cloud, Star } from 'lucide-react';
import { format } from 'date-fns';

export function WearHistoryView() {
  const { getWearHistory, loading } = useOutfitLogging();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getWearHistory(90);
    setHistory(data);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Outfit History (Last 90 Days)</CardTitle>
        </CardHeader>
      </Card>

      {history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No outfits logged yet. Start tracking what you wear to unlock AI insights!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {history.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(log.worn_date), 'MMM dd, yyyy')}
                    </div>
                    {log.style_satisfaction && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{log.style_satisfaction}/5</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {log.occasion && (
                      <Badge variant="secondary">
                        <MapPin className="h-3 w-3 mr-1" />
                        {log.occasion}
                      </Badge>
                    )}
                    {log.weather_condition && (
                      <Badge variant="outline">
                        <Cloud className="h-3 w-3 mr-1" />
                        {log.weather_temp}°F, {log.weather_condition}
                      </Badge>
                    )}
                  </div>

                  {log.mood_tags && log.mood_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {log.mood_tags.map((mood: string) => (
                        <Badge key={mood} variant="outline" className="text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Items Worn:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {log.items_worn && Array.isArray(log.items_worn) && log.items_worn.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm bg-muted p-2 rounded">
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
