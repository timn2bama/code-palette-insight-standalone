import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// CORS: restrict to known origins. SITE_URL env var should be set to the production domain.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  Deno.env.get('SITE_URL') || '',
].filter(Boolean);

interface SecurityEvent {
  event_type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_input';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
}

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
    // Rate limiting - basic protection
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { event_type, user_id, details }: SecurityEvent = await req.json();

    // Validate input
    if (!event_type || !details) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user agent and IP from headers
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Log security event
    const logEntry = {
      event_type,
      user_id: user_id || null,
      ip_address: clientIP,
      user_agent: userAgent,
      details,
      timestamp: new Date().toISOString(),
      severity: getSeverityLevel(event_type)
    };

    console.info('Security Event:', JSON.stringify(logEntry, null, 2));

    // Check for patterns that might indicate an attack
    await checkForSuspiciousPatterns(supabase, logEntry);

    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in security-logger function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getSeverityLevel(eventType: string): 'low' | 'medium' | 'high' {
  switch (eventType) {
    case 'failed_login':
      return 'medium';
    case 'suspicious_activity':
      return 'high';
    case 'rate_limit_exceeded':
      return 'medium';
    case 'invalid_input':
      return 'low';
    default:
      return 'low';
  }
}

async function checkForSuspiciousPatterns(supabase: any, logEntry: any) {
  try {
    // Check for multiple failed logins from same IP in last hour
    if (logEntry.event_type === 'failed_login') {
      // In a real implementation, you would store these logs in a table
      // and query for patterns. For now, just log the potential issue.
      console.warn(`Failed login attempt from IP: ${logEntry.ip_address}`);
    }

    // Check for rate limiting violations
    if (logEntry.event_type === 'rate_limit_exceeded') {
      console.warn(`Rate limit exceeded from IP: ${logEntry.ip_address}`);
    }
  } catch (error) {
    console.error('Error checking suspicious patterns:', error);
  }
}