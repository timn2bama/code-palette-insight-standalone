import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceItem } from '@/types';
import api from '@/lib/api';

export const useMarketplaceItems = () => {
  return useQuery<MarketplaceItem[]>({
    queryKey: ['marketplace-items'],
    queryFn: () => api.get('/marketplace'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMarketplaceListing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (item: Partial<MarketplaceItem>) => api.post('/marketplace', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      toast({
        title: "Success",
        description: "Listing created successfully.",
      });
    },
  });
};
