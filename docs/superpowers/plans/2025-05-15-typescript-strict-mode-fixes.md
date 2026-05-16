# TypeScript Strict Mode Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 145 TypeScript errors in the `SyncStyle` project, focusing on strict mode compliance and test environment configuration.

**Architecture:**
- Update `AuthContext` with proper types and remove unused variables.
- Refactor `Analytics.tsx` to handle lazy-loaded components correctly.
- Fix header typing in API hooks.
- Migrate testing code from Jest syntax to Vitest.
- Update `tsconfig` to include necessary types for Vitest.

**Tech Stack:** React, TypeScript, Vitest, TanStack Query, Recharts.

---

### Task 1: Fix AuthContext.tsx

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Define proper types for user and session**

```typescript
// Update AuthContextType
interface AuthContextType {
  user: any; // Ideally replace 'any' with the actual user type from better-auth
  session: any; // Ideally replace 'any' with the actual session type
  // ...
}
```

- [ ] **Step 2: Remove unused `data` from `signUp` and `signIn`**

```typescript
// signUp
const { error } = await authClient.signUp.email({ ... });

// signIn
const { error } = await authClient.signIn.email({ ... });
```

- [ ] **Step 3: Handle optional `displayName` when calling `signUp.email`**

```typescript
name: displayName || '', // name is required by better-auth signUp.email
```

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "fix(auth): improve AuthContext types and fix unused variables"
```

---

### Task 2: Fix Analytics.tsx and RechartsComponents.tsx

**Files:**
- Modify: `src/components/charts/RechartsComponents.tsx`
- Modify: `src/pages/Analytics.tsx`

- [ ] **Step 1: Refactor `RechartsComponents.tsx` to be a component**

```typescript
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const RechartsProvider = ({ children }: { 
  children: (components: typeof RechartsComponents) => React.ReactNode 
}) => {
  return <>{children(RechartsComponents)}</>;
};

const RechartsComponents = {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
};

export default RechartsProvider;
```

- [ ] **Step 2: Update `Analytics.tsx` to use `RechartsProvider` and fix implicit `any`**

```typescript
const RechartsProvider = lazy(() => import("@/components/charts/RechartsComponents"));

// In JSX:
<Suspense fallback={...}>
  <RechartsProvider>
    {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip }) => (
      // ...
    )}
  </RechartsProvider>
</Suspense>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/RechartsComponents.tsx src/pages/Analytics.tsx
git commit -m "fix(analytics): fix lazy loading and typing for chart components"
```

---

### Task 3: Fix API Hooks and Miscellaneous Errors

**Files:**
- Modify: `src/hooks/queries/useWardrobeItemsVercel.ts`
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Explicitly type `getAuthHeaders` return value**

```typescript
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
};
```

- [ ] **Step 2: Correct `fetchpriority` to `fetchPriority` in `Index.tsx`**

```typescript
fetchPriority="high"
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/queries/useWardrobeItemsVercel.ts src/pages/Index.tsx
git commit -m "fix: fix api header types and React attribute naming"
```

---

### Task 4: Fix Testing Environment and Mocking

**Files:**
- Modify: `tsconfig.app.json`
- Modify: `src/setupTests.ts`
- Modify: `src/__mocks__/supabase.ts`
- Modify: `src/App.test.tsx`
- Modify: `src/hooks/__tests__/use-mobile.test.tsx`
- Modify: `src/hooks/__tests__/useAsyncOperation.test.tsx`
- Modify: `src/hooks/queries/__tests__/useAuth.test.ts`
- Modify: `src/hooks/queries/__tests__/useWardrobeItems.test.ts`
- Modify: `src/lib/__tests__/utils.test.ts`
- Modify: `src/utils/__tests__/seo.test.ts`

- [ ] **Step 1: Add `vitest/globals` to `tsconfig.app.json`**

```json
"types": ["vitest/globals", "node"]
```

- [ ] **Step 2: Replace `@jest/globals` with `vitest` and `jest` with `vi` in `setupTests.ts`**

```typescript
import { afterEach, vi } from 'vitest';
// Replace jest.fn() with vi.fn()
```

- [ ] **Step 3: Update `src/__mocks__/supabase.ts` to use `vi`**

- [ ] **Step 4: Update all test files to use `vi` instead of `jest`**

- [ ] **Step 5: Run `npm run type-check` to verify**

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "fix(test): migrate from jest to vitest and fix test types"
```
