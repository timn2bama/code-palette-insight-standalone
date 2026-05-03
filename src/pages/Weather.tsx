import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { ForecastCard } from "@/components/weather/ForecastCard";
import { OutfitSuggestions } from "@/components/weather/OutfitSuggestions";
import { TravelDestinations } from "@/components/weather/TravelDestinations";
import { useWeatherData } from "@/hooks/queries/useWeatherData";
import { useOutfitSuggestions } from "@/hooks/useOutfitSuggestions";
import { useTravelDestinations } from "@/hooks/useTravelDestinations";
import { logger } from "@/utils/logger";

const Weather = () => {
  const { currentWeather, forecast, fetchAllWeatherData } = useWeatherData();
  const [allWeatherData, setAllWeatherData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const weatherSuggestions = useOutfitSuggestions(currentWeather);
  const { travelDestinations, locationLoading, getCurrentLocation } = useTravelDestinations(currentWeather, allWeatherData);

  const refreshAllWeatherData = async () => {
    setRefreshing(true);
    try {
      const data = await fetchAllWeatherData();
      if (Array.isArray(data)) {
        setAllWeatherData(data);
      }
    } catch (error) {
      logger.error('Failed to refresh weather data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllWeatherData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Weather & Style</h1>
          <p className="text-muted-foreground">Smart outfit suggestions based on weather conditions</p>
          <div className="mt-4">
            <Button 
              onClick={refreshAllWeatherData}
              disabled={refreshing}
              variant="premium"
              size="lg"
            >
              {refreshing ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  Updating All Weather Data...
                </>
              ) : (
                <>
                  🔄 Refresh All Weather Data
                </>
              )}
            </Button>
          </div>
        </div>

        <WeatherCard currentWeather={currentWeather} />
        <ForecastCard forecast={forecast} />
        <OutfitSuggestions weatherSuggestions={weatherSuggestions} />
        <TravelDestinations 
          travelDestinations={travelDestinations} 
          onGetCurrentLocation={getCurrentLocation}
          locationLoading={locationLoading}
        />
      </div>
    </div>
  );
};

export default Weather;