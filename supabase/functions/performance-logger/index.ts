import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metric, custom_metric, user_id, session_id } = await req.json();

    // Log performance data
    if (metric) {
      const performanceData = {
        ...metric,
        user_id,
        session_id,
        timestamp: new Date().toISOString()
      };

      console.info('Performance Metric:', JSON.stringify(performanceData, null, 2));

      // In production, you would store this in a time-series database
      // or analytics service like Google Analytics, Mixpanel, etc.
      
      // Check for performance issues
      if (metric.rating === 'poor') {
        console.warn(`Poor performance detected - ${metric.name}: ${metric.value}`);
        
        // Could trigger alerts here for critical performance issues
        if (metric.name === 'LCP' && metric.value > 4000) {
          console.error('Critical LCP performance issue detected');
        }
      }
    }

    // Log custom metrics
    if (custom_metric) {
      const customData = {
        ...custom_metric,
        user_id,
        timestamp: new Date().toISOString()
      };

      console.info('Custom Metric:', JSON.stringify(customData, null, 2));
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in performance-logger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});