import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, Heart, ShoppingBag, Leaf, Plus } from 'lucide-react';
import CreateMarketplaceListingDialog from './CreateMarketplaceListingDialog';
import RentalListingsDialog from './RentalListingsDialog';
import { useMarketplaceItems } from '@/hooks/queries/useMarketplace';

const MarketplaceHome = () => {
  const { toast } = useToast();
  const { data: items = [], isLoading: loading } = useMarketplaceItems();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRentalDialog, setShowRentalDialog] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      matchesPrice = item.price >= min && (max ? item.price <= max : true);
    }
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  const handleItemClick = (item: MarketplaceItem) => {
    // Open item details dialog
    toast({
      title: "Item Details",
      description: `${item.title} - $${item.price}`,
    });
  };

  const getSustainabilityBadge = (score: number) => {
    if (score >= 80) return { label: 'Eco-Excellent', className: 'bg-green-500' };
    if (score >= 60) return { label: 'Eco-Good', className: 'bg-yellow-500' };
    if (score >= 40) return { label: 'Eco-Fair', className: 'bg-orange-500' };
    return { label: 'Eco-Standard', className: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Fashion Marketplace</h1>
            <p className="text-muted-foreground">Buy and sell pre-loved fashion items sustainably</p>
          </div>
          
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button onClick={() => setShowRentalDialog(true)} variant="outline">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Rental Platform
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              List Item
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="dresses">Dresses</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="very_good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-25">$0 - $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-">$100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or be the first to list an item!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const sustainabilityBadge = getSustainabilityBadge(item.sustainability_score);
              
              return (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="aspect-square bg-muted rounded-t-lg relative overflow-hidden">
                    {item.photos && item.photos.length > 0 ? (
                      <img 
                        src={item.photos[0]} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2">
                      <Badge className={sustainabilityBadge.className}>
                        <Leaf className="h-3 w-3 mr-1" />
                        {sustainabilityBadge.label}
                      </Badge>
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                      <span className="text-lg font-bold text-primary">${item.price}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">{item.brand}</Badge>
                      <Badge variant="outline" className="text-xs">{item.condition}</Badge>
                      {item.size && <Badge variant="outline" className="text-xs">Size {item.size}</Badge>}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      {item.shipping_included && <span>Free Shipping</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateMarketplaceListingDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchMarketplaceItems}
      />

      <RentalListingsDialog 
        open={showRentalDialog}
        onOpenChange={setShowRentalDialog}
      />
    </div>
  );
};

export default MarketplaceHome;