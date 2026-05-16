import { getUserFriendlyMessage, handleError, handleSuccess, withErrorHandling } from '../errorHandler';
import { toast } from '@/hooks/use-toast';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

describe('ErrorHandler Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserFriendlyMessage', () => {
    it('should return string error as-is', () => {
      const result = getUserFriendlyMessage('Custom error message');
      expect(result).toBe('Custom error message');
    });

    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      const result = getUserFriendlyMessage(error);
      expect(result).toBe('Test error');
    });

    it('should return context-specific message for unknown errors', () => {
      const result = getUserFriendlyMessage({}, 'auth');
      expect(result).toBe('Authentication failed. Please try again.');
    });

    it('should return general message when no context provided', () => {
      const result = getUserFriendlyMessage({});
      expect(result).toBe('Something went wrong. Please try again.');
    });
  });

  describe('handleError', () => {
    it('should show toast by default', async () => {
      await handleError(new Error('Test error'), 'general');
      
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.any(String),
        variant: 'destructive',
      });
    });

    it('should not show toast when showToast is false', async () => {
      await handleError(new Error('Test error'), 'general', undefined, {
        showToast: false,
      });
      
      expect(toast).not.toHaveBeenCalled();
    });

    it('should use custom message when provided', async () => {
      const customMsg = 'Custom error message';
      await handleError(new Error('Test error'), 'general', undefined, {
        customMessage: customMsg,
      });
      
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: customMsg,
        variant: 'destructive',
      });
    });
  });

  describe('handleSuccess', () => {
    it('should show success toast', () => {
      handleSuccess('Operation successful');
      
      expect(toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Operation successful',
      });
    });

    it('should use custom title when provided', () => {
      handleSuccess('Done', { title: 'Great!' });
      
      expect(toast).toHaveBeenCalledWith({
        title: 'Great!',
        description: 'Done',
      });
    });
  });

  describe('withErrorHandling', () => {
    it('should return result on success', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await withErrorHandling(operation, 'general');
      
      expect(result).toBe('success');
      expect(toast).not.toHaveBeenCalled();
    });

    it('should handle error and return undefined', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'));
      
      const result = await withErrorHandling(operation, 'general');
      
      expect(result).toBeUndefined();
      expect(toast).toHaveBeenCalled();
    });

    it('should return fallback value on error', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'));
      
      const result = await withErrorHandling(operation, 'general', undefined, {
        fallbackValue: 'fallback',
      });
      
      expect(result).toBe('fallback');
    });
  });
});
