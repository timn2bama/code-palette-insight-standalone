# Lint Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce 113 linting warnings in the SyncStyle project to as close to zero as possible.

**Architecture:** Surgical fixes for `no-console`, `react-hooks/exhaustive-deps`, and `react-refresh/only-export-components`.

**Tech Stack:** TypeScript, React, ESLint.

---

### Task 1: Resolve `no-console` warnings

**Files:**
- Modify: `src/utils/logger.ts`
- Modify: `supabase/functions/*/index.ts` (Multiple files)

- [ ] **Step 1: Update `src/utils/logger.ts`**
  Replace `console.log` with `console.info`.

- [ ] **Step 2: Update Supabase Functions**
  For each file in `supabase/functions` mentioned in the lint output, replace `console.log` with `console.info` (for general logs) or `console.warn` (for warnings/errors).

- [ ] **Step 3: Verify Task 1**
  Run: `npm run lint` and check if `no-console` warnings are gone.

---

### Task 2: Resolve `react-hooks/exhaustive-deps` warnings

**Files:**
- Modify: `src/components/OutfitSuggestionsDialog.tsx`
- Modify: `src/components/ViewDetailsDialog.tsx`
- Modify: `src/components/WardrobeAnalyticsDashboard.tsx`
- Modify: `src/components/WearHistoryView.tsx`
- Modify: `src/components/ai-stylist/AIStylistDashboard.tsx`
- Modify: `src/components/marketplace/*.tsx`
- Modify: `src/components/sustainability/SustainabilityDashboard.tsx`
- Modify: `src/components/weather/OutfitSuggestions.tsx`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/hooks/queries/*.ts`
- Modify: `src/hooks/useAccessibility.ts`
- Modify: `src/hooks/useErrorLogger.ts`
- Modify: `src/hooks/useIntegrations.ts`
- Modify: `src/hooks/useLocalServices.ts`
- Modify: `src/hooks/useOfflineFirst.ts`
- Modify: `src/hooks/usePerformanceMonitoring.ts`
- Modify: `src/hooks/usePushNotifications.ts`
- Modify: `src/hooks/useSavedServices.ts`
- Modify: `src/hooks/useSecureSession.ts`
- Modify: `src/pages/*.tsx`

- [ ] **Step 1: Wrap helper functions in `useCallback`**
  For each component/hook where a function is missing from the dependency array, wrap that function in `useCallback` and then add it to the dependency array.

- [ ] **Step 2: Fix `ViewDetailsDialog.tsx`**
  Wrap the `photos` conditional initialization in `useMemo`.

- [ ] **Step 3: Fix `useSecureSession.ts` ref cleanup**
  Copy `activityTimerRef.current` to a variable inside the effect.

- [ ] **Step 4: Verify Task 2**
  Run: `npm run lint` and check if `react-hooks/exhaustive-deps` warnings are significantly reduced.

---

### Task 3: Resolve `react-refresh/only-export-components` warnings

**Files:**
- Modify: `src/components/SEO.tsx`
- Modify: `src/components/examples/PremiumFeatureExample.tsx`
- Modify: `src/components/ui/*.tsx`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/pages/FAQ.tsx`
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Move constants/types from UI components**
  For `button.tsx`, `badge.tsx`, etc., if there are exported constants or variants, ensure they don't trigger the warning. Often this involves ensuring only components are exported if the file is treated as a component file by HMR.

- [ ] **Step 2: Fix `src/routes/index.tsx`**
  Move the route definitions/components to separate files or adjust how they are exported.

- [ ] **Step 3: Fix `SEO.tsx` and `FAQ.tsx`**
  Move shared constants/functions to separate files.

- [ ] **Step 4: Verify Task 3**
  Run: `npm run lint` and check if `react-refresh/only-export-components` warnings are gone.

---

### Final Verification

- [ ] **Step 1: Run final lint**
  Run: `npm run lint`
  Expected: 0 warnings (or as few as possible).

- [ ] **Step 2: Run build**
  Run: `npm run build`
  Expected: Success.
