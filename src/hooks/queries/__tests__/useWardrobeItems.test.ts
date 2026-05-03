import { renderHook, waitFor, act } from '@testing-library/react';
import { useWardrobeItems, useCreateWardrobeItem, useDeleteWardrobeItem } from '../useWardrobeItems';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase
const mockSupabaseChain = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockSupabaseChain),
  },
}));

const mockToast = jest.fn();

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: mockToast,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('Wardrobe Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useWardrobeItems', () => {
    it('returns empty array when no userId is provided', async () => {
      const { result } = renderHook(() => useWardrobeItems(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.status).toBe('pending');
    });

    it('fetches items when userId is provided', async () => {
      const mockItems = [{ id: '1', name: 'Shirt' }];
      (mockSupabaseChain.order as jest.Mock).mockResolvedValue({ data: mockItems, error: null });

      const { result } = renderHook(() => useWardrobeItems('test-user-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(supabase.from).toHaveBeenCalledWith('wardrobe_items');
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
    });
  });

  describe('useCreateWardrobeItem', () => {
    it('successfully creates an item and shows toast', async () => {
      const newItem = { name: 'New Shoes', category: 'shoes' };
      (mockSupabaseChain.single as jest.Mock).mockResolvedValue({ data: { id: '123', ...newItem }, error: null });

      const { result } = renderHook(() => useCreateWardrobeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(newItem);
      });

      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(newItem);
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Item added',
      }));
    });
  });

  describe('useDeleteWardrobeItem', () => {
    it('successfully deletes an item and shows toast', async () => {
      (mockSupabaseChain.eq as jest.Mock).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useDeleteWardrobeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('item-123');
      });

      expect(mockSupabaseChain.delete).toHaveBeenCalled();
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', 'item-123');
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Item deleted',
      }));
    });
  });
});
