import { renderHook, waitFor, act } from '@testing-library/react';
import { useSubscriptionQuery, useSignInMutation, useSignUpMutation } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
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
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('Auth Hooks', () => {
  const { toast } = (useToast as jest.Mock)();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSubscriptionQuery', () => {
    it('returns pending state when no userId is provided', async () => {
      const { result } = renderHook(() => useSubscriptionQuery(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.status).toBe('pending');
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('calls check-subscription function when userId is provided', async () => {
      const mockData = { subscribed: true, subscription_tier: 'Premium' };
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({ data: mockData, error: null });

      const { result } = renderHook(() => useSubscriptionQuery('test-user-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('check-subscription');
    });

    it('handles errors gracefully by returning unsubscribed', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: new Error('Network error') 
      });

      const { result } = renderHook(() => useSubscriptionQuery('test-user-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ subscribed: false });
    });
  });

  describe('useSignInMutation', () => {
    it('successfully signs in a user', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { user: {} }, error: null });

      const { result } = renderHook(() => useSignInMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ email: 'test@example.com', password: 'password123' });
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Welcome back!',
      }));
    });

    it('shows error toast on sign-in failure', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid credentials' } 
      });

      const { result } = renderHook(() => useSignInMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ email: 'test@example.com', password: 'wrong' });
        } catch (e) {
          // Expected error
        }
      });

      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign In Failed',
        description: 'Invalid credentials',
      }));
    });
  });

  describe('useSignUpMutation', () => {
    it('successfully signs up a new user', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: { user: {} }, error: null });

      const { result } = renderHook(() => useSignUpMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ 
          email: 'new@example.com', 
          password: 'password123',
          displayName: 'New User'
        });
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        password: 'password123',
        options: expect.objectContaining({
          data: { display_name: 'New User' }
        })
      }));
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Account created!',
      }));
    });
  });
});
