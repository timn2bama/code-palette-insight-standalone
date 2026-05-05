import { test, expect } from '@playwright/test';

test.describe('Smart AI Outfit Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real test, we would handle authentication here
    // For this prototype, we'll assume the user is already logged in or handle public views
    await page.goto('/outfits');
  });

  test('user can open AI suggestions dialog', async ({ page }) => {
    const aiButton = page.getByRole('button', { name: /Smart AI Outfit Suggestions/i });
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Smart AI Outfit Suggestions', { exact: true }).first()).toBeVisible();
  });

  test('validation prevents generation without location', async ({ page }) => {
    await page.getByRole('button', { name: /Smart AI Outfit Suggestions/i }).click();
    
    const generateButton = page.getByRole('button', { name: /Generate AI Suggestions/i });
    await expect(generateButton).toBeDisabled();
    
    const locationInput = page.getByPlaceholder(/e.g., New York/i);
    await locationInput.fill('');
    await expect(generateButton).toBeDisabled();
  });

  test('preferences form is interactive', async ({ page }) => {
    await page.getByRole('button', { name: /Smart AI Outfit Suggestions/i }).click();
    
    const locationInput = page.getByPlaceholder(/e.g., New York/i);
    await locationInput.fill('Paris, France');
    
    const preferencesInput = page.getByPlaceholder(/e.g., I prefer casual looks/i);
    await preferencesInput.fill('Formal dinner party');
    
    await expect(page.getByRole('button', { name: /Generate AI Suggestions/i })).toBeEnabled();
  });
});
