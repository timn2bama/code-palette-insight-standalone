import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useWardrobeItems } from '@/hooks/queries/useWardrobeItems';
import { useCreateMarketplaceListing } from '@/hooks/queries/useMarketplace';

interface CreateMarketplaceListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateMarketplaceListingDialog: React.FC<CreateMarketplaceListingDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { data: wardrobeItems = [] } = useWardrobeItems(user?.id);
  const createListingMutation = useCreateMarketplaceListing();
  
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

  const handleWardrobeItemSelect = (itemId: string) => {
    const item = wardrobeItems.find(i => i.id === itemId);
    if (item) {
      setFormData(prev => ({
        ...prev,
        wardrobe_item_id: itemId,
        title: `${item.brand || ''} ${item.name}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedItem = wardrobeItems.find(i => i.id === formData.wardrobe_item_id);
    
    createListingMutation.mutate({
      ...formData,
      category: selectedItem?.category || 'other',
      brand: selectedItem?.brand || '',
    }, {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
        resetForm();
      }
    });
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

  const loading = createListingMutation.isPending;

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
