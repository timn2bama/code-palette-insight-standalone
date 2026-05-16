import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface OutfitWithItems {
  id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  created_at: string;
  items: {
    id: string;
    wardrobe_item: {
      id: string;
      name: string;
      category: string;
      color: string | null;
      photo_url: string | null;
    };
  }[];
}

export const useOutfits = (userId?: string) => {
  return useQuery({
    queryKey: ['outfits', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch('/api/outfits');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch outfits');
      }
      return response.json() as Promise<OutfitWithItems[]>;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOutfit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (outfit: any) => {
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outfit),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create outfit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: "Success",
        description: "Outfit created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteOutfit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/outfits?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete outfit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: "Success",
        description: "Outfit deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
