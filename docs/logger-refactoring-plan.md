# Logger Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all direct `console.log`, `console.warn`, and `console.error` calls with the custom `logger` utility in the SyncStyle project to centralize logging.

**Architecture:** Use the existing `logger` utility from `@/utils/logger`. Import it into each file and replace the console methods with corresponding logger methods (`info`, `warn`, `error`).

**Tech Stack:** React, TypeScript, Vite.

---

### Task 1: Component Refactoring (General)

**Files:**
- Modify: `src/components/AddToOutfitDialog.tsx`
- Modify: `src/components/CreateOutfitDialog.tsx`
- Modify: `src/components/ErrorBoundary.tsx`
- Modify: `src/components/PrivacyControls.tsx`
- Modify: `src/components/ViewDetailsDialog.tsx`
- Modify: `src/components/WardrobeAnalyticsDashboard.tsx`

- [ ] **Step 1: Refactor components**
    - Add `import { logger } from "@/utils/logger";`
    - Replace `console.log` with `logger.info`
    - Replace `console.warn` with `logger.warn`
    - Replace `console.error` with `logger.error`

### Task 2: AI Stylist & Marketplace Refactoring

**Files:**
- Modify: `src/components/ai-stylist/AIStylistDashboard.tsx`
- Modify: `src/components/ai-stylist/DailyOutfitSuggestion.tsx`
- Modify: `src/components/marketplace/CreateMarketplaceListingDialog.tsx`
- Modify: `src/components/marketplace/CreateRentalListingDialog.tsx`
- Modify: `src/components/marketplace/MarketplaceHome.tsx`
- Modify: `src/components/marketplace/RentalListingsDialog.tsx`

- [ ] **Step 1: Refactor AI and Marketplace components**
    - Add `import { logger } from "@/utils/logger";`
    - Replace `console.log` with `logger.info`
    - Replace `console.warn` with `logger.warn`
    - Replace `console.error` with `logger.error`

### Task 3: Sustainability, Weather, and Auth Refactoring

**Files:**
- Modify: `src/components/sustainability/SustainabilityDashboard.tsx`
- Modify: `src/components/weather/OutfitSuggestions.tsx`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/hooks/queries/useAuth.ts`
- Modify: `src/hooks/queries/useDataExport.ts`
- Modify: `src/hooks/queries/useSubscriptionTiers.ts`

- [ ] **Step 1: Refactor Sustainability, Weather, and Auth files**
    - Add `import { logger } from "@/utils/logger";`
    - Replace `console.log` with `logger.info`
    - Replace `console.warn` with `logger.warn`
    - Replace `console.error` with `logger.error`

### Task 4: Hook Refactoring (Part 1)

**Files:**
- Modify: `src/hooks/queries/useWardrobeAnalytics.ts`
- Modify: `src/hooks/queries/useWeatherData.ts`
- Modify: `src/hooks/useAccessibility.ts`
- Modify: `src/hooks/useAuditLog.ts`
- Modify: `src/hooks/useCameraIntegration.ts`
- Modify: `src/hooks/useComputerVision.ts`

- [ ] **Step 1: Refactor hooks**
    - Add `import { logger } from "@/utils/logger";`
    - Replace `console.log` with `logger.info`
    - Replace `console.warn` with `logger.warn`
    - Replace `console.error` with `logger.error`

### Task 5: Hook Refactoring (Part 2)

**Files:**
- Modify: `src/hooks/useEnhancedClaude.ts`
- Modify: `src/hooks/useErrorLogger.ts`
- Modify: `src/hooks/useImageUpload.ts`
- Modify: `src/hooks/useIntegrations.ts`
- Modify: `src/hooks/useOfflineFirst.ts`
- Modify: `src/hooks/useOutfitLogging.ts`

- [ ] **Step 1: Refactor hooks**
    - Add `import { logger } from "@/utils/logger";`
    - Replace `console.log` with `logger.info`
    - Replace `console.warn` with `logger.warn`
    - Replace `console.error` with `logger.error`

### Task 6: Hook Refactoring (Part 3) & Main

**Files:**
- Modify: `src/hooks/useOutfitRecommendations.ts`
- Modify: `src/hooks/usePerformanceMonitoring.ts`
- Modify: `src/hooks/usePremiumFeature.ts`
- Modify: `src/hooks/usePushNotifications.ts`
- Modify: `src/hooks/useRealUserMonitoring.ts`
- Modify: `src/hooks/useSavedServices.ts`
- Modify: `src/hooks/useSocialOutfits.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Refactor remaining hooks and main.tsx**
    - Add `import { logger } from "@/utils/logger";`
    - Replace `console.log` with `logger.info`
    - Replace `console.warn` with `logger.warn`
    - Replace `console.error` with `logger.error`

### Task 7: Verification

- [ ] **Step 1: Search for remaining console calls**
    - Run `grep -r "console." src`
    - Ensure only `src/utils/logger.ts` has console calls.

- [ ] **Step 2: Verify build**
    - Run `npm run build` or `tsc` to check for type errors.
