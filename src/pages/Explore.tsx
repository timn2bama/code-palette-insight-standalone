import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import SocialOutfitCard from '@/components/social/SocialOutfitCard';
import SocialViewOutfitDialog from '@/components/social/SocialViewOutfitDialog';
import { useSocialOutfits, SocialOutfit } from '@/hooks/useSocialOutfits';
import { useAuth } from '@/contexts/AuthContext';
import { Search, TrendingUp, Users, Award, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';

const Explore = () => {
  const [outfits, setOutfits] = useState<SocialOutfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<SocialOutfit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [selectedOutfit, setSelectedOutfit] = useState<SocialOutfit | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { user } = useAuth();
  const {
    loading,
    fetchPublicOutfits,
    likeOutfit,
    unlikeOutfit,
    rateOutfit,
    addComment
  } = useSocialOutfits();

  useEffect(() => {
    loadOutfits();
  }, []);

  useEffect(() => {
    filterOutfits();
  }, [outfits, searchQuery, occasionFilter, seasonFilter]);

  const loadOutfits = async () => {
    const data = await fetchPublicOutfits(50);
    setOutfits(data);
  };

  const filterOutfits = () => {
    let filtered = [...outfits];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(outfit =>
        outfit.name.toLowerCase().includes(query) ||
        (outfit.description || '').toLowerCase().includes(query) ||
        (outfit.profiles?.display_name || '').toLowerCase().includes(query)
      );
    }

    if (occasionFilter !== 'all') {
      filtered = filtered.filter(outfit => outfit.occasion === occasionFilter);
    }

    if (seasonFilter !== 'all') {
      filtered = filtered.filter(outfit => outfit.season === seasonFilter);
    }

    setFilteredOutfits(filtered);
  };

  const handleViewOutfit = (outfit: SocialOutfit) => {
    setSelectedOutfit(outfit);
    setViewDialogOpen(true);
  };

  const handleLike = async (outfitId: string) => {
    if (!user) return;
    const success = await likeOutfit(outfitId);
    if (success) {
      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { 
              ...outfit, 
              _count: { 
                likes: (outfit._count?.likes || 0) + 1,
                comments: outfit._count?.comments || 0,
                ratings: outfit._count?.ratings || 0
              },
              user_liked: true
            }
          : outfit
      ));
    }
  };

  const handleUnlike = async (outfitId: string) => {
    if (!user) return;
    const success = await unlikeOutfit(outfitId);
    if (success) {
      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { 
              ...outfit, 
              _count: { 
                likes: Math.max(0, (outfit._count?.likes || 1) - 1),
                comments: outfit._count?.comments || 0,
                ratings: outfit._count?.ratings || 0
              },
              user_liked: false
            }
          : outfit
      ));
    }
  };

  const handleRate = async (outfitId: string, rating: number) => {
    if (!user) return;
    const success = await rateOutfit(outfitId, rating);
    if (success) {
      loadOutfits(); // Easier to reload to get new average
    }
  };

  const handleComment = async (outfitId: string, content: string) => {
    if (!user) return;
    const success = await addComment(outfitId, content);
    if (success) {
      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { 
              ...outfit, 
              _count: { 
                likes: outfit._count?.likes || 0,
                ratings: outfit._count?.ratings || 0,
                comments: (outfit._count?.comments || 0) + 1 
              }
            }
          : outfit
      ));
    }
  };

  const occasions = ['casual', 'formal', 'work', 'sport', 'date', 'party'];
  const seasons = ['spring', 'summer', 'fall', 'winter'];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Explore Community Outfits - SyncStyle"
        description="Discover style inspiration from the SyncStyle community"
        url="/explore"
      />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Explore Community</h1>
            <p className="text-muted-foreground">Discover style inspiration from fellow fashion enthusiasts</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-secondary/20 p-4 rounded-xl">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> All
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Trending
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Award className="h-4 w-4" /> Featured
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search outfits, styles, or people..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={occasionFilter} onValueChange={setOccasionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Occasions</SelectItem>
                  {occasions.map(occasion => (
                    <SelectItem key={occasion} value={occasion}>
                      {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {seasons.map(season => (
                    <SelectItem key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Fetching latest community styles...</p>
              </div>
            ) : filteredOutfits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOutfits.map((outfit) => (
                  <SocialOutfitCard 
                    key={outfit.id} 
                    outfit={outfit}
                    onView={() => handleViewOutfit(outfit)}
                    onLike={() => handleLike(outfit.id)}
                    onUnlike={() => handleUnlike(outfit.id)}
                    onRate={(rating) => handleRate(outfit.id, Number(rating))}
                    onComment={(content) => handleComment(outfit.id, content)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/10 rounded-2xl border-2 border-dashed">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold">No outfits found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                  Try adjusting your filters or search query to find more inspiration.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="text-center py-20">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold">Trending Styles</h3>
              <p className="text-muted-foreground mt-2">Coming soon to the SyncStyle community!</p>
            </div>
          </TabsContent>

          <TabsContent value="featured">
            <div className="text-center py-20">
              <Award className="h-12 w-12 mx-auto mb-4 text-fashion-gold" />
              <h3 className="text-xl font-bold">Featured Creators</h3>
              <p className="text-muted-foreground mt-2">Coming soon to the SyncStyle community!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOutfit && (
        <SocialViewOutfitDialog 
          outfit={selectedOutfit}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onRate={handleRate}
          onComment={handleComment}
          userLiked={selectedOutfit.user_liked}
        />
      )}
    </div>
  );
};

export default Explore;
