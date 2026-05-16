import { renderHook } from '@testing-library/react';
import { useUploadLimits } from '../useUploadLimits';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUploadLimits', () => {
  beforeEach(() => {
    queryClient.clear();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      subscriptionStatus: { subscribed: false },
      checkSubscription: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it('should return upload limits', () => {
    const { result } = renderHook(() => useUploadLimits(), {
      wrapper: createWrapper(),
    });

    expect(result.current.uploadLimits).toBeDefined();
    expect(result.current.uploadLimits.maxUploadsPerCategory).toBe(4);
  });

  it('should check if can upload to category', () => {
    const { result } = renderHook(() => useUploadLimits(), {
      wrapper: createWrapper(),
    });

    const canUpload = result.current.canUploadToCategory('tops');
    expect(typeof canUpload).toBe('boolean');
  });

  it('should get category usage', () => {
    const { result } = renderHook(() => useUploadLimits(), {
      wrapper: createWrapper(),
    });

    const usage = result.current.getCategoryUsage('tops');
    expect(usage).toHaveProperty('used');
    expect(usage).toHaveProperty('limit');
  });
});
