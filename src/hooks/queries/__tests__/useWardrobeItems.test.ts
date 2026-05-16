import { renderHook, waitFor, act } from '@testing-library/react';
import { useWardrobeItems, useCreateWardrobeItem, useDeleteWardrobeItem } from '../useWardrobeItems';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockToast = vi.fn();

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    vi.clearAllMocks();
    mockFetch.mockReset();
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
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      });

      const { result } = renderHook(() => useWardrobeItems('test-user-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(mockFetch).toHaveBeenCalledWith('/api/wardrobe');
    });
  });

  describe('useCreateWardrobeItem', () => {
    it('successfully creates an item and shows toast', async () => {
      const newItem = { name: 'New Shoes', category: 'shoes' };
      const createdItem = { id: '123', ...newItem };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createdItem,
      });

      const { result } = renderHook(() => useCreateWardrobeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(newItem);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/wardrobe', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newItem),
      }));
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Item added',
      }));
    });
  });

  describe('useDeleteWardrobeItem', () => {
    it('successfully deletes an item and shows toast', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useDeleteWardrobeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('item-123');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/wardrobe/item-123', expect.objectContaining({
        method: 'DELETE',
      }));
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Item deleted',
      }));
    });
  });
});
