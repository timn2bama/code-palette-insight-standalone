# XSS Prevention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure `SyncStyle` from XSS by sanitizing wardrobe item descriptions in `ViewDetailsDialog.tsx` using `DOMPurify`.

**Architecture:** Remediation using `DOMPurify` for HTML sanitation in React components.

**Tech Stack:** React, TypeScript, Vitest, DOMPurify.

---

### Task 1: Environment Setup & Verification

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**
Run: `npm install dompurify @types/dompurify`
Expected: Success.

- [ ] **Step 2: Verify current tests pass**
Run: `npm test`
Expected: 0 failures.

### Task 2: Create Failing Test for XSS (TDD)

**Files:**
- Create: `src/components/__tests__/ViewDetailsDialog.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
import { render, screen } from '@testing-library/react';
import ViewDetailsDialog from '../ViewDetailsDialog';
import { vi, expect, test, describe } from 'vitest';
import React from 'react';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: { from: vi.fn() },
    from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({ data: [], error: null })
            })
        })
    }),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockItem = {
  id: '1',
  name: 'Test Item',
  category: 'tops',
  wearCount: 0,
  lastWorn: 'Never',
  color: 'Black',
  brand: 'Test Brand',
  photo_url: null,
  description: '<img src=x onerror=alert(1)> Safe description'
};

describe('ViewDetailsDialog', () => {
  test('sanitizes description to prevent XSS', () => {
    render(
      <ViewDetailsDialog item={mockItem as any}>
        <button>Open</button>
      </ViewDetailsDialog>
    );
    
    // Open the dialog
    screen.getByText('Open').click();
    
    // Check if "Safe description" is present
    const descriptionContainer = screen.getByText(/Safe description/);
    expect(descriptionContainer.innerHTML).not.toContain('onerror');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/__tests__/ViewDetailsDialog.test.tsx`
Expected: FAIL (either because description is missing or not sanitized)

### Task 3: Implement XSS Prevention

**Files:**
- Modify: `src/components/ViewDetailsDialog.tsx`

- [ ] **Step 1: Add description to ClothingItem interface**

```typescript
interface ClothingItem {
  id: string;
  name: string;
  category: string;
  wearCount: number;
  lastWorn: string;
  color: string | null;
  brand: string | null;
  photo_url: string | null;
  description?: string; // Add this
}
```

- [ ] **Step 2: Sanitize and render description**

In `src/components/ViewDetailsDialog.tsx`, import DOMPurify:
`import DOMPurify from 'dompurify';`

Find the location to render it (e.g., before Wear Statistics):
```typescript
            {item.description && (
              <Card>
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Description
                  </h4>
                  <div 
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }} 
                  />
                </CardContent>
              </Card>
            )}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/ViewDetailsDialog.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add package.json src/components/ViewDetailsDialog.tsx src/components/__tests__/ViewDetailsDialog.test.tsx
git commit -m "security: add XSS prevention for item descriptions using DOMPurify"
```
