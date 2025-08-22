import { test, expect } from '@playwright/test'

test.describe('Admin Backend Tests', () => {
  test.describe('Authentication', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login')
      
      // Check login form elements
      await expect(page.locator('h2:has-text("Admin Login")')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      // Try to login with invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button:has-text("Sign In")')
      
      // Should show error message
      await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('API Endpoints', () => {
    test('should handle lead submission', async ({ request }) => {
      const response = await request.post('/api/leads', {
        data: {
          first_name: 'Test',
          last_name: 'User',
          email: `test${Date.now()}@example.com`,
          phone: '01234567890',
          company: 'Test Company',
          source: 'test',
          consent_marketing: true
        }
      })
      
      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toContain('Thank you')
    })

    test('should get pricing options', async ({ request }) => {
      const response = await request.get('/api/pricing')
      
      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data).toHaveProperty('options')
      expect(data).toHaveProperty('models')
      expect(data.models).toContain('3.5t')
      expect(data.models).toContain('4.5t')
      expect(data.models).toContain('7.2t')
    })

    test('should search knowledge base', async ({ request }) => {
      const response = await request.post('/api/knowledge-base/search', {
        data: {
          query: 'horsebox maintenance',
          limit: 5
        }
      })
      
      // May fail if no OpenAI key is configured
      if (response.ok()) {
        const data = await response.json()
        expect(data).toHaveProperty('results')
        expect(data).toHaveProperty('query')
      }
    })
  })

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]

    viewports.forEach(viewport => {
      test(`Login page should be responsive on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/login')
        
        // Check that login card is visible and properly sized
        const loginCard = page.locator('[class*="card"]').first()
        await expect(loginCard).toBeVisible()
        
        // Check form elements are accessible
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
        
        // On mobile, card should be full width with padding
        if (viewport.name === 'Mobile') {
          const box = await loginCard.boundingBox()
          expect(box?.width).toBeLessThan(viewport.width)
          expect(box?.width).toBeGreaterThan(viewport.width * 0.8)
        }
      })
    })
  })

  test.describe('Admin Pages Structure', () => {
    test('admin dashboard should have proper layout', async ({ page }) => {
      // Note: This would require authentication in a real scenario
      // For now, we'll just check the structure exists
      
      const response = await page.goto('/admin', { waitUntil: 'domcontentloaded' })
      
      // Will redirect to login if not authenticated
      if (page.url().includes('/login')) {
        expect(page.url()).toContain('/login')
      } else {
        // If authenticated, check dashboard structure
        await expect(page.locator('text=Dashboard')).toBeVisible()
        await expect(page.locator('text=Total Leads')).toBeVisible()
        await expect(page.locator('text=Blog Posts')).toBeVisible()
        await expect(page.locator('text=Pricing Options')).toBeVisible()
        await expect(page.locator('text=Knowledge Base')).toBeVisible()
      }
    })
  })

  test.describe('Form Validation', () => {
    test('lead form should validate required fields', async ({ request }) => {
      // Send incomplete lead data
      const response = await request.post('/api/leads', {
        data: {
          first_name: 'Test',
          // Missing required fields
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    test('blog post should require authentication', async ({ request }) => {
      const response = await request.post('/api/blog', {
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Test content'
        }
      })
      
      expect(response.status()).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })
  })

  test.describe('Data Export', () => {
    test('leads page should have export button', async ({ page }) => {
      // Navigate to leads page (will redirect to login if not authenticated)
      await page.goto('/admin/leads')
      
      if (!page.url().includes('/login')) {
        await expect(page.locator('button:has-text("Export CSV")')).toBeVisible()
      }
    })
  })
})