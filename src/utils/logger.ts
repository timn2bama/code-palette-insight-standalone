export const logger = {
  info: (message: string, ...data: any[]) => {
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, ...data);
    }
  },
  warn: (message: string, ...data: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  },
  error: (message: string, ...data: any[]) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, ...data);
    } else {
      // In a real production app, we could send this to Sentry, LogRocket, etc.
      // e.g. logToService({ level: 'error', message, data });
    }
  }
};
