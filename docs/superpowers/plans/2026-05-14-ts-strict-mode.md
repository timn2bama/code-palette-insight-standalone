# TypeScript Strict Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable strict mode and fix all type errors to ensure a clean build.

**Architecture:** Centralized strict config in root `tsconfig.json` and explicit typing in core components.

**Tech Stack:** TypeScript, React, better-auth, TanStack Query.

---

### Task 1: TypeScript Configuration

**Files:**
- Modify: `tsconfig.json`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Move strict flags to root tsconfig.json**
Modify `tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedParameters": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "allowJs": true
  }
}
```

- [ ] **Step 2: Clean up tsconfig.app.json**
Remove redundant flags that are now in the root.

- [ ] **Step 3: Commit**
```bash
git add tsconfig.json tsconfig.app.json
git commit -m "chore: centralize strict ts config"
```

---

### Task 2: Fix AuthContext Types

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Define explicit types**
Modify `src/contexts/AuthContext.tsx`:
```typescript
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { logger } from "@/utils/logger";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

// better-auth session/user types
type Session = typeof authClient.$Infer.Session;
type User = typeof authClient.$Infer.User;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}
```

- [ ] **Step 2: Fix displayName assignment and unused variables**
Ensure `displayName` is a string or fallback to empty string. Remove unused `data` from destructuring.

- [ ] **Step 3: Commit**
```bash
git add src/contexts/AuthContext.tsx
git commit -m "refactor: fix AuthContext types and unused variables"
```

---

### Task 3: Resolve Remaining Build Errors

**Files:**
- Modify: `src/pages/Analytics.tsx`
- Modify: `src/pages/Index.tsx`
- Modify: `src/hooks/queries/useWardrobeItemsVercel.ts`
- Modify: `src/hooks/__tests__/useUploadLimits.test.tsx`
- Modify: `src/hooks/queries/__tests__/useAuth.test.ts`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Fix Analytics.tsx lazy import and any types**
Use proper types for the chart components and destructive assignment.

- [ ] **Step 2: Fix Index.tsx fetchPriority**
Change `fetchpriority="high"` to `fetchPriority="high"`.

- [ ] **Step 3: Fix useWardrobeItemsVercel.ts headers**
Ensure `headers` is typed as `HeadersInit`.

- [ ] **Step 4: Fix TanStack Query cacheTime**
Replace `cacheTime: 0` with `gcTime: 0` in test files.

- [ ] **Step 5: Clean up App.test.tsx**
Remove unused imports `screen` and `supabase`.

- [ ] **Step 6: Verify Build**
Run: `npx tsc --build`
Expected: SUCCESS

- [ ] **Step 7: Commit**
```bash
git add .
git commit -m "refactor: resolve all remaining typescript build errors"
```
