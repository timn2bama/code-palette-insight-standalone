import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Outfit } from '@/types';
import api from '@/lib/api';

export const useOutfits = (userId?: string) => {
  return useQuery<Outfit[]>({
    queryKey: ['outfits', userId],
    queryFn: () => api.get('/outfits'),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOutfit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (outfit: Partial<Outfit> & { items: string[] }) => api.post('/outfits', outfit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: "Success",
        description: "Outfit created successfully.",
      });
    },
  });
};

export const useDeleteOutfit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/outfits?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: "Success",
        description: "Outfit deleted successfully.",
      });
    },
  });
};
