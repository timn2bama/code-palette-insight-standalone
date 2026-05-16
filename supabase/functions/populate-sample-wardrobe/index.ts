import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('No user found')
    }

    const sampleClothing = [
      // Shirts
      { name: "Classic White Dress Shirt", category: "tops", color: "White", brand: "Brooks Brothers", photo_url: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Navy Blue Polo Shirt", category: "tops", color: "Navy", brand: "Ralph Lauren", photo_url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Black Cotton T-Shirt", category: "tops", color: "Black", brand: "Uniqlo", photo_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Red Flannel Shirt", category: "tops", color: "Red", brand: "L.L.Bean", photo_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Gray Henley Shirt", category: "tops", color: "Gray", brand: "J.Crew", photo_url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Blue Denim Shirt", category: "tops", color: "Blue", brand: "Levi's", photo_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Green Oxford Shirt", category: "tops", color: "Green", brand: "Bonobos", photo_url: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Pink Button-Down Shirt", category: "tops", color: "Pink", brand: "Charles Tyrwhitt", photo_url: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Purple Striped Shirt", category: "tops", color: "Purple", brand: "Hugo Boss", photo_url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Yellow Linen Shirt", category: "tops", color: "Yellow", brand: "Everlane", photo_url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

      // Pants  
      { name: "Dark Blue Jeans", category: "bottoms", color: "Blue", brand: "Levi's", photo_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Black Dress Pants", category: "bottoms", color: "Black", brand: "Hugo Boss", photo_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Khaki Chinos", category: "bottoms", color: "Khaki", brand: "Dockers", photo_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Gray Wool Trousers", category: "bottoms", color: "Gray", brand: "Brooks Brothers", photo_url: "https://images.unsplash.com/photo-1506629905607-d9de2c57ca53?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Navy Joggers", category: "bottoms", color: "Navy", brand: "Adidas", photo_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Brown Corduroys", category: "bottoms", color: "Brown", brand: "J.Crew", photo_url: "https://images.unsplash.com/photo-1583743089695-4b816a340f82?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "White Linen Pants", category: "bottoms", color: "White", brand: "Zara", photo_url: "https://images.unsplash.com/photo-1594723634896-f049b3fe5c54?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Green Cargo Pants", category: "bottoms", color: "Green", brand: "Carhartt", photo_url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Burgundy Dress Pants", category: "bottoms", color: "Burgundy", brand: "Calvin Klein", photo_url: "https://images.unsplash.com/photo-1506629905607-d9de2c57ca53?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Light Blue Jeans", category: "bottoms", color: "Light Blue", brand: "Gap", photo_url: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

      // Shoes
      { name: "Black Leather Oxfords", category: "shoes", color: "Black", brand: "Allen Edmonds", photo_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Brown Loafers", category: "shoes", color: "Brown", brand: "Cole Haan", photo_url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "White Sneakers", category: "shoes", color: "White", brand: "Adidas", photo_url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Navy Canvas Shoes", category: "shoes", color: "Navy", brand: "Converse", photo_url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Gray Running Shoes", category: "shoes", color: "Gray", brand: "Nike", photo_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Tan Boots", category: "shoes", color: "Tan", brand: "Timberland", photo_url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Black Dress Boots", category: "shoes", color: "Black", brand: "Thursday Boot Company", photo_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Red High-Top Sneakers", category: "shoes", color: "Red", brand: "Vans", photo_url: "https://images.unsplash.com/photo-1578116922645-3976907bf4ec?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Green Hiking Boots", category: "shoes", color: "Green", brand: "Merrell", photo_url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Blue Boat Shoes", category: "shoes", color: "Blue", brand: "Sperry", photo_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

      // Outerwear
      { name: "Black Leather Jacket", category: "outerwear", color: "Black", brand: "Schott", photo_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Navy Blazer", category: "outerwear", color: "Navy", brand: "Brooks Brothers", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Gray Wool Coat", category: "outerwear", color: "Gray", brand: "Burberry", photo_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Brown Bomber Jacket", category: "outerwear", color: "Brown", brand: "Alpha Industries", photo_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Green Field Jacket", category: "outerwear", color: "Green", brand: "Barbour", photo_url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Blue Denim Jacket", category: "outerwear", color: "Blue", brand: "Levi's", photo_url: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "White Windbreaker", category: "outerwear", color: "White", brand: "Patagonia", photo_url: "https://images.unsplash.com/photo-1578302725854-0cc25db0d8c7?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Red Puffer Jacket", category: "outerwear", color: "Red", brand: "North Face", photo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Tan Trench Coat", category: "outerwear", color: "Tan", brand: "Banana Republic", photo_url: "https://images.unsplash.com/photo-1578302725854-0cc25db0d8c7?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Charcoal Suit Jacket", category: "outerwear", color: "Charcoal", brand: "Hugo Boss", photo_url: "https://images.unsplash.com/photo-1594723634896-f049b3fe5c54?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

      // Dresses
      { name: "Little Black Dress", category: "dresses", color: "Black", brand: "Zara", photo_url: "https://images.unsplash.com/photo-1566479179817-c0cbf1be4b60?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Red Cocktail Dress", category: "dresses", color: "Red", brand: "H&M", photo_url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Blue Maxi Dress", category: "dresses", color: "Blue", brand: "Forever 21", photo_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "White Summer Dress", category: "dresses", color: "White", brand: "Mango", photo_url: "https://images.unsplash.com/photo-1583743089695-4b816a340f82?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Green Floral Dress", category: "dresses", color: "Green", brand: "Anthropologie", photo_url: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Navy Work Dress", category: "dresses", color: "Navy", brand: "Banana Republic", photo_url: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Pink Evening Dress", category: "dresses", color: "Pink", brand: "ASOS", photo_url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Gray Sweater Dress", category: "dresses", color: "Gray", brand: "Uniqlo", photo_url: "https://images.unsplash.com/photo-1578302725854-0cc25db0d8c7?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Yellow Sundress", category: "dresses", color: "Yellow", brand: "Target", photo_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { name: "Purple Midi Dress", category: "dresses", color: "Purple", brand: "COS", photo_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?ixlib=rb-4.0.3&q=80&w=400&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    ]

    // Check if user already has sample data
    const { data: existingItems } = await supabaseClient
      .from('wardrobe_items')
      .select('id, name, photo_url')
      .eq('user_id', user.id)

    // If items exist but don't have photos, update them
    if (existingItems && existingItems.length > 0) {
      const itemsWithoutPhotos = existingItems.filter(item => !item.photo_url)
      
      if (itemsWithoutPhotos.length > 0) {
        // Update existing items with photos
        for (const existingItem of itemsWithoutPhotos) {
          const sampleItem = sampleClothing.find(sample => sample.name === existingItem.name)
          if (sampleItem?.photo_url) {
            await supabaseClient
              .from('wardrobe_items')
              .update({ photo_url: sampleItem.photo_url })
              .eq('id', existingItem.id)
          }
        }
        
        return new Response(
          JSON.stringify({ 
            message: 'Updated existing items with photos',
            itemsUpdated: itemsWithoutPhotos.length 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (existingItems.length >= 10) {
        return new Response(
          JSON.stringify({ message: 'Sample wardrobe already populated with photos' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Insert sample clothing items
    const itemsToInsert = sampleClothing.map(item => ({
      ...item,
      user_id: user.id,
      wear_count: Math.floor(Math.random() * 10),
      purchase_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))

    const { error } = await supabaseClient
      .from('wardrobe_items')
      .insert(itemsToInsert)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        message: 'Sample wardrobe populated successfully',
        itemsAdded: itemsToInsert.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})