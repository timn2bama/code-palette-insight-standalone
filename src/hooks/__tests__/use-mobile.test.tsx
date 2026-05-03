import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  let addEventListener: jest.Mock;
  let removeEventListener: jest.Mock;

  beforeEach(() => {
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: jest.fn(),
      })),
    });
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('should return true for mobile width', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop width', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update when media query change listener is triggered', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Get the callback passed to addEventListener
    const callback = addEventListener.mock.calls[0][1];
    
    act(() => {
      setWindowWidth(1024);
      callback();
    });
    
    expect(result.current).toBe(false);
  });
});
