import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useWardrobeItems = (userId?: string) => {
  return useQuery({
    queryKey: ['wardrobe-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await fetch('/api/wardrobe');
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
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
      
      const response = await fetch('/api/wardrobe');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      
      // Count items per category
      const counts = data?.reduce((acc: { [key: string]: number }, item: any) => {
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
      const response = await fetch('/api/wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item');
      }
      return response.json();
    },
    onSuccess: () => {
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
      const response = await fetch(`/api/wardrobe/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }
      return response.json();
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
      const response = await fetch(`/api/wardrobe/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }
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
