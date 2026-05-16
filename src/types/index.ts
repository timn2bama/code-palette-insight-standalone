import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schemas for runtime validation of critical data shapes
// ---------------------------------------------------------------------------

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export const WardrobeItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().nullable(),
  color: z.string().nullable(),
  photo_url: z.string().nullable(),
  description: z.string().nullable(),
  wear_count: z.number().int().min(0),
  last_worn: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const OutfitSuggestionSchema = z.object({
  id: z.string(),
  suggestion_date: z.string(),
  outfit_data: z.object({
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      color: z.string().nullable().optional(),
      brand: z.string().nullable().optional(),
      photo_url: z.string().nullable().optional(),
    })),
    styling_notes: z.string().optional(),
  }).nullable(),
  weather_context: z.object({
    temperature: z.number(),
    condition: z.string(),
  }).nullable(),
  occasion: z.string().nullable(),
  style_preference: z.string().nullable(),
  ai_reasoning: z.string().nullable(),
  user_feedback: z.string().nullable(),
  was_worn: z.boolean().nullable(),
});

// ---------------------------------------------------------------------------
// TypeScript interfaces (kept for compatibility; Zod inferred types are below)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  brand: string | null;
  color: string | null;
  photo_url: string | null;
  description: string | null;
  wear_count: number;
  last_worn: string | null;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  created_at: string;
  items: {
    id: string;
    wardrobe_item: Partial<WardrobeItem>;
  }[];
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string;
  category: string;
  brand: string | null;
  size: string | null;
  photos: string[] | null;
  sustainability_score: number;
  shipping_included: boolean;
  is_available: boolean;
  created_at: string;
}
