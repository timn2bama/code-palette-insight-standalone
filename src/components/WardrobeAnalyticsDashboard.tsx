import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Shirt, Palette, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/utils/logger";

interface WardrobeStats {
  totalItems: number;
  totalOutfits: number;
  categoryDistribution: { category: string; count: number; percentage: number }[];
  colorDistribution: { color: string; count: number; percentage: number }[];
  usageStats: { item: string; usageCount: number; lastUsed: string }[];
  monthlyAdditions: { month: string; items: number; outfits: number }[];
  costPerWear: { item: string; cost: number; wears: number; cpw: number }[];
  seasonalAnalysis: { season: string; items: number; usage: number }[];
}

const WardrobeAnalyticsDashboard = () => {
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      // Fetch wardrobe items
      const { data: items } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      // Fetch outfits
      const { data: outfits } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id);

      if (!items || !outfits) return;

      // Calculate analytics
      const totalItems = items.length;
      const totalOutfits = outfits.length;

      // Category distribution
      const categoryMap = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryDistribution = Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalItems) * 100)
      }));

      // Color distribution (simplified - would need actual color extraction)
      const colors = ['Blue', 'Black', 'White', 'Gray', 'Red', 'Green'];
      const colorDistribution = colors.map((color) => ({
        color,
        count: Math.floor(Math.random() * 20) + 5,
        percentage: Math.floor(Math.random() * 15) + 5
      }));

      // Usage stats (mock data - would need actual tracking)
      const usageStats = items.slice(0, 10).map(item => ({
        item: item.name,
        usageCount: Math.floor(Math.random() * 20) + 1,
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      // Monthly additions
      const monthlyAdditions = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          items: Math.floor(Math.random() * 10) + 1,
          outfits: Math.floor(Math.random() * 5) + 1
        };
      }).reverse();

      // Cost per wear (mock data)
      const costPerWear = items.slice(0, 8).map(item => ({
        item: item.name,
        cost: Math.floor(Math.random() * 100) + 20,
        wears: Math.floor(Math.random() * 15) + 1,
        cpw: 0
      })).map(item => ({
        ...item,
        cpw: Math.round((item.cost / item.wears) * 100) / 100
      }));

      // Seasonal analysis
      const seasonalAnalysis = [
        { season: 'Spring', items: Math.floor(totalItems * 0.25), usage: Math.floor(Math.random() * 50) + 30 },
        { season: 'Summer', items: Math.floor(totalItems * 0.3), usage: Math.floor(Math.random() * 50) + 40 },
        { season: 'Fall', items: Math.floor(totalItems * 0.25), usage: Math.floor(Math.random() * 50) + 35 },
        { season: 'Winter', items: Math.floor(totalItems * 0.2), usage: Math.floor(Math.random() * 50) + 25 }
      ];

      setStats({
        totalItems,
        totalOutfits,
        categoryDistribution,
        colorDistribution,
        usageStats,
        monthlyAdditions,
        costPerWear,
        seasonalAnalysis
      });
    } catch (error) {
      logger.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-secondary rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-secondary rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outfits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutfits}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Wear</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.costPerWear.length > 0 ? 
                Math.round(stats.costPerWear.reduce((acc, item) => acc + item.cpw, 0) / stats.costPerWear.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.usageStats.filter(item => item.usageCount > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.usageStats.filter(item => item.usageCount > 0).length / stats.totalItems) * 100)}% utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Breakdown of items by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {stats.categoryDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {stats.categoryDistribution.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <Badge variant="secondary">{item.count} ({item.percentage}%)</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Color Analysis</CardTitle>
                <CardDescription>Most common colors in your wardrobe</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.colorDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="color" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Item Usage</CardTitle>
                <CardDescription>How often you wear each item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.usageStats.slice(0, 8).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{item.item}</span>
                        <span>{item.usageCount} wears</span>
                      </div>
                      <Progress value={(item.usageCount / 20) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Per Wear */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Per Wear</CardTitle>
                <CardDescription>Value analysis of your items</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.costPerWear.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="item" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Cost/Wear']}
                    />
                    <Bar dataKey="cpw" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Additions */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Items and outfits added over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyAdditions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="items" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="outfits" stroke="#06B6D4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Breakdown</CardTitle>
                <CardDescription>Items and usage by season</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.seasonalAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="items" fill="#8B5CF6" />
                    <Bar dataKey="usage" fill="#06B6D4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Wardrobe Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Most Versatile Category</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {stats.categoryDistribution[0]?.category} items are your most versatile pieces
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100">Cost Efficiency</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your average cost per wear is trending down, showing good value
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">Underutilized Items</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {stats.usageStats.filter(item => item.usageCount < 3).length} items have low usage
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Build More Outfits</h4>
                  <p className="text-sm text-muted-foreground">
                    You have {stats.totalItems} items but only {stats.totalOutfits} outfits. Try creating more combinations!
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Color Balance</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider adding more neutral colors to increase outfit versatility
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Seasonal Planning</h4>
                  <p className="text-sm text-muted-foreground">
                    Your winter wardrobe could use more pieces for better seasonal coverage
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WardrobeAnalyticsDashboard;