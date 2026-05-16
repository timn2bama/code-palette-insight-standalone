import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { user_id } = await req.json();

    // Get user's wardrobe items
    const { data: wardrobeItems, error: wardrobeError } = await supabaseClient
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user_id);

    if (wardrobeError) throw wardrobeError;

    const carbonFootprintData = [];

    for (const item of wardrobeItems || []) {
      // Calculate carbon footprint based on category and materials
      const categoryMultipliers = {
        'tops': { manufacturing: 8, transportation: 2, usage: 0.5, disposal: 1 },
        'bottoms': { manufacturing: 12, transportation: 3, usage: 0.8, disposal: 2 },
        'dresses': { manufacturing: 15, transportation: 4, usage: 1.2, disposal: 2.5 },
        'shoes': { manufacturing: 20, transportation: 5, usage: 0.3, disposal: 3 },
        'accessories': { manufacturing: 5, transportation: 1, usage: 0.1, disposal: 0.5 },
        'outerwear': { manufacturing: 25, transportation: 6, usage: 1.5, disposal: 4 }
      };

      const multiplier = categoryMultipliers[item.category] || categoryMultipliers['tops'];
      
      const carbonData = {
        wardrobe_item_id: item.id,
        user_id: user_id,
        manufacturing_impact: multiplier.manufacturing,
        transportation_impact: multiplier.transportation,
        usage_impact: multiplier.usage * (item.wear_count || 1),
        disposal_impact: multiplier.disposal,
      };

      carbonFootprintData.push(carbonData);
    }

    // Insert/update carbon footprint data
    const { error: insertError } = await supabaseClient
      .from('carbon_footprint_items')
      .upsert(carbonFootprintData, {
        onConflict: 'wardrobe_item_id',
        ignoreDuplicates: false
      });

    if (insertError) throw insertError;

    // Calculate sustainability metrics
    const totalFootprint = carbonFootprintData.reduce((sum, item) => 
      sum + item.manufacturing_impact + item.transportation_impact + item.usage_impact + item.disposal_impact, 0
    );

    const { error: metricsError } = await supabaseClient
      .from('sustainability_metrics')
      .insert({
        user_id: user_id,
        metric_type: 'carbon_footprint',
        value: totalFootprint,
        unit: 'kg_co2',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        source_data: { calculation_method: 'category_based', items_count: wardrobeItems?.length || 0 }
      });

    if (metricsError) throw metricsError;

    return new Response(
      JSON.stringify({ 
        success: true,
        total_footprint: totalFootprint,
        items_calculated: wardrobeItems?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});