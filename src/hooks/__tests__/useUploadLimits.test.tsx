import { renderHook } from '@testing-library/react';
import { useUploadLimits } from '../useUploadLimits';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
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
      cacheTime: 0,
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
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      subscriptionStatus: { subscribed: false },
      checkSubscription: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
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
