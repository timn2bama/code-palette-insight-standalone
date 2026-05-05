import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Thermometer } from "lucide-react";
import { WeatherData } from "../hooks/useOutfitSuggestions";

interface WeatherDisplayProps {
  weather: WeatherData;
}

export const WeatherDisplay = ({ weather }: WeatherDisplayProps) => {
  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('clear') || lower.includes('sun')) return '☀️';
    return '🌤️';
  };

  return (
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
  );
};
