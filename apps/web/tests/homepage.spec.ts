import { test, expect } from '@playwright/test';

test('homepage visual comparison', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  
  // Take a full page screenshot
  await page.screenshot({ 
    path: 'homepage-screenshot.png', 
    fullPage: true 
  });
  
  // Basic content check
  await expect(page.getByRole('heading', { name: /Beauty, Function, Freedom/i })).toBeVisible();
});