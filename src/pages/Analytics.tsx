import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useWardrobeAnalytics } from "@/hooks/queries/useWardrobeAnalytics";
import { useSubscriptionTiers } from "@/hooks/queries/useSubscriptionTiers";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Star, ExternalLink } from "lucide-react";

const Analytics = () => {
  const { analytics, recommendations, loading, generateShoppingRecommendations } = useWardrobeAnalytics();
  const { currentTier, getRemainingUsage } = useSubscriptionTiers();
  const { subscriptionStatus } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Check if user has access to analytics
  const hasAnalyticsAccess = currentTier?.features?.analytics || subscriptionStatus.subscribed;

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <SEO 
          title="Analytics - SyncStyle"
          description="Advanced wardrobe analytics and insights"
          url="/analytics"
        />
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Premium Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Advanced analytics and insights are available with a Premium or Enterprise subscription.
              </p>
              <Button onClick={() => window.location.href = '/subscription'}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEO 
        title="Analytics Dashboard - SyncStyle"
        description="Advanced wardrobe analytics, ROI tracking, and style insights"
        url="/analytics"
      />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights into your wardrobe performance and style trends</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roi">ROI Tracking</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="recommendations">Shopping</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalItems || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.totalValue.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Estimated wardrobe value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Cost/Wear</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.averageCostPerWear.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Across entire wardrobe</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usage Limit</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getRemainingUsage('photo_uploads')}</div>
                  <p className="text-xs text-muted-foreground">Photos remaining this month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Breakdown of items by type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {analytics && analytics.categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="category"
                        >
                          {analytics.categoryBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Worn Items</CardTitle>
                  <CardDescription>Your favorite clothing items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.mostWornItems?.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center font-bold">
                            #{analytics.mostWornItems.indexOf(item) + 1}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.cost_per_wear.toFixed(2)} / wear</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{item.wear_count} wears</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Per Wear Analysis</CardTitle>
                <CardDescription>Tracking the return on investment of your items</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {analytics && analytics.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Total Value ($)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No ROI data available
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Least Cost-Effective Items</CardTitle>
                  <CardDescription>High cost per wear (rarely worn)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.leastWornItems?.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.wear_count} total wears</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-destructive">${item.cost_per_wear.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">per wear</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Eco-Impact Savings</CardTitle>
                  <CardDescription>Impact of wardrobe longevity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Clothing Life Extended</span>
                    <span className="text-emerald-600 font-bold">+1.2 years</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Waste Diverted</span>
                    <span className="text-emerald-600 font-bold">4.5 kg</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <p className="text-xs text-muted-foreground pt-2">
                    By wearing your items longer, you've reduced your environmental footprint significantly compared to the average consumer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Usage Trends</CardTitle>
                <CardDescription>How your wardrobe usage changes through the year</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {analytics && analytics.seasonalUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.seasonalUsage}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="season" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usage_count" name="Items Worn" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No seasonal trend data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Shopping Recommendations</h2>
              <Button onClick={() => generateShoppingRecommendations()}>
                Regenerate Analysis
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={rec.priority > 3 ? "destructive" : "default"}>
                        {rec.priority > 3 ? "High Priority" : "Suggested"}
                      </Badge>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="capitalize">{rec.category} Optimization</CardTitle>
                    <CardDescription>{rec.reason}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm font-medium mb-3">AI Picks for You:</p>
                    <div className="space-y-2">
                      {Array.isArray(rec.suggested_items) && rec.suggested_items.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm p-2 rounded bg-secondary/50 border border-secondary">
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex gap-2">
                      {Array.isArray(rec.external_links) && rec.external_links.slice(0, 2).map((link: any, idx: number) => (
                        <Button key={idx} variant="outline" size="sm" className="flex-1 text-[10px]" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {link.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}

              {recommendations.length === 0 && (
                <div className="col-span-full py-20 text-center bg-secondary/20 rounded-xl border-2 border-dashed">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold">No recommendations yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                    Generate an analysis to see AI-powered suggestions for optimizing your wardrobe.
                  </p>
                  <Button className="mt-6" onClick={() => generateShoppingRecommendations()}>
                    Run AI Analysis
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
