import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/utils/logger";

interface WardrobeAnalytics {
  totalItems: number;
  totalValue: number;
  averageCostPerWear: number;
  mostWornItems: Array<{
    id: string;
    name: string;
    wear_count: number;
    cost_per_wear: number;
  }>;
  leastWornItems: Array<{
    id: string;
    name: string;
    wear_count: number;
    cost_per_wear: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  seasonalUsage: Array<{
    season: string;
    usage_count: number;
    top_categories: string[];
  }>;
}

interface ShoppingRecommendation {
  id: string;
  category: string;
  priority: number;
  reason: string;
  suggested_items: any;
  external_links: any;
}

export const useWardrobeAnalytics = () => {
  const [analytics, setAnalytics] = useState<WardrobeAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<ShoppingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch wardrobe items with analytics
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      if (itemsError) throw itemsError;

      // Calculate analytics
      const totalItems = items?.length || 0;
      const totalValue = items?.reduce((sum) => sum + (parseFloat('0')), 0) || 0;
      
      const itemsWithCostPerWear = items?.map(item => {
        const wearCount = item.wear_count || 0;
        return {
          ...item,
          cost_per_wear: wearCount > 0 ? (parseFloat('0') / wearCount) : 0
        };
      }) || [];

      const averageCostPerWear = itemsWithCostPerWear.length > 0
        ? itemsWithCostPerWear.reduce((sum, item) => sum + item.cost_per_wear, 0) / itemsWithCostPerWear.length
        : 0;

      // Most and least worn items
      const sortedByWear = [...itemsWithCostPerWear].sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0));
      const mostWornItems = sortedByWear.slice(0, 5).map(item => ({
        id: item.id,
        name: item.name,
        wear_count: item.wear_count || 0,
        cost_per_wear: item.cost_per_wear
      }));
      
      const leastWornItems = sortedByWear.slice(-5).reverse().map(item => ({
        id: item.id,
        name: item.name,
        wear_count: item.wear_count || 0,
        cost_per_wear: item.cost_per_wear
      }));

      // Category breakdown
      const categoryMap = items?.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { count: 0, value: 0 };
        }
        acc[item.category].count++;
        acc[item.category].value += parseFloat('0');
        return acc;
      }, {} as Record<string, { count: number; value: number }>) || {};

      const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
        category,
        count: stats.count,
        value: stats.value
      }));

      // Fetch seasonal analytics
      const { data: seasonalData } = await supabase
        .from('seasonal_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', new Date().getFullYear());

      const seasonalUsage = (seasonalData || []).map(season => ({
        season: season.season,
        usage_count: season.usage_count || 0,
        top_categories: Array.isArray(season.top_items) ? season.top_items as string[] : []
      }));

      setAnalytics({
        totalItems,
        totalValue,
        averageCostPerWear,
        mostWornItems,
        leastWornItems,
        categoryBreakdown,
        seasonalUsage
      });

      // Fetch shopping recommendations
      const { data: recData } = await supabase
        .from('shopping_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      setRecommendations((recData || []).map(item => ({
        id: item.id,
        category: item.category,
        priority: item.priority || 0,
        reason: item.reason || '',
        suggested_items: item.suggested_items,
        external_links: item.external_links
      })));

    } catch (error) {
      logger.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShoppingRecommendations = async () => {
    if (!user || !analytics) return;

    try {
      // Analyze gaps in wardrobe
      const categoryGaps = [];
      const essentialCategories = ['tops', 'bottoms', 'shoes', 'outerwear'];
      
      for (const category of essentialCategories) {
        const categoryItem = analytics.categoryBreakdown.find(c => c.category === category);
        if (!categoryItem || categoryItem.count < 3) {
          categoryGaps.push({
            category,
            priority: category === 'shoes' ? 5 : 3,
            reason: `You have only ${categoryItem?.count || 0} items in ${category}. Consider adding more variety.`
          });
        }
      }

      // Create recommendations
      for (const gap of categoryGaps) {
        await supabase.from('shopping_recommendations').insert({
          user_id: user.id,
          recommendation_type: 'gap_analysis',
          category: gap.category,
          priority: gap.priority,
          reason: gap.reason,
          suggested_items: [],
          external_links: []
        });
      }

      fetchAnalytics(); // Refresh data
    } catch (error) {
      logger.error('Error generating recommendations:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    recommendations,
    loading,
    refreshAnalytics: fetchAnalytics,
    generateShoppingRecommendations
  };
};
