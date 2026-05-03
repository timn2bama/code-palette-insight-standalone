import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, jest } from '@jest/globals';
import 'fake-indexeddb/auto';

// Mock import.meta.env
(global as any).import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'mock-key',
      DEV: true,
      PROD: false,
      MODE: 'test'
    }
  }
};

// Mock performance API
if (typeof performance !== 'undefined') {
  (performance as any).getEntriesByType = jest.fn().mockReturnValue([]);
  (performance as any).mark = jest.fn();
  (performance as any).measure = jest.fn();
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
