# Migrate SyncStyle to Vercel Postgres & Better Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully migrate the SyncStyle project from Supabase to Vercel Postgres and Better Auth, replacing all Supabase SDK calls with local API fetches.

**Architecture:** 
- **Auth:** Replace Supabase Auth with [Better Auth](https://www.better-auth.com/) using Prisma as the adapter.
- **Database:** Standardize on Vercel Postgres via Prisma for all operations.
- **API:** Refactor existing Vercel functions in `/api` to use Better Auth for session verification and Prisma for data access.
- **Frontend:** Update React hooks to fetch from `/api/*` instead of the Supabase SDK.

**Tech Stack:** Better Auth, Prisma, Vercel Postgres, React, React Query.

---

### Task 1: Configure Better Auth Server

**Files:**
- Create: `SyncStyle/api/auth.ts`
- Modify: `SyncStyle/api/lib/auth.ts`

- [ ] **Step 1: Create the Better Auth server configuration**

```typescript
// SyncStyle/api/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/prisma";
import { VercelRequest, VercelResponse } from "@vercel/node";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle Better Auth requests
    // This typically maps to /api/auth/*
    // We will use a simplified proxy for this environment
    const { method, url, headers, body } = req;
    
    // Better Auth expects a standard Request object
    // We proxy the Vercel request to Better Auth
    const response = await auth.handler(new Request(`http://localhost${url}`, {
        method,
        headers: headers as any,
        body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
    }));

    res.status(response.status);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    Object.entries(responseHeaders).forEach(([key, value]) => res.setHeader(key, value));
    
    const responseBody = await response.text();
    res.send(responseBody);
}
```

- [ ] **Step 2: Update API Auth verification helper**

```typescript
// SyncStyle/api/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import type { VercelRequest } from '@vercel/node';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export async function verifyUser(req: VercelRequest) {
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  if (!session || !session.user) return null;
  
  // Return standard user object structure
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add SyncStyle/api/auth.ts SyncStyle/api/lib/auth.ts
git commit -m "feat: configure Better Auth server and verification helper"
```

---

### Task 2: Configure Better Auth Client

**Files:**
- Create: `SyncStyle/src/lib/auth-client.ts`

- [ ] **Step 1: Create the auth client**

```typescript
// SyncStyle/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: window.location.origin, // Base URL of your app
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 2: Commit**

```bash
git add SyncStyle/src/lib/auth-client.ts
git commit -m "feat: configure Better Auth client"
```

---

### Task 3: Refactor AuthContext

**Files:**
- Modify: `SyncStyle/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Replace Supabase Auth logic with Better Auth**

```typescript
// SyncStyle/src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { logger } from "@/utils/logger";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending: loading } = authClient.useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });

  const checkSubscription = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/analytics/subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      logger.error('Error checking subscription:', error);
      setSubscriptionStatus({ subscribed: false });
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      checkSubscription();
    } else {
      setSubscriptionStatus({ subscribed: false });
    }
  }, [session, checkSubscription]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: displayName,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authClient.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user: session?.user ?? null,
    session: session ?? null,
    loading,
    subscriptionStatus,
    checkSubscription,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

- [ ] **Step 2: Commit**

```bash
git add SyncStyle/src/contexts/AuthContext.tsx
git commit -m "refactor: update AuthContext to use Better Auth"
```

---

### Task 4: Refactor Wardrobe API & Hooks

**Files:**
- Modify: `SyncStyle/api/wardrobe/index.ts`
- Modify: `SyncStyle/src/hooks/queries/useWardrobeItems.ts`

- [ ] **Step 1: Ensure Wardrobe API uses prisma and verifyUser**

```typescript
// SyncStyle/api/wardrobe/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { verifyUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const items = await prisma.wardrobeItem.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });
    return res.status(200).json(items);
  }

  if (req.method === 'POST') {
    const item = await prisma.wardrobeItem.create({
      data: {
        ...req.body,
        user_id: user.id,
      },
    });
    return res.status(201).json(item);
  }
  
  // Add DELETE/PATCH handlers as needed
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

- [ ] **Step 2: Update useWardrobeItems hook to use API fetch**

```typescript
// SyncStyle/src/hooks/queries/useWardrobeItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useWardrobeItems = (userId?: string) => {
  return useQuery({
    queryKey: ['wardrobe-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await fetch('/api/wardrobe');
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

// Update create/update/delete mutations similarly using fetch('/api/wardrobe/...')
```

- [ ] **Step 3: Commit**

```bash
git add SyncStyle/api/wardrobe/index.ts SyncStyle/src/hooks/queries/useWardrobeItems.ts
git commit -m "refactor: switch wardrobe operations to local API and Prisma"
```

---

### Task 5: Repeat for Outfits, Marketplace, and Analytics

**Files:**
- Modify: `SyncStyle/api/outfits/index.ts`, `SyncStyle/src/hooks/queries/useOutfits.ts`
- Modify: `SyncStyle/api/marketplace/index.ts`, `SyncStyle/src/hooks/queries/useMarketplace.ts`
- Modify: `SyncStyle/api/analytics/index.ts`, `SyncStyle/src/hooks/queries/useWardrobeAnalytics.ts`

- [ ] **Step 1: Refactor each module following the pattern in Task 4**
- [ ] **Step 2: Verify each build and test suite**
- [ ] **Step 3: Commit**

```bash
---

### Task 6: Migrate Image Upload to Vercel Blob

**Files:**
- Modify: `SyncStyle/src/hooks/useImageUpload.ts`

- [ ] **Step 1: Update useImageUpload hook to use Vercel API**

```typescript
// SyncStyle/src/hooks/useImageUpload.ts
import { useState } from 'react';
import { compressImage } from '@/utils/imageCompression';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      setUploading(true);
      const compressedFile = await compressImage(file, 1280, 0.8, 0.75);
      
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const response = await fetch(`/api/storage/upload?filename=${path}/${fileName}`, {
        method: 'POST',
        body: compressedFile,
      });

      if (!response.ok) throw new Error('Upload failed');
      const blob = await response.json();

      toast({ title: "Success", description: "Image uploaded successfully" });
      return blob.url;
    } catch (error) {
      logger.error('Upload error:', error);
      toast({ title: "Upload Failed", description: "Failed to upload image.", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
```

- [ ] **Step 2: Commit**

```bash
git add SyncStyle/src/hooks/useImageUpload.ts
git commit -m "refactor: migrate image uploads to Vercel Blob"
```

