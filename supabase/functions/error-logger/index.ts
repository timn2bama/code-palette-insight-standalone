import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLogEntry {
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent: string;
  timestamp: number;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { error } = await req.json();

    // Log error with severity-based formatting
    const logLevel = error.severity === 'critical' ? 'error' : 
                    error.severity === 'high' ? 'warn' : 'info';

    const logEntry = {
      timestamp: new Date(error.timestamp).toISOString(),
      severity: error.severity,
      message: error.message,
      url: error.url,
      userId: error.userId || 'anonymous',
      userAgent: error.userAgent,
      stack: error.stack,
      context: error.context,
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber
    };

    if (logLevel === 'error') {
      console.error('Error Log:', JSON.stringify(logEntry, null, 2));
    } else if (logLevel === 'warn') {
      console.warn('Error Log:', JSON.stringify(logEntry, null, 2));
    } else {
      console.info('Error Log:', JSON.stringify(logEntry, null, 2));
    }

    // In production, you would:
    // 1. Store in error tracking database (Sentry, Bugsnag, etc.)
    // 2. Send alerts for critical errors
    // 3. Aggregate errors for trend analysis
    // 4. Create dashboards for error monitoring

    // Check for critical errors that need immediate attention
    if (error.severity === 'critical') {
      console.error('CRITICAL ERROR DETECTED - IMMEDIATE ATTENTION REQUIRED');
      
      // Could trigger alerts here:
      // - Send to Slack/Discord webhook
      // - Email development team
      // - Create incident in monitoring system
    }

    // Check for common error patterns
    if (error.message.includes('ChunkLoadError')) {
      console.warn('JavaScript chunk loading error - possible deployment issue');
    }

    if (error.message.includes('Network Error')) {
      console.warn('Network connectivity issue detected');
    }

    if (error.stack?.includes('react-router')) {
      console.warn('React Router error - possible navigation issue');
    }

    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in error-logger function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to log error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});