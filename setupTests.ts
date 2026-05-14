// setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Alias jest to vi for compatibility with existing tests
if (typeof global !== 'undefined') {
  (global as any).jest = vi;
}
