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
