import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/utils/logger";

interface CreateMarketplaceListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  photo_url: string | null;
}

const CreateMarketplaceListingDialog: React.FC<CreateMarketplaceListingDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [formData, setFormData] = useState({
    wardrobe_item_id: '',
    title: '',
    description: '',
    price: '',
    condition: '',
    size: '',
    shipping_included: false,
    sustainability_score: 70,
  });

  useEffect(() => {
    if (open && user) {
      fetchWardrobeItems();
    }
  }, [open, user]);

  const fetchWardrobeItems = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('id, name, category, brand, photo_url')
        .eq('user_id', user.id);

      if (error) throw error;
      setWardrobeItems(data || []);
    } catch (error) {
      logger.error('Error fetching wardrobe items:', error);
    }
  };

  const handleWardrobeItemSelect = (itemId: string) => {
    const item = wardrobeItems.find(i => i.id === itemId);
    if (item) {
      setFormData(prev => ({
        ...prev,
        wardrobe_item_id: itemId,
        title: `${item.brand} ${item.name}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          seller_id: user.id,
          wardrobe_item_id: formData.wardrobe_item_id || null,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition,
          size: formData.size,
          shipping_included: formData.shipping_included,
          sustainability_score: formData.sustainability_score,
          category: wardrobeItems.find(i => i.id === formData.wardrobe_item_id)?.category || 'other',
          brand: wardrobeItems.find(i => i.id === formData.wardrobe_item_id)?.brand || '',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your item has been listed on the marketplace!",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      logger.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create marketplace listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      wardrobe_item_id: '',
      title: '',
      description: '',
      price: '',
      condition: '',
      size: '',
      shipping_included: false,
      sustainability_score: 70,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List Item on Marketplace</DialogTitle>
          <DialogDescription>
            Create a listing for your pre-loved fashion item and contribute to sustainable fashion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wardrobe_item">Select from Your Wardrobe (Optional)</Label>
            <Select 
              value={formData.wardrobe_item_id} 
              onValueChange={handleWardrobeItemSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an item from your wardrobe" />
              </SelectTrigger>
              <SelectContent>
                {wardrobeItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.brand} {item.name} ({item.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Stylish vintage blazer in excellent condition"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the item's condition, fit, styling tips, and any unique features..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)*</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="25.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                placeholder="M, 8, 32x30, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition*</Label>
            <Select 
              value={formData.condition} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent - Like new, no visible wear</SelectItem>
                <SelectItem value="very_good">Very Good - Minor signs of wear</SelectItem>
                <SelectItem value="good">Good - Some wear but well maintained</SelectItem>
                <SelectItem value="fair">Fair - Noticeable wear but functional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="shipping"
              checked={formData.shipping_included}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shipping_included: checked }))}
            />
            <Label htmlFor="shipping">Include free shipping</Label>
          </div>

          <div className="space-y-2">
            <Label>Sustainability Score: {formData.sustainability_score}%</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.sustainability_score}
              onChange={(e) => setFormData(prev => ({ ...prev, sustainability_score: parseInt(e.target.value) }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Rate the sustainability impact of this item (material quality, production ethics, longevity)
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'List Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMarketplaceListingDialog;