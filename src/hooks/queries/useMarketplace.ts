import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string;
  brand: string | null;
  category: string;
  size: string;
  photos: any;
  sustainability_score: number;
  shipping_included: boolean;
  created_at: string;
  wardrobe_item?: any;
}

export const useMarketplaceItems = () => {
  return useQuery({
    queryKey: ['marketplace-items'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch marketplace items');
      }
      return response.json() as Promise<MarketplaceItem[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMarketplaceListing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: any) => {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create listing');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      toast({
        title: "Success",
        description: "Listing created successfully.",
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
