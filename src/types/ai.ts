/**
 * Types for AI stylist and outfit suggestion data returned by Edge Functions.
 */

export interface OutfitItem {
  id: string;
  name: string;
  category: string;
  color?: string | null;
  brand?: string | null;
  photo_url?: string | null;
}

export interface OutfitData {
  items: OutfitItem[];
  styling_notes?: string;
}

export interface WeatherContext {
  temperature: number;
  condition: string;
  feelsLike?: number;
  humidity?: number;
  location?: string;
}

export interface DailyOutfitSuggestion {
  id: string;
  suggestion_date: string;
  outfit_data: OutfitData | null;
  weather_context: WeatherContext | null;
  occasion: string | null;
  style_preference: string | null;
  ai_reasoning: string | null;
  user_feedback: string | null;
  was_worn: boolean | null;
}

export interface EventOutfitRequest {
  id: string;
  event_title: string;
  event_date: string;
  event_type: string;
  dress_code: string | null;
  status: string;
  suggested_outfits: OutfitData[] | null;
}

export interface StyleMetrics {
  [key: string]: unknown;
}

export interface StyleEvolution {
  id: string;
  tracking_date: string;
  style_metrics: StyleMetrics;
  mood_tags: string[] | null;
  confidence_level: number | null;
  insights: Record<string, unknown> | null;
}

/** Smart outfit AI suggestion (from smart-outfit-ai Edge Function) */
export interface SmartOutfitSuggestion {
  id: string;
  name: string;
  items: OutfitItem[];
  suggestedItems: string[];
  reason: string;
  styleNotes: string;
  occasion: string;
  weatherScore: number;
  aiGenerated: boolean;
}

export interface SmartOutfitResponse {
  suggestions: SmartOutfitSuggestion[];
  weather: WeatherContext;
  wardrobeItemsCount: number;
  message?: string;
}
