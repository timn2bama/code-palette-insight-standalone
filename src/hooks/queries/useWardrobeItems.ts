import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWardrobeItems = (userId?: string) => {
  return useQuery({
    queryKey: ['wardrobe-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWardrobeItemsByCategory = (userId?: string) => {
  return useQuery({
    queryKey: ['wardrobe-items-by-category', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('category')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Count items per category
      const counts = data?.reduce((acc: { [key: string]: number }, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return Object.entries(counts).map(([category, count]) => ({
        category,
        count: count as number
      }));
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateWardrobeItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch wardrobe items
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items'] });
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items-by-category'] });
      
      toast({
        title: "Item added",
        description: "Your wardrobe item has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateWardrobeItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items'] });
      toast({
        title: "Item updated",
        description: "Your wardrobe item has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteWardrobeItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items'] });
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items-by-category'] });
      
      toast({
        title: "Item deleted",
        description: "Your wardrobe item has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};