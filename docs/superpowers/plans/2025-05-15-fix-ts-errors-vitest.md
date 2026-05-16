# Fix TypeScript Errors (Jest to Vitest Migration) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 36 TypeScript errors in SyncStyle by completing the migration from Jest to Vitest and fixing miscellaneous linting/type issues.

**Architecture:** Replace all `jest` calls with Vitest's `vi` equivalent, fix type declarations, and remove unused imports/variables.

**Tech Stack:** TypeScript, Vitest, React Testing Library.

---

### Task 1: Fix src/App.test.tsx

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Replace `jest.` with `vi.` and fix unused imports**
- [ ] **Step 2: Verify changes with tsc**

### Task 2: Fix src/hooks/__tests__/use-mobile.test.tsx

**Files:**
- Modify: `src/hooks/__tests__/use-mobile.test.tsx`

- [ ] **Step 1: Replace `jest.` with `vi.`, fix `jest.Mock` types, and address implicit `any`**
- [ ] **Step 2: Verify changes with tsc**

### Task 3: Fix src/hooks/__tests__/useAsyncOperation.test.tsx

**Files:**
- Modify: `src/hooks/__tests__/useAsyncOperation.test.tsx`

- [ ] **Step 1: Replace `jest.` with `vi.`**
- [ ] **Step 2: Verify changes with tsc**

### Task 4: Fix src/hooks/queries/__tests__/useAuth.test.ts

**Files:**
- Modify: `src/hooks/queries/__tests__/useAuth.test.ts`

- [ ] **Step 1: Replace `jest.Mock` with `Mock`, import `Mock` from `vitest` if needed, and fix unused imports**
- [ ] **Step 2: Verify changes with tsc**

### Task 5: Fix src/hooks/queries/__tests__/useWardrobeItems.test.ts

**Files:**
- Modify: `src/hooks/queries/__tests__/useWardrobeItems.test.ts`

- [ ] **Step 1: Remove unused `useToast` import**
- [ ] **Step 2: Verify changes with tsc**

### Task 6: Final Verification

- [ ] **Step 1: Run full type-check**
- [ ] **Step 2: Commit all changes**
