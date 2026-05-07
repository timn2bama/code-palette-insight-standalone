# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smart-outfit-ai.spec.ts >> Smart AI Outfit Suggestions >> validation prevents generation without location
- Location: e2e\smart-outfit-ai.spec.ts:19:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Smart AI Outfit Suggestions/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Welcome Back" [level=3] [ref=e6]
      - paragraph [ref=e7]: Sign in to your account
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - text: Email
          - textbox "Email" [ref=e11]:
            - /placeholder: your@email.com
        - generic [ref=e12]:
          - text: Password
          - textbox "Password" [ref=e13]:
            - /placeholder: ••••••••
        - button "Sign In" [ref=e14] [cursor=pointer]
      - generic [ref=e15]:
        - paragraph [ref=e16]: Don't have an account?
        - button "Sign Up" [ref=e17] [cursor=pointer]
  - generic [ref=e19]:
    - generic [ref=e20]:
      - heading "Performance Monitor" [level=3] [ref=e21]:
        - img [ref=e22]
        - text: Performance Monitor
      - paragraph [ref=e24]: Real-time web vitals and performance metrics
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - img [ref=e29]
            - generic [ref=e31]: cls
          - generic [ref=e32]:
            - generic [ref=e33]: "0.100"
            - generic [ref=e34]: ✓
        - progressbar [ref=e35]
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - img [ref=e40]
            - generic [ref=e43]: fid
          - generic [ref=e44]:
            - generic [ref=e45]: 50ms
            - generic [ref=e46]: ✓
        - progressbar [ref=e47]
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - img [ref=e52]
            - generic [ref=e55]: fcp
          - generic [ref=e56]:
            - generic [ref=e57]: 1200ms
            - generic [ref=e58]: ✓
        - progressbar [ref=e59]
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - img [ref=e64]
            - generic [ref=e66]: lcp
          - generic [ref=e67]:
            - generic [ref=e68]: 2100ms
            - generic [ref=e69]: ✓
        - progressbar [ref=e70]
      - generic [ref=e72]:
        - generic [ref=e73]:
          - generic [ref=e74]:
            - img [ref=e75]
            - generic [ref=e78]: ttfb
          - generic [ref=e79]:
            - generic [ref=e80]: 300ms
            - generic [ref=e81]: ✓
        - progressbar [ref=e82]
      - generic [ref=e85]: "Press Ctrl+Shift+P to toggle • Session: s4oca739"
  - generic [ref=e86]:
    - img [ref=e88]
    - button "Open Tanstack query devtools" [ref=e136] [cursor=pointer]:
      - img [ref=e137]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Smart AI Outfit Suggestions', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Note: In a real test, we would handle authentication here
  6  |     // For this prototype, we'll assume the user is already logged in or handle public views
  7  |     await page.goto('/outfits');
  8  |   });
  9  | 
  10 |   test('user can open AI suggestions dialog', async ({ page }) => {
  11 |     const aiButton = page.getByRole('button', { name: /Smart AI Outfit Suggestions/i });
  12 |     await expect(aiButton).toBeVisible();
  13 |     await aiButton.click();
  14 | 
  15 |     await expect(page.getByRole('dialog')).toBeVisible();
  16 |     await expect(page.getByText('Smart AI Outfit Suggestions', { exact: true }).first()).toBeVisible();
  17 |   });
  18 | 
  19 |   test('validation prevents generation without location', async ({ page }) => {
> 20 |     await page.getByRole('button', { name: /Smart AI Outfit Suggestions/i }).click();
     |                                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  21 |     
  22 |     const generateButton = page.getByRole('button', { name: /Generate AI Suggestions/i });
  23 |     await expect(generateButton).toBeDisabled();
  24 |     
  25 |     const locationInput = page.getByPlaceholder(/e.g., New York/i);
  26 |     await locationInput.fill('');
  27 |     await expect(generateButton).toBeDisabled();
  28 |   });
  29 | 
  30 |   test('preferences form is interactive', async ({ page }) => {
  31 |     await page.getByRole('button', { name: /Smart AI Outfit Suggestions/i }).click();
  32 |     
  33 |     const locationInput = page.getByPlaceholder(/e.g., New York/i);
  34 |     await locationInput.fill('Paris, France');
  35 |     
  36 |     const preferencesInput = page.getByPlaceholder(/e.g., I prefer casual looks/i);
  37 |     await preferencesInput.fill('Formal dinner party');
  38 |     
  39 |     await expect(page.getByRole('button', { name: /Generate AI Suggestions/i })).toBeEnabled();
  40 |   });
  41 | });
  42 | 
```