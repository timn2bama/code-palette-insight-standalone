/**
 * Upload limits management hook
 * 
 * Manages wardrobe item upload limits based on user subscription tier.
 * Free users have a limit of 4 items per category, while premium users have unlimited uploads.
 * 
 * @module hooks/useUploadLimits
 */

import { useSubscriptionQuery } from "@/hooks/queries/useAuth";
import { useWardrobeItemsByCategory } from "@/hooks/queries/useWardrobeItems";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Upload limits configuration
 */
interface UploadLimits {
  maxUploadsPerCategory: number;
  isUnlimited: boolean;
}

interface CategoryCount {
  category: string;
  count: number;
}

/**
 * Hook to manage wardrobe item upload limits
 * 
 * @returns Upload limits, category counts, and utility functions
 * 
 * @example
 * ```typescript
 * const { canUploadToCategory, getCategoryUsage, uploadLimits } = useUploadLimits();
 * 
 * // Check if user can upload to a category
 * if (canUploadToCategory('tops')) {
 *   // Allow upload
 * } else {
 *   // Show upgrade prompt
 * }
 * 
 * // Get category usage
 * const { used, limit } = getCategoryUsage('tops');
 * console.log(`Used ${used} of ${limit} slots`);
 * ```
 */
export const useUploadLimits = () => {
  const { user } = useAuth();
  
  // Use React Query for subscription data
  const { data: subscriptionData } = useSubscriptionQuery(user?.id);
  const { data: categoryCounts = [], isLoading: categoryCountsLoading } = useWardrobeItemsByCategory(user?.id) as unknown as { data: CategoryCount[], isLoading: boolean };
  
  const isSubscribed = subscriptionData?.subscribed || false;
  const loading = categoryCountsLoading;
  
  const uploadLimits: UploadLimits = {
    maxUploadsPerCategory: isSubscribed ? Infinity : 4,
    isUnlimited: isSubscribed
  };

  const canUploadToCategory = (category: string): boolean => {
    if (uploadLimits.isUnlimited) return true;
    
    const categoryCount = categoryCounts.find(c => c.category === category)?.count || 0;
    return categoryCount < uploadLimits.maxUploadsPerCategory;
  };

  const getCategoryUsage = (category: string): { used: number; limit: number } => {
    const used = categoryCounts.find(c => c.category === category)?.count || 0;
    return {
      used,
      limit: uploadLimits.isUnlimited ? Infinity : uploadLimits.maxUploadsPerCategory
    };
  };

  return {
    uploadLimits,
    categoryCounts,
    loading,
    canUploadToCategory,
    getCategoryUsage,
    refreshLimits: () => {}, // No longer needed with React Query auto-refetching
  };
};