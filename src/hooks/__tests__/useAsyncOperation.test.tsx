import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation } from '../useAsyncOperation';

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

describe('useAsyncOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute operation successfully', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        context: 'general',
        successMessage: 'Operation completed',
      })
    );

    expect(result.current.loading).toBe(false);

    await act(async () => {
      const returnValue = await result.current.execute();
      expect(returnValue).toBe('success');
    });

    expect(mockOperation).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        context: 'general',
      })
    );

    await act(async () => {
      const returnValue = await result.current.execute();
      expect(returnValue).toBeUndefined();
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.loading).toBe(false);
  });

  it('should call onSuccess callback', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        onSuccess,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith('success');
  });

  it('should call onError callback', async () => {
    const mockError = new Error('Failed');
    const mockOperation = jest.fn().mockRejectedValue(mockError);
    const onError = jest.fn();
    
    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        onError,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should reset error state', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation)
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
  });
});
