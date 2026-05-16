const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (message: string, ...data: any[]) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...data);
    }
  },
  warn: (message: string, ...data: any[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  },
  error: (message: string, ...data: any[]) => {
    console.error(`[ERROR] ${message}`, ...data);
  }
};
