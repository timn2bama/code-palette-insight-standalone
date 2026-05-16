import type { CapacitorConfig } from '@capacitor/cli';

// In production, Capacitor loads from bundled assets (webDir).
// The server.url override is only for local development (live-reload against a dev server).
// Set CAPACITOR_SERVER_URL env var during development to enable live-reload.
const devServerUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'app.lovable.b9ff32bc031e4a86901c0de2f28baa51',
  appName: 'SyncStyle',
  webDir: 'dist',
  server: {
    // Only set url in development; omitting it makes Capacitor use bundled assets in production.
    ...(devServerUrl ? { url: devServerUrl } : {}),
    cleartext: false,
  }
};

export default config;