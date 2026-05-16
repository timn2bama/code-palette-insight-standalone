import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS: restrict to known origins. SITE_URL env var should be set to the production domain.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  Deno.env.get('SITE_URL') || '',
].filter(Boolean);

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `weather-multiple-${clientIP}`;
    const now = Date.now();
    const requests = globalThis.weatherMultipleRequests || new Map();
    const userRequests = requests.get(rateLimitKey) || [];
    const recentRequests = userRequests.filter((time: number) => now - time < 60000);
    
    if (recentRequests.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    recentRequests.push(now);
    requests.set(rateLimitKey, recentRequests);
    globalThis.weatherMultipleRequests = requests;

    const { locations } = await req.json();
    
    // Input validation
    if (!Array.isArray(locations) || locations.length === 0 || locations.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid locations array. Must be 1-10 locations.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate each location
    for (const loc of locations) {
      if (!loc.latitude || !loc.longitude || 
          typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number' ||
          loc.latitude < -90 || loc.latitude > 90 || 
          loc.longitude < -180 || loc.longitude > 180) {
        return new Response(
          JSON.stringify({ error: 'Invalid coordinates in locations array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const apiKey = Deno.env.get('WEATHERAPI_KEY');
    
    if (!apiKey) {
      console.error('WEATHERAPI_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

          console.info(`Fetching weather for ${locations.length} locations`);
          console.info(`API Key present: ${apiKey ? 'Yes' : 'No'}`);
          console.info(`API Key length: ${apiKey ? apiKey.length : 0}`);

          // Fetch weather for all locations in parallel
          const weatherPromises = locations.map(async (location: { latitude: number; longitude: number; name?: string }) => {
            try {
              console.info(`Fetching weather for ${location.name}: ${location.latitude}, ${location.longitude}`);
              
              // Fetch weather data from WeatherAPI.com
              const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location.latitude},${location.longitude}&days=6&aqi=no&alerts=no`;
              console.info(`URL for ${location.name}: ${weatherUrl.replace(apiKey, 'HIDDEN_API_KEY')}`);
              
              const weatherResponse = await fetch(weatherUrl);
              console.info(`Response status for ${location.name}: ${weatherResponse.status}`);
              
              if (!weatherResponse.ok) {
                const errorText = await weatherResponse.text();
                console.error(`Failed to fetch weather for ${location.name || 'location'}:`, weatherResponse.status, weatherResponse.statusText, errorText);
                throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
              }
        
        const weatherData = await weatherResponse.json();

        // Process forecast data to get daily forecasts
        const dailyForecasts = [];
        
        // Skip today and get next 5 days
        for (let i = 1; i < Math.min(weatherData.forecast.forecastday.length, 6); i++) {
          const day = weatherData.forecast.forecastday[i];
          const date = new Date(day.date);
          
          dailyForecasts.push({
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            high: Math.round(day.day.maxtemp_f),
            low: Math.round(day.day.mintemp_f),
            condition: day.day.condition.text,
            icon: getWeatherIcon(day.day.condition.text),
          });
        }

        return {
          location: location.name || weatherData.location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          current: {
            temperature: Math.round(weatherData.current.temp_f),
            condition: weatherData.current.condition.text,
            humidity: weatherData.current.humidity,
            windSpeed: Math.round(weatherData.current.wind_mph),
            icon: getWeatherIcon(weatherData.current.condition.text),
            city: weatherData.location.name,
          },
          forecast: dailyForecasts,
        };
      } catch (error) {
        console.error(`Error fetching weather for ${location.name || 'location'}:`, error);
        return {
          location: location.name || 'Unknown',
          latitude: location.latitude,
          longitude: location.longitude,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(weatherPromises);
    console.info(`Weather data fetched for ${results.length} locations`);

    return new Response(
      JSON.stringify({ locations: results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-weather-multiple function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
  };
  
  return iconMap[condition] || '🌤️';
}