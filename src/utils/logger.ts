export const logger = {
  info: (message: string, ...data: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, ...data);
    }
  },
  warn: (message: string, ...data: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  },
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In a real production app, we could send this to Sentry, LogRocket, etc.
      // e.g. logToService({ level: 'error', message, error });
    }
  }
};
