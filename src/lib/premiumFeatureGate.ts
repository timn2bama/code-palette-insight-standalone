import { supabase } from '@/integrations/supabase/client';
import type { PremiumFeature, SubscriptionTier, UpgradeModalData } from '@/types/premium';
import { logger } from "@/utils/logger";

class PremiumFeatureGate {
  private featureMetadata: Record<PremiumFeature, { name: string; benefits: string[]; requiredTier: string }> = {
    ai_outfit_suggestions: {
      name: 'AI Outfit Suggestions',
      benefits: [
        'Get personalized outfit recommendations powered by AI',
        'Smart suggestions based on weather and occasion',
        'Learn your style preferences over time',
      ],
      requiredTier: 'pro',
    },
    weather_integration: {
      name: 'Weather Integration',
      benefits: [
        'See weather forecasts for your outfits',
        'Get suggestions based on temperature',
        'Plan outfits for upcoming trips',
      ],
      requiredTier: 'premium',
    },
    social_sharing: {
      name: 'Social Sharing',
      benefits: [
        'Share your outfits with the community',
        'Get feedback and likes from other users',
        'Discover trending styles',
      ],
      requiredTier: 'pro',
    },
    marketplace_access: {
      name: 'Marketplace Access',
      benefits: [
        'Buy and sell clothing items',
        'Access sustainable fashion marketplace',
        'Find unique pieces from other users',
      ],
      requiredTier: 'premium',
    },
    advanced_analytics: {
      name: 'Advanced Analytics',
      benefits: [
        'Track your wardrobe usage patterns',
        'See cost-per-wear analytics',
        'Identify underutilized items',
        'Get personalized insights',
      ],
      requiredTier: 'premium',
    },
    personal_stylist: {
      name: 'Personal Stylist',
      benefits: [
        'Schedule 1-on-1 consultations with professional stylists',
        'Get personalized style advice',
        'Wardrobe audit and recommendations',
      ],
      requiredTier: 'enterprise',
    },
    unlimited_wardrobe: {
      name: 'Unlimited Wardrobe Items',
      benefits: [
        'Add unlimited items to your wardrobe',
        'No storage limits',
        'Perfect for fashion enthusiasts',
      ],
      requiredTier: 'premium',
    },
    sustainability_tracking: {
      name: 'Sustainability Tracking',
      benefits: [
        'Track the carbon footprint of your wardrobe',
        'Get sustainability scores',
        'Make eco-conscious fashion choices',
      ],
      requiredTier: 'premium',
    },
    rental_marketplace: {
      name: 'Rental Marketplace',
      benefits: [
        'Rent designer pieces for special occasions',
        'List your items for rent',
        'Earn money from your wardrobe',
      ],
      requiredTier: 'premium',
    },
    team_collaboration: {
      name: 'Team Collaboration',
      benefits: [
        'Share wardrobes with team members',
        'Collaborative outfit planning',
        'Perfect for stylists and fashion teams',
      ],
      requiredTier: 'enterprise',
    },
  };

  async checkFeatureAccess(userId: string, feature: PremiumFeature): Promise<boolean> {
    try {
      // Get user's subscription
      const { data: subscription } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscribed, subscription_end')
        .eq('user_id', userId)
        .single();

      if (!subscription || !subscription.subscribed) {
        return false;
      }

      // Check if subscription is still active
      if (subscription.subscription_end && new Date(subscription.subscription_end) < new Date()) {
        return false;
      }

      // Get tier details
      const { data: tier } = await supabase
        .from('subscription_tiers')
        .select('features, tier_name')
        .eq('tier_name', subscription.subscription_tier || 'free')
        .eq('is_active', true)
        .single();

      if (!tier) {
        return false;
      }

      // Check if feature is included in the tier
      const tierFeatures = tier.features as PremiumFeature[];
      return tierFeatures.includes(feature);
    } catch (error) {
      logger.error('Error checking feature access:', error);
      return false;
    }
  }

  async checkUsageLimit(userId: string, usageType: 'ai_recommendations' | 'photo_uploads' | 'outfit_generations'): Promise<{ allowed: boolean; remaining: number | null }> {
    try {
      // Get user's subscription and tier
      const { data: subscription } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscribed')
        .eq('user_id', userId)
        .single();

      if (!subscription || !subscription.subscribed) {
        // Free tier - very limited
        const freeLimit = usageType === 'ai_recommendations' ? 5 : 3;
        const usage = await this.getCurrentUsage(userId, usageType);
        return {
          allowed: usage < freeLimit,
          remaining: Math.max(0, freeLimit - usage),
        };
      }

      const { data: tier } = await supabase
        .from('subscription_tiers')
        .select('limits')
        .eq('tier_name', subscription.subscription_tier || 'free')
        .single();

      if (!tier || !tier.limits) {
        return { allowed: false, remaining: 0 };
      }

      const limits = tier.limits as Record<string, any>;
      const limit = limits[`${usageType}_per_month`];
      
      // Unlimited usage
      if (limit === -1) {
        return { allowed: true, remaining: null };
      }

      const usage = await this.getCurrentUsage(userId, usageType);
      
      return {
        allowed: usage < limit,
        remaining: Math.max(0, limit - usage),
      };
    } catch (error) {
      logger.error('Error checking usage limit:', error);
      return { allowed: false, remaining: 0 };
    }
  }

  private async getCurrentUsage(userId: string, usageType: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data } = await supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('usage_type', usageType)
      .gte('billing_period_start', startOfMonth.toISOString())
      .lte('billing_period_end', endOfMonth.toISOString());

    return data?.reduce((sum, item) => sum + (item.usage_count || 0), 0) || 0;
  }

  async getUpgradePromptData(userId: string, feature: PremiumFeature): Promise<UpgradeModalData> {
    const metadata = this.featureMetadata[feature];
    
    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscribers')
      .select('subscription_tier')
      .eq('user_id', userId)
      .maybeSingle();

    const currentTier = subscription?.subscription_tier || 'free';

    // Get recommended tier for this feature
    const { data: tiers } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    const recommendedTierData = tiers?.find(tier => {
      const features = tier.features as PremiumFeature[];
      return features.includes(feature);
    });

    // Map to SubscriptionTier type
    const recommendedTier = recommendedTierData ? {
      ...recommendedTierData,
      name: recommendedTierData.tier_name,
      features: recommendedTierData.features as PremiumFeature[],
      limits: recommendedTierData.limits as any,
      advanced_analytics: (recommendedTierData.limits as any)?.advanced_analytics || false,
      personal_stylist: (recommendedTierData.limits as any)?.personal_stylist || false,
    } as SubscriptionTier : null;

    // Check trial eligibility
    const trialAvailable = await this.checkTrialEligibility(userId);

    return {
      feature,
      featureName: metadata.name,
      benefits: metadata.benefits,
      currentTier,
      recommendedTier,
      trialAvailable,
    };
  }

  private async checkTrialEligibility(userId: string): Promise<boolean> {
    // Check if user has ever had a paid subscription
    const { data } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', userId)
      .eq('subscribed', true);

    // Eligible for trial if never subscribed
    return !data || data.length === 0;
  }

  getFeatureBenefits(feature: PremiumFeature): string[] {
    return this.featureMetadata[feature]?.benefits || [];
  }
}

export const premiumFeatureGate = new PremiumFeatureGate();
