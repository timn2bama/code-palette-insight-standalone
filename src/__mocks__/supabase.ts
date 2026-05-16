import { vi } from 'vitest';

export const supabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
  functions: {
    invoke: vi.fn(),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
};
