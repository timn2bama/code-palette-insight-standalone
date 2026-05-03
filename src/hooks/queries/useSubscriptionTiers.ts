import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/utils/logger";

interface SubscriptionTier {
  id: string;
  tier_name: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
}

interface UsageStats {
  ai_recommendations: number;
  photo_uploads: number;
  outfit_generations: number;
}

export const useSubscriptionTiers = () => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    ai_recommendations: 0,
    photo_uploads: 0,
    outfit_generations: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, subscriptionStatus } = useAuth();

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      const transformedTiers: SubscriptionTier[] = (data || []).map(tier => ({
        id: tier.id,
        tier_name: tier.tier_name,
        price_monthly: tier.price_monthly || 0,
        price_yearly: tier.price_yearly || 0,
        features: tier.features,
        limits: tier.limits,
        is_active: tier.is_active || false
      }));

      setTiers(transformedTiers);

      // Determine current tier based on subscription status
      if (subscriptionStatus.subscribed && subscriptionStatus.subscription_tier) {
        const tierName = subscriptionStatus.subscription_tier;
        const current = transformedTiers.find(tier => 
          tier.tier_name.toLowerCase() === tierName.toLowerCase()
        );
        setCurrentTier(current || null);
      } else {
        const freeTier = transformedTiers.find(tier => tier.tier_name.toLowerCase() === 'free');
        setCurrentTier(freeTier || null);
      }
    } catch (error) {
      logger.error('Error fetching subscription tiers:', error);
    }
  };

  const fetchUsageStats = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('usage_type, usage_count')
        .eq('user_id', user.id)
        .gte('billing_period_start', startOfMonth.toISOString())
        .lte('billing_period_end', endOfMonth.toISOString());

      if (error) throw error;

      const stats = (data || []).reduce((acc, item) => {
        const usageType = item.usage_type as keyof UsageStats;
        const count = item.usage_count || 0;
        acc[usageType] = (acc[usageType] || 0) + count;
        return acc;
      }, {
        ai_recommendations: 0,
        photo_uploads: 0,
        outfit_generations: 0
      } as UsageStats);

      setUsageStats(stats);
    } catch (error) {
      logger.error('Error fetching usage stats:', error);
    }
  };

  const trackUsage = async (usageType: keyof UsageStats, count = 1) => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          usage_type: usageType,
          usage_count: count,
          billing_period_start: startOfMonth.toISOString(),
          billing_period_end: endOfMonth.toISOString()
        });

      if (error) throw error;
      fetchUsageStats();
    } catch (error) {
      logger.error('Error tracking usage:', error);
    }
  };

  const getRemainingUsage = (usageType: keyof UsageStats) => {
    if (!currentTier || !currentTier.limits) return 0;
    const limit = currentTier.limits[`${usageType}_per_month`] || 0;
    const used = usageStats[usageType] || 0;
    return Math.max(0, limit - used);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTiers(), fetchUsageStats()]);
      setLoading(false);
    };
    init();
  }, [user, subscriptionStatus]);

  return {
    tiers,
    currentTier,
    usageStats,
    loading,
    trackUsage,
    getRemainingUsage,
    refreshTiers: fetchTiers,
    refreshUsage: fetchUsageStats
  };
};
