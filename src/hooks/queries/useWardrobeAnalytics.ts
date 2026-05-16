import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

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
  return useQuery<WardrobeAnalytics>({
    queryKey: ['wardrobe-analytics', userId],
    queryFn: () => api.get('/analytics'),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
