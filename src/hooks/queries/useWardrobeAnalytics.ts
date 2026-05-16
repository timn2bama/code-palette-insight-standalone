import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface WardrobeAnalytics {
  totalItems: number;
  totalOutfits: number;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  growth: Array<{
    month: string;
    items: number;
  }>;
}

export const useWardrobeAnalytics = (userId?: string) => {
  return useQuery({
    queryKey: ['wardrobe-analytics', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch analytics');
      }
      return response.json() as Promise<WardrobeAnalytics>;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
