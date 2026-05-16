// Supabase Edge Function: reset-wardrobe
// Deletes the current user's wardrobe data: outfit_items, outfits, wardrobe_items, and stored photos
import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS: restrict to known origins. SITE_URL env var should be set to the production domain.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  Deno.env.get('SITE_URL') || '',
].filter(Boolean);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Identify the user from the JWT
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("Error getting user:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    console.info(`[reset-wardrobe] Starting deletion for user: ${userId}`);

    // 1) Collect outfit IDs for the user
    const { data: outfits, error: outfitsSelectError } = await supabase
      .from("outfits")
      .select("id")
      .eq("user_id", userId);

    if (outfitsSelectError) {
      console.error("Error selecting outfits:", outfitsSelectError);
      throw outfitsSelectError;
    }

    const outfitIds = (outfits ?? []).map((o) => o.id);
    let deletedOutfitItems = 0;

    // 2) Delete outfit_items referencing those outfits
    if (outfitIds.length > 0) {
      const { count, error: oiError } = await supabase
        .from("outfit_items")
        .delete({ count: "exact" })
        .in("outfit_id", outfitIds);

      if (oiError) {
        console.error("Error deleting outfit_items:", oiError);
        throw oiError;
      }
      deletedOutfitItems = count ?? 0;
    }

    // 3) Delete outfits for the user
    const { count: outfitsDeleted, error: outfitsDeleteError } = await supabase
      .from("outfits")
      .delete({ count: "exact" })
      .eq("user_id", userId);

    if (outfitsDeleteError) {
      console.error("Error deleting outfits:", outfitsDeleteError);
      throw outfitsDeleteError;
    }

    // 4) Delete wardrobe_items for the user
    const { count: wardrobeDeleted, error: wardrobeDeleteError } = await supabase
      .from("wardrobe_items")
      .delete({ count: "exact" })
      .eq("user_id", userId);

    if (wardrobeDeleteError) {
      console.error("Error deleting wardrobe items:", wardrobeDeleteError);
      throw wardrobeDeleteError;
    }

    // 5) Remove any photos stored under the user's folder in the public bucket
    const storage = supabase.storage.from("wardrobe-photos");
    let removedPhotos = 0;

    try {
      // List top-level files in the user's folder (most apps store files flat: `${userId}/file`)
      const { data: files, error: listError } = await storage.list(userId, { limit: 1000 });
      if (listError) {
        console.warn("Storage list warning:", listError.message);
      } else if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        const { data: removed, error: rmError } = await storage.remove(paths);
        if (rmError) {
          console.warn("Storage remove warning:", rmError.message);
        } else {
          removedPhotos = removed?.length ?? 0;
        }
      }
    } catch (e) {
      console.warn("Storage operation failed:", e);
    }

    const result = {
      deleted: {
        outfit_items: deletedOutfitItems,
        outfits: outfitsDeleted ?? 0,
        wardrobe_items: wardrobeDeleted ?? 0,
        photos: removedPhotos,
      },
    };

    console.info("[reset-wardrobe] Completed:", result);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[reset-wardrobe] Error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
