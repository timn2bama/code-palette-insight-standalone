import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from "@/utils/logger";

export interface SocialOutfit {
  id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  is_public: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  outfit_items: {
    id: string;
    wardrobe_items: {
      id: string;
      name: string;
      category: string;
      color: string | null;
      photo_url: string | null;
    };
  }[];
  _count?: {
    likes: number;
    comments: number;
    ratings: number;
  };
  user_liked?: boolean;
  user_rating?: number;
  avg_rating?: number;
}

export function useSocialOutfits() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPublicOutfits = useCallback(async (limit = 20, offset = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          id,
          name,
          description,
          occasion,
          season,
          is_public,
          created_at,
          user_id,
          outfit_items(
            id,
            wardrobe_items(id, name, category, color, photo_url)
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data as SocialOutfit[];
    } catch (error) {
      logger.error('Error fetching public outfits:', error);
      toast.error('Failed to load public outfits');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOutfitPublic = useCallback(async (outfitId: string, isPublic: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('outfits')
        .update({ is_public: isPublic })
        .eq('id', outfitId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(isPublic ? 'Outfit shared publicly!' : 'Outfit made private');
      return true;
    } catch (error) {
      logger.error('Error updating outfit privacy:', error);
      toast.error('Failed to update outfit privacy');
      return false;
    }
  }, [user]);

  const likeOutfit = useCallback(async (outfitId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('outfit_likes')
        .insert({ outfit_id: outfitId, user_id: user.id });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error liking outfit:', error);
      toast.error('Failed to like outfit');
      return false;
    }
  }, [user]);

  const unlikeOutfit = useCallback(async (outfitId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('outfit_likes')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error unliking outfit:', error);
      toast.error('Failed to unlike outfit');
      return false;
    }
  }, [user]);

  const rateOutfit = useCallback(async (outfitId: string, rating: number) => {
    if (!user || rating < 1 || rating > 5) return false;

    try {
      const { error } = await supabase
        .from('outfit_ratings')
        .upsert(
          { outfit_id: outfitId, user_id: user.id, rating },
          { onConflict: 'outfit_id,user_id' }
        );

      if (error) throw error;
      toast.success('Rating submitted!');
      return true;
    } catch (error) {
      logger.error('Error rating outfit:', error);
      toast.error('Failed to submit rating');
      return false;
    }
  }, [user]);

  const addComment = useCallback(async (outfitId: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('outfit_comments')
        .insert({
          outfit_id: outfitId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      toast.success('Comment added!');
      return true;
    } catch (error) {
      logger.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    }
  }, [user]);

  const fetchOutfitComments = useCallback(async (outfitId: string) => {
    try {
      const { data, error } = await supabase
        .from('outfit_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner(display_name, avatar_url)
        `)
        .eq('outfit_id', outfitId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching comments:', error);
      return [];
    }
  }, []);

  return {
    loading,
    fetchPublicOutfits,
    toggleOutfitPublic,
    likeOutfit,
    unlikeOutfit,
    rateOutfit,
    addComment,
    fetchOutfitComments
  };
}