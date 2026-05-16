import { renderHook, act } from '@testing-library/react';
import { useOutfitRecommendations } from '../useOutfitRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/utils/logger";
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock supabase
const mockSupabaseChain: any = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockSupabaseChain),
  },
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

describe('useOutfitRecommendations', () => {
  const mockUser = { id: 'test-user-id' };
  
  beforeEach(() => {
    vi.restoreAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    
    // Reset implementations to default chaining behavior
    mockSupabaseChain.select.mockReturnThis();
    mockSupabaseChain.insert.mockReturnThis();
    mockSupabaseChain.single.mockReturnThis();
    mockSupabaseChain.eq.mockReturnThis();
    mockSupabaseChain.order.mockReturnThis();
  });

  it('generates suggestions based on wardrobe items', async () => {
    const mockWardrobeItems = [
      { id: '1', name: 'T-Shirt', category: 'tops', color: 'White', photo_url: null },
      { id: '2', name: 'Jeans', category: 'bottoms', color: 'Blue', photo_url: null },
      { id: '3', name: 'Sneakers', category: 'shoes', color: 'Black', photo_url: null },
    ];
    (mockSupabaseChain.select as any).mockResolvedValue({ data: mockWardrobeItems, error: null });

    const { result } = renderHook(() => useOutfitRecommendations());

    await act(async () => {
      await result.current.generateSuggestions();
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions[0].items.length).toBeGreaterThanOrEqual(2);
    expect(supabase.from).toHaveBeenCalledWith('wardrobe_items');
  });

  it('includes base item in suggestions if provided', async () => {
    const baseItem = { id: '4', name: 'Red Jacket', category: 'outerwear', color: 'Red', photo_url: null };
    const mockWardrobeItems = [
      { id: '1', name: 'T-Shirt', category: 'tops', color: 'White', photo_url: null },
      { id: '2', name: 'Jeans', category: 'bottoms', color: 'Blue', photo_url: null },
      { id: '3', name: 'Sneakers', category: 'shoes', color: 'Black', photo_url: null },
    ];
    (mockSupabaseChain.select as any).mockResolvedValue({ data: mockWardrobeItems, error: null });

    const { result } = renderHook(() => useOutfitRecommendations());

    await act(async () => {
      await result.current.generateSuggestions(baseItem);
    });

    // Check if at least one suggestion contains the base item
    const hasBaseItem = result.current.suggestions.some(s => 
      s.items.some(item => item.id === baseItem.id)
    );
    expect(hasBaseItem).toBe(true);
  });

  it('successfully creates an outfit from a suggestion', async () => {
    const mockSuggestion = {
      id: 'suggestion-0',
      items: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }],
      occasion: 'casual',
      season: 'all seasons',
      matchScore: 100,
      description: 'Test Outfit'
    };
    
    // First call: .from('outfits').insert(...).select().single()
    // Second call: .from('outfit_items').insert(...)
    
    (mockSupabaseChain.single as any).mockResolvedValue({ 
      data: { id: 'outfit-123' }, 
      error: null 
    });
    
    // We need insert to return the chain for the first call, 
    // and resolve to { error: null } for the second call if it's awaited.
    // However, the code awaits the result of the whole chain.
    (mockSupabaseChain.insert as any)
      .mockReturnValueOnce(mockSupabaseChain) // First call returns chain
      .mockResolvedValueOnce({ error: null }); // Second call resolves

    const { result } = renderHook(() => useOutfitRecommendations());

    await act(async () => {
      await result.current.createOutfitFromSuggestion(mockSuggestion as any, 'My New Outfit');
    });

    expect(supabase.from).toHaveBeenCalledWith('outfits');
    expect(supabase.from).toHaveBeenCalledWith('outfit_items');
    expect(mockToast).not.toHaveBeenCalled(); // Hook doesn't call toast, it just returns
  });

  it('handles errors during suggestion generation', async () => {
    (mockSupabaseChain.select as any).mockResolvedValue({ 
      data: null, 
      error: new Error('Database error') 
    });

    const { result } = renderHook(() => useOutfitRecommendations());

    await act(async () => {
      await result.current.generateSuggestions();
    });

    expect(logger.error).toHaveBeenCalled();
    expect(result.current.suggestions).toEqual([]);
  });
});
