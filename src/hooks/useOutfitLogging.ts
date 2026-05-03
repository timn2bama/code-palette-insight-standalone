import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sanitizeInput } from '@/lib/security';
import { logger } from "@/utils/logger";

export interface OutfitWearLog {
  outfit_id?: string;
  items_worn?: Array<{
    item_id: string;
    name: string;
    category: string;
    color?: string;
    brand?: string;
  }>;
  worn_date?: string | Date;
  location?: string;
  weather_temp?: number;
  weather_condition?: string;
  occasion?: string;
  mood_tags?: string[];
  comfort_rating?: number;
  style_satisfaction?: number;
  would_wear_again?: boolean;
  notes?: string;
}

export function useOutfitLogging() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const logOutfitWorn = useCallback(async (outfitId: string, logData: Partial<OutfitWearLog>) => {
    if (!user) {
      toast.error('Please sign in to log outfits');
      return false;
    }

    setLoading(true);
    try {
      // Sanitize all user inputs before storage
      const sanitizedData = {
        ...logData,
        notes: logData.notes ? sanitizeInput(logData.notes) : undefined,
        location: logData.location ? sanitizeInput(logData.location) : undefined,
        occasion: logData.occasion ? sanitizeInput(logData.occasion) : undefined,
        weather_condition: logData.weather_condition ? sanitizeInput(logData.weather_condition) : undefined,
      };

      // 1. Insert wear log
      // Use any to bypass strict type checking for non-existent table in types.ts
      const { data: wearLog, error: logError } = await (supabase
        .from('outfit_wear_history' as any) as any)
        .insert({
          user_id: user.id,
          outfit_id: outfitId,
          worn_date: sanitizedData.worn_date || new Date().toISOString(),
          location: sanitizedData.location,
          weather_condition: sanitizedData.weather_condition,
          weather_temp: sanitizedData.weather_temp,
          occasion: sanitizedData.occasion,
          mood_tags: sanitizedData.mood_tags,
          comfort_rating: sanitizedData.comfort_rating,
          style_satisfaction: sanitizedData.style_satisfaction,
          notes: sanitizedData.notes
        })
        .select()
        .single();

      if (logError) throw logError;

      // 2. Log individual item wears
      if (logData.items_worn && logData.items_worn.length > 0) {
        const itemLogs = logData.items_worn.map(item => ({
          user_id: user.id,
          wardrobe_item_id: item.item_id,
          wear_history_id: wearLog.id,
          worn_date: sanitizedData.worn_date || new Date().toISOString()
        }));

        const { error: itemsError } = await (supabase
          .from('wardrobe_item_wear_history' as any) as any)
          .insert(itemLogs);

        if (itemsError) throw itemsError;

        // 3. Update wear counts on items
        for (const item of logData.items_worn) {
          const { data: currentItem } = await supabase
            .from('wardrobe_items')
            .select('wear_count')
            .eq('id', item.item_id)
            .single();
            
          await supabase
            .from('wardrobe_items')
            .update({ 
              wear_count: ((currentItem as any)?.wear_count || 0) + 1,
              last_worn: (sanitizedData.worn_date || new Date().toISOString()) as string
            })
            .eq('id', item.item_id);
        }
      }

      // 4. Update last worn on outfit
      await (supabase
        .from('outfits')
        .update({ last_worn_at: sanitizedData.worn_date || new Date().toISOString() } as any)
        .eq('id', outfitId));

      toast.success('Outfit wear history logged successfully!');
      return true;
    } catch (error: any) {
      logger.error('Error logging outfit wear:', error);
      toast.error(`Failed to log history: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteWearHistory = useCallback(async (historyId: string) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('outfit_wear_history' as any) as any)
        .delete()
        .eq('id', historyId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('History entry deleted');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete history');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getWearHistory = useCallback(async (days = 90) => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await (supabase
        .from('outfit_wear_history' as any) as any)
        .select('*')
        .eq('user_id', user.id)
        .gte('worn_date', startDate.toISOString())
        .order('worn_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching wear history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { logOutfitWorn, deleteWearHistory, deleteLog: deleteWearHistory, getWearHistory, loading };
}
