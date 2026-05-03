// Copyright (c) 2025 Tim N. (timn2bama)
// Licensed under the Apache License, Version 2.0.
// See the LICENSE file in the project root for license information.
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'
import { queryClient } from './lib/queryClient'
import { logger } from "@/utils/logger";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

// Register Service Worker for PWA offline capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        logger.info('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        logger.error('ServiceWorker registration failed: ', err);
      }
    );
  });
}

