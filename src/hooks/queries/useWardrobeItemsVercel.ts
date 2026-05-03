import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
};

export const useWardrobeItems = (userId?: string) => {
  return useQuery({
    queryKey: ['wardrobe-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const headers = await getAuthHeaders();
      const response = await fetch('/api/wardrobe', { headers });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch items');
      }
      
      return response.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateWardrobeItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (item: any) => {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/wardrobe', {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items'] });
      toast({
        title: "Item added (Vercel DB)",
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
