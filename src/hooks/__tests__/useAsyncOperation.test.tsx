import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation } from '../useAsyncOperation';

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

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute operation successfully', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
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
    const mockOperation = vi.fn().mockRejectedValue(mockError);
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
    const mockOperation = vi.fn().mockResolvedValue('success');
    const onSuccess = vi.fn();
    
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
    const mockOperation = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();
    
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
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failed'));
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
