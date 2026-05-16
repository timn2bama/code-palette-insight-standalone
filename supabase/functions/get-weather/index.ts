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
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `weather-${clientIP}`;
    
    // Simple in-memory rate limiting (in production, use Redis or similar)
    const now = Date.now();
    const requests = globalThis.weatherRequests || new Map();
    const userRequests = requests.get(rateLimitKey) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter((time: number) => now - time < 60000);
    
    if (recentRequests.length >= 10) { // 10 requests per minute
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    recentRequests.push(now);
    requests.set(rateLimitKey, recentRequests);
    globalThis.weatherRequests = requests;

    const body = await req.json();
    const { latitude, longitude } = body;

    // Input validation
    if (!latitude || !longitude || 
        typeof latitude !== 'number' || typeof longitude !== 'number' ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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

    console.info(`Fetching weather for coordinates: ${latitude}, ${longitude}`);

    // Fetch current weather and forecast from WeatherAPI.com
    const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=6&aqi=no&alerts=no`;
    console.info(`Weather URL: ${weatherUrl.replace(apiKey, 'HIDDEN_API_KEY')}`);
    
    const weatherResponse = await fetch(weatherUrl);
    console.info(`Weather response status: ${weatherResponse.status}`);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Failed to fetch weather:', weatherResponse.status, weatherResponse.statusText, errorText);
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

    const result = {
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

    console.info('Weather data fetched successfully:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    
    // Don't expose internal errors to clients
    let errorMessage = 'Unable to fetch weather data at this time';
    if (error.message && error.message.includes('API')) {
      errorMessage = 'Weather service temporarily unavailable';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
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