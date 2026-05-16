import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS: restrict to known origins. SITE_URL env var should be set to the production domain.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  Deno.env.get('SITE_URL') || '',
].filter(Boolean);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.info(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");
    
    // Get the raw body as text for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response("Missing stripe-signature header", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Initialize Stripe with webhook endpoint secret
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: Missing STRIPE_WEBHOOK_SECRET");
      return new Response("Webhook secret not configured", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response("Invalid signature", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Initialize Supabase client with service role key for database updates
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription event", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status 
        });

        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as Stripe.Customer).email;
        
        if (!customerEmail) {
          logStep("WARNING: No email found for customer", { customerId: subscription.customer });
          break;
        }

        // Determine subscription tier from price
        let subscriptionTier = "Basic";
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId);
          const amount = price.unit_amount || 0;
          
          if (amount <= 999) {
            subscriptionTier = "Basic";
          } else if (amount <= 1999) {
            subscriptionTier = "Premium";
          } else {
            subscriptionTier = "Enterprise";
          }
        }

        // Update subscription status in database
        const { error } = await supabase
          .from("subscribers")
          .upsert({
            email: customerEmail,
            stripe_customer_id: subscription.customer,
            subscribed: subscription.status === "active",
            subscription_tier: subscription.status === "active" ? subscriptionTier : null,
            subscription_end: subscription.status === "active" 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

        if (error) {
          logStep("ERROR: Failed to update subscriber", { error: error.message });
          return new Response("Database update failed", { 
            status: 500,
            headers: corsHeaders 
          });
        }

        logStep("Successfully updated subscription", { 
          email: customerEmail,
          subscribed: subscription.status === "active",
          tier: subscriptionTier 
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deletion", { subscriptionId: subscription.id });

        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as Stripe.Customer).email;
        
        if (!customerEmail) {
          logStep("WARNING: No email found for customer", { customerId: subscription.customer });
          break;
        }

        // Update subscription status to cancelled
        const { error } = await supabase
          .from("subscribers")
          .upsert({
            email: customerEmail,
            stripe_customer_id: subscription.customer,
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

        if (error) {
          logStep("ERROR: Failed to update cancelled subscription", { error: error.message });
          return new Response("Database update failed", { 
            status: 500,
            headers: corsHeaders 
          });
        }

        logStep("Successfully cancelled subscription", { email: customerEmail });
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response("Webhook processed successfully", { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Webhook processing failed", { error: errorMessage });
    return new Response("Webhook processing failed", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});