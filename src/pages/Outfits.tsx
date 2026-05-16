import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import CreateOutfitDialog from "@/components/CreateOutfitDialog";
import SmartOutfitAI from "@/components/ai-stylist/SmartOutfitAI";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, Calendar, Trash2, Shirt, Loader2 } from "lucide-react";
import ViewOutfitDialog from "@/components/ViewOutfitDialog";
import ProgressiveImage from "@/components/ProgressiveImage";
import { useOutfits, useDeleteOutfit } from "@/hooks/queries/useOutfits";
import { Outfit } from "@/types";

const Outfits = () => {
  const { user } = useAuth();
  const { data: outfits = [], isLoading: loading, refetch: fetchOutfits } = useOutfits(user?.id);
  const deleteOutfitMutation = useDeleteOutfit();
  
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");

  useEffect(() => {
    let filtered = outfits;

    if (searchQuery.trim()) {
      filtered = filtered.filter(outfit =>
        outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (outfit.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (occasionFilter !== "all") {
      filtered = filtered.filter(outfit => outfit.occasion === occasionFilter);
    }

    if (seasonFilter !== "all") {
      filtered = filtered.filter(outfit => outfit.season === seasonFilter);
    }

    setFilteredOutfits(filtered);
  }, [searchQuery, occasionFilter, seasonFilter, outfits]);

  const deleteOutfit = async (id: string) => {
    deleteOutfitMutation.mutate(id);
  };

  const occasions = ['casual', 'formal', 'work', 'sport', 'date', 'party'];
  const seasons = ['spring', 'summer', 'fall', 'winter'];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Your Outfits</h1>
            <p className="text-muted-foreground">Browse and manage your outfit collection</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <CreateOutfitDialog onOutfitCreated={fetchOutfits} />
            <SmartOutfitAI onOutfitCreated={fetchOutfits} />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white/50 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search outfits..." 
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={occasionFilter} onValueChange={setOccasionFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Occasions" />
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
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Seasons" />
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your outfit collection...</p>
          </div>
        ) : filteredOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => {
              const itemsCount = outfit.items?.length || 0;
              const firstItem = outfit.items?.[0]?.wardrobe_item;
              
              return (
                <Card key={outfit.id} className="shadow-card hover:shadow-elegant transition-all duration-300 group overflow-hidden border-0 bg-white">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    {firstItem?.photo_url ? (
                      <ProgressiveImage
                        src={firstItem.photo_url}
                        alt={outfit.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                        <Shirt className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="flex gap-2 w-full">
                        <ViewOutfitDialog outfit={outfit as any} onUpdate={fetchOutfits}>
                          <Button variant="elegant" size="sm" className="flex-1 bg-white text-primary hover:bg-white/90">
                            View Details
                          </Button>
                        </ViewOutfitDialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteOutfit(outfit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {outfit.season && (
                      <Badge className="absolute top-3 left-3 bg-white/90 text-primary hover:bg-white border-0 capitalize">
                        {outfit.season}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold truncate">{outfit.name}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                      {outfit.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(outfit.created_at).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                        {outfit.occasion || 'General'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 rounded-2xl border-2 border-dashed shadow-sm">
            <Shirt className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-2xl font-bold text-primary">No outfits found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              {searchQuery || occasionFilter !== 'all' || seasonFilter !== 'all' 
                ? "Try adjusting your filters to find what you're looking for." 
                : "Start creating your first outfit by selecting items from your wardrobe or using our AI stylist."}
            </p>
            {!searchQuery && occasionFilter === 'all' && seasonFilter === 'all' && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <CreateOutfitDialog onOutfitCreated={fetchOutfits} />
                <Button variant="outline" onClick={() => (window as any).location.href = '/ai-stylist'}>
                  Try AI Stylist
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Outfits;
