import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { premiumFeatureGate } from '@/lib/premiumFeatureGate';
import type { PremiumFeature } from '@/types/premium';
import { logger } from "@/utils/logger";

export function usePremiumFeature(feature: PremiumFeature) {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkAccess = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setShowUpgradeModal(true);
      return false;
    }

    setIsChecking(true);
    try {
      const hasAccess = await premiumFeatureGate.checkFeatureAccess(user.id, feature);
      
      if (!hasAccess) {
        setShowUpgradeModal(true);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking feature access:', error);
      setShowUpgradeModal(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, feature]);

  const requireFeature = useCallback(async (onAllowed: () => void | Promise<void>) => {
    const hasAccess = await checkAccess();
    if (hasAccess) {
      await onAllowed();
    }
  }, [checkAccess]);

  return {
    checkAccess,
    requireFeature,
    isChecking,
    showUpgradeModal,
    setShowUpgradeModal,
  };
}

export function useUsageLimit(usageType: 'ai_recommendations' | 'photo_uploads' | 'outfit_generations') {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkLimit = useCallback(async (): Promise<{ allowed: boolean; remaining: number | null }> => {
    if (!user) {
      setShowUpgradeModal(true);
      return { allowed: false, remaining: 0 };
    }

    setIsChecking(true);
    try {
      const result = await premiumFeatureGate.checkUsageLimit(user.id, usageType);
      
      if (!result.allowed) {
        setShowUpgradeModal(true);
      }

      return result;
    } catch (error) {
      logger.error('Error checking usage limit:', error);
      return { allowed: false, remaining: 0 };
    } finally {
      setIsChecking(false);
    }
  }, [user, usageType]);

  const requireLimit = useCallback(async (onAllowed: () => void | Promise<void>) => {
    const result = await checkLimit();
    if (result.allowed) {
      await onAllowed();
    }
  }, [checkLimit]);

  return {
    checkLimit,
    requireLimit,
    isChecking,
    showUpgradeModal,
    setShowUpgradeModal,
  };
}
