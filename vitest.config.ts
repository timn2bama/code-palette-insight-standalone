// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/playwright-report/**', '**/.worktrees/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
