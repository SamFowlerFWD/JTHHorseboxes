import { test, expect } from '@playwright/test';

test.describe('Model Pages', () => {
  // Test all three 3.5t model pages
  const models = [
    { 
      slug: 'professional-35', 
      name: 'Professional 35', 
      price: '£22,000',
      description: 'ultimate 3.5 tonne horsebox'
    },
    { 
      slug: 'principle-35', 
      name: 'Principle 35', 
      price: '£18,500',
      description: 'perfect balance of quality and value'
    },
    { 
      slug: 'progeny-35', 
      name: 'Progeny 35', 
      price: '£25,500',
      description: 'flagship 3.5 tonne horsebox'
    }
  ];

  for (const model of models) {
    test(`${model.name} page loads without 404`, async ({ page }) => {
      // Navigate to the model page
      const response = await page.goto(`/models/${model.slug}`);
      
      // Verify page loads successfully (not 404)
      expect(response?.status()).toBe(200);
      
      // Verify model name appears on page
      await expect(page.locator('h1')).toContainText(model.name);
      
      // Verify price is displayed (use first match as there might be multiple)
      await expect(page.locator('text=' + model.price).first()).toBeVisible();
      
      // Verify description contains expected text
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain(model.description);
      
      // Verify key sections are present (use first match)
      await expect(page.locator('text=Specifications').first()).toBeVisible();
      await expect(page.locator('text=Key Features').first()).toBeVisible();
      
      // Verify CTA buttons are present (use first match)
      await expect(page.locator(`a[href="/configurator/${model.slug}"]`).first()).toBeVisible();
      await expect(page.locator('text=Call 01603 552109').first()).toBeVisible();
    });
  }

  test('Home page links to model pages work', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    // Test each model link
    for (const model of models) {
      // Find and click the model link
      const modelLink = page.locator(`a[href="/models/${model.slug}"]`).first();
      await expect(modelLink).toBeVisible();
      
      // Click and verify navigation
      await modelLink.click();
      await page.waitForURL(`**/models/${model.slug}`);
      
      // Verify we're on the right page
      await expect(page.locator('h1')).toContainText(model.name);
      
      // Go back to home page for next test
      await page.goto('/');
    }
  });

  test('Models listing page shows all three models', async ({ page }) => {
    // Go to models listing page
    await page.goto('/models');
    
    // Verify page loads
    expect(page.url()).toContain('/models');
    
    // Verify all three models are listed
    for (const model of models) {
      await expect(page.locator(`text=${model.name}`).first()).toBeVisible();
      await expect(page.locator(`text=${model.price}`).first()).toBeVisible();
    }
    
    // Verify at least our 3 main models are shown
    // Note: We still show other models (Aeos, Helios) in listings, just not their detail pages yet
    const modelCards = await page.locator('.grid > div').count();
    expect(modelCards).toBeGreaterThanOrEqual(3);
  });

  test('Home page shows correct pricing', async ({ page }) => {
    await page.goto('/');
    
    // Verify hero section shows correct starting price
    await expect(page.locator('text=from £18,500').first()).toBeVisible();
    
    // Verify model cards show correct prices
    await expect(page.locator('text=Professional 35').first().locator('..').locator('text=£22,000')).toBeVisible();
    await expect(page.locator('text=Principle 35').first().locator('..').locator('text=£18,500')).toBeVisible();
    await expect(page.locator('text=Progeny 35').first().locator('..').locator('text=£25,500')).toBeVisible();
    
    // Verify Pioneer Package is mentioned
    await expect(page.locator('text=Pioneer Package').first()).toBeVisible();
    await expect(page.locator('text=£10,800').first()).toBeVisible();
  });

  test('Model page SEO elements are present', async ({ page }) => {
    // Test Professional 35 as example
    await page.goto('/models/professional-35');
    
    // Check meta title
    const title = await page.title();
    expect(title).toContain('Professional 35');
    expect(title).toContain('JTH');
    
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toContain('Professional 35');
    expect(metaDescription).toContain('3.5 tonne');
    expect(metaDescription).toContain('£22,000');
    
    // Check structured data
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    expect(scripts.length).toBeGreaterThan(0);
  });

  test('404 page shows for non-existent models', async ({ page }) => {
    // Try to access a non-existent model
    const response = await page.goto('/models/non-existent-model');
    
    // Should return 404
    expect(response?.status()).toBe(404);
    
    // Should show 404 message
    await expect(page.locator('text=404')).toBeVisible();
  });
});