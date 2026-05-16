import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    return new Response(null, { headers: corsHeaders })
  }

  // Validate Authorization header format before passing to Supabase client.
  // This function forwards the user JWT to Supabase, which is safe ONLY because
  // Row Level Security (RLS) is enforced on all accessed tables.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing or invalid authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    const { type, data, context, language = 'en' } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user preferences for personalization
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Fetch user style preferences
    const { data: preferences } = await supabaseClient
      .from('user_style_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let prompt = ''
    let imageData = null

    if (type === 'visual') {
      // Handle image analysis
      imageData = data
      
      if (context?.task === 'clothing_analysis') {
        prompt = `Analyze this clothing item image and provide detailed information about:
        - Category and subcategory
        - Color analysis (dominant colors and full palette)
        - Pattern recognition
        - Fabric texture and material estimation
        - Style characteristics
        - Season suitability
        - Fit assessment if visible
        
        User preferences: ${JSON.stringify(preferences?.preferences || {})}
        Respond in ${language}.
        Format as detailed JSON with confidence scores.`
      } else if (context?.task === 'outfit_analysis') {
        prompt = `Analyze this outfit and provide:
        - Overall style assessment
        - Color harmony analysis
        - Occasion appropriateness
        - Improvement suggestions
        - Alternative styling options
        
        User context: ${JSON.stringify(context)}
        User preferences: ${JSON.stringify(preferences?.preferences || {})}
        Respond in ${language}.`
      }
    } else if (type === 'text') {
      if (context?.task === 'personalized_advice') {
        prompt = `${data}
        
        Consider the user's style preferences: ${JSON.stringify(preferences?.preferences || {})}
        Favorite colors: ${preferences?.favorite_colors || []}
        Style keywords: ${preferences?.style_keywords || []}
        
        Provide personalized, actionable advice in ${language}.
        Be specific and consider their personal style preferences.`
      }
    }

    // Prepare Claude API request
    const messages = []
    
    if (imageData) {
      // Extract base64 data from data URL
      const base64Data = imageData.split(',')[1]
      const mediaType = imageData.split(';')[0].split(':')[1]
      
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      })
    } else {
      messages.push({
        role: 'user',
        content: prompt
      })
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: messages,
        system: `You are an expert fashion AI assistant with advanced capabilities in visual analysis, contextual memory, and personalized responses. You provide detailed, accurate, and helpful fashion advice tailored to individual users.`
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Claude API error:', errorData)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const claudeResponse = await response.json()
    const analysisText = claudeResponse.content[0].text

    // Try to parse as JSON for structured responses
    let analysis
    let suggestions = []
    let confidence = 0.9
    let metadata = {}

    try {
      const parsed = JSON.parse(analysisText)
      analysis = parsed.analysis || analysisText
      suggestions = parsed.suggestions || []
      confidence = parsed.confidence || 0.9
      metadata = parsed.metadata || {}
    } catch {
      // If not JSON, treat as plain text
      analysis = analysisText
      // Extract suggestions from text
      const suggestionLines = analysisText.split('\n').filter(line => 
        line.includes('suggest') || line.includes('recommend') || line.includes('consider')
      )
      suggestions = suggestionLines.slice(0, 3)
    }

    // Store analysis in user's contextual memory
    await supabaseClient
      .from('user_style_preferences')
      .upsert({
        user_id: user.id,
        preferences: {
          ...preferences?.preferences,
          last_analysis: {
            timestamp: new Date().toISOString(),
            type: context?.task,
            language,
          }
        }
      })

    return new Response(
      JSON.stringify({
        analysis,
        suggestions,
        confidence,
        metadata,
        capabilities_used: {
          visual_analysis: !!imageData,
          contextual_memory: true,
          personalized_responses: true,
          multi_language: language !== 'en'
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in enhanced-claude-analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: 'Analysis temporarily unavailable',
        suggestions: [],
        confidence: 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})