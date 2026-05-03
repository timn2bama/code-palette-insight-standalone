import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.info('Smart outfit AI function called');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }
    
    if (!weatherApiKey) {
      console.error('Weather API key not found');
      throw new Error('Weather API key not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('Invalid user authentication');
    }

    console.info('User authenticated:', user.id);

    const { location, preferences } = await req.json();
    console.info('Request data:', { location, preferences });

    if (!location?.trim()) {
      throw new Error('Location is required');
    }

    // Get weather data
    console.info('Fetching weather for location:', location);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${weatherApiKey}&units=imperial`;
    
    const weatherResponse = await fetch(weatherUrl);
    console.info('Weather API response status:', weatherResponse.status);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', errorText);
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    console.info('Weather data fetched successfully:', {
      temp: weatherData.main.temp,
      condition: weatherData.weather[0].description
    });

    // Get user's wardrobe items
    console.info('Fetching wardrobe items for user:', user.id);
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from('wardrobe_items')
      .select('id, name, category, color, brand, photo_url')
      .eq('user_id', user.id);

    if (wardrobeError) {
      console.error('Wardrobe error:', wardrobeError);
      throw new Error('Failed to fetch wardrobe items');
    }

    console.info('Wardrobe items fetched:', wardrobeItems?.length || 0, 'items');

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(JSON.stringify({
        suggestions: [],
        message: "No wardrobe items found. Please add some clothes to your wardrobe first!",
        weather: {
          temperature: weatherData.main.temp,
          condition: weatherData.weather[0].description,
          location: weatherData.name
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare wardrobe summary for AI
    const wardrobeSummary = wardrobeItems.map(item => 
      `${item.name} (${item.category}${item.color ? `, ${item.color}` : ''}${item.brand ? `, ${item.brand}` : ''})`
    ).join('\n');

    // Create AI prompt
    const aiPrompt = `You are a professional stylist AI. Based on the current weather and the user's wardrobe, suggest 3 complete outfit combinations.

WEATHER CONDITIONS:
- Temperature: ${weatherData.main.temp}°F
- Condition: ${weatherData.weather[0].description}
- Humidity: ${weatherData.main.humidity}%

USER'S WARDROBE:
${wardrobeSummary}

USER PREFERENCES: ${preferences || 'No specific preferences mentioned'}

Please suggest 3 complete outfits that:
1. Are appropriate for the weather conditions
2. Use only items from the user's wardrobe
3. Consider style, comfort, and practicality

For each outfit, provide:
- A catchy outfit name
- List of specific items from their wardrobe (use exact names)
- Brief explanation of why this outfit works for today's weather
- Style notes or tips

Respond with a JSON object with this structure:
{
  "suggestions": [
    {
      "name": "Outfit Name",
      "items": ["exact item name 1", "exact item name 2"],
      "reason": "Why this outfit works for the weather",
      "styleNotes": "Additional styling tips",
      "occasion": "work/casual/formal",
      "weatherScore": 95
    }
  ]
}

Only suggest outfits using items that actually exist in their wardrobe. Use the exact item names.`;

    console.info('Sending request to OpenAI...');
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fashion stylist. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    console.info('OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      
      // Handle quota exceeded specifically
      if (openAIResponse.status === 429) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.code === 'insufficient_quota') {
            return new Response(JSON.stringify({
              error: "AI styling is temporarily unavailable due to quota limits. Please try again later.",
              suggestions: [],
              weather: {
                temperature: weatherData.main.temp,
                condition: weatherData.weather[0].description,
                feelsLike: weatherData.main.feels_like,
                humidity: weatherData.main.humidity,
                location: weatherData.name
              },
              message: "Weather data retrieved successfully, but AI suggestions are temporarily unavailable."
            }), {
              status: 200, // Return 200 so frontend can handle gracefully
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } catch (parseError) {
          // Fall through to generic error
        }
      }
      
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.info('OpenAI response received successfully');
    
    let aiSuggestions = [];
    try {
      const content = openAIData.choices[0].message.content;
      const parsed = JSON.parse(content);
      aiSuggestions = parsed.suggestions || [];
      console.info('AI suggestions parsed successfully:', aiSuggestions.length);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback suggestions
      aiSuggestions = [{
        name: "Weather-Appropriate Casual",
        items: wardrobeItems.slice(0, 3).map(item => item.name),
        reason: "Perfect for today's weather conditions",
        styleNotes: "Simple and comfortable",
        occasion: "casual",
        weatherScore: 85
      }];
    }

    // Match AI suggestions with actual wardrobe items
    const enhancedSuggestions = aiSuggestions.map((suggestion: any, index: number) => {
      const matchedItems = suggestion.items?.map((itemName: string) => {
        const match = wardrobeItems.find(item => 
          item.name.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(item.name.toLowerCase())
        );
        return match;
      }).filter(Boolean) || [];

      return {
        id: `ai-suggestion-${index + 1}`,
        name: suggestion.name || `AI Outfit ${index + 1}`,
        items: matchedItems,
        suggestedItems: suggestion.items || [],
        reason: suggestion.reason || 'Perfect for today\'s weather',
        styleNotes: suggestion.styleNotes || '',
        occasion: suggestion.occasion || 'casual',
        weatherScore: suggestion.weatherScore || 90,
        aiGenerated: true
      };
    });

    const result = {
      suggestions: enhancedSuggestions,
      weather: {
        temperature: weatherData.main.temp,
        condition: weatherData.weather[0].description,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        location: weatherData.name
      },
      wardrobeItemsCount: wardrobeItems.length
    };

    console.info('Returning suggestions successfully:', enhancedSuggestions.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in smart-outfit-ai function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [],
      message: 'Failed to generate outfit suggestions. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});