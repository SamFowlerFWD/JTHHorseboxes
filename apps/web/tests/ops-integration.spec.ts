import { test, expect } from '@playwright/test'

test.describe('Operations Platform Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the ops dashboard
    await page.goto('http://localhost:3001/ops')
  })

  test('should load dashboard with real-time data', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('h1:has-text("Operations Dashboard")', { timeout: 10000 })
    
    // Check if loading state appears and disappears
    const loading = page.locator('text=Loading dashboard data')
    if (await loading.isVisible()) {
      await expect(loading).toBeHidden({ timeout: 10000 })
    }
    
    // Check for metrics cards
    await expect(page.locator('text=Pipeline Value')).toBeVisible()
    await expect(page.locator('text=Production Status')).toBeVisible()
    await expect(page.locator('text=Inventory Alerts')).toBeVisible()
    await expect(page.locator('text=Customers')).toBeVisible()
    
    // Check for recent activity section
    await expect(page.locator('text=Recent Activity')).toBeVisible()
    
    // Check for upcoming deliveries
    await expect(page.locator('text=Upcoming Deliveries')).toBeVisible()
  })

  test('should load sales pipeline with drag and drop', async ({ page }) => {
    // Navigate to pipeline
    await page.goto('http://localhost:3001/ops/pipeline')
    
    // Wait for the pipeline to load
    await page.waitForSelector('h1:has-text("Sales Pipeline")', { timeout: 10000 })
    
    // Check if loading state appears and disappears
    const loading = page.locator('text=Loading pipeline data')
    if (await loading.isVisible()) {
      await expect(loading).toBeHidden({ timeout: 10000 })
    }
    
    // Check for pipeline stages
    await expect(page.locator('text=Inquiry')).toBeVisible()
    await expect(page.locator('text=Qualification')).toBeVisible()
    await expect(page.locator('text=Specification')).toBeVisible()
    await expect(page.locator('text=Quotation')).toBeVisible()
    
    // Check for Add Lead button
    await expect(page.locator('button:has-text("Add Lead")')).toBeVisible()
  })

  test('should open add lead dialog', async ({ page }) => {
    await page.goto('http://localhost:3001/ops/pipeline')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Sales Pipeline")')
    
    // Click Add Lead button
    await page.click('button:has-text("Add Lead")')
    
    // Check if dialog opens
    await expect(page.locator('text=Add New Lead')).toBeVisible()
    await expect(page.locator('label:has-text("Organization")')).toBeVisible()
    await expect(page.locator('label:has-text("First Name")')).toBeVisible()
    await expect(page.locator('label:has-text("Email")')).toBeVisible()
  })

  test('should load production tracking', async ({ page }) => {
    // Navigate to builds
    await page.goto('http://localhost:3001/ops/builds')
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Production Tracking")', { timeout: 10000 })
    
    // Check if loading state appears and disappears
    const loading = page.locator('text=Loading production data')
    if (await loading.isVisible()) {
      await expect(loading).toBeHidden({ timeout: 10000 })
    }
    
    // Check for metrics
    await expect(page.locator('text=Total Jobs')).toBeVisible()
    await expect(page.locator('text=In Progress')).toBeVisible()
    await expect(page.locator('text=On Schedule')).toBeVisible()
    await expect(page.locator('text=Avg Completion')).toBeVisible()
    
    // Check for filter dropdown
    await expect(page.locator('text=All Jobs')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page, context }) => {
    // Block API requests to simulate error
    await context.route('**/api/ops/dashboard', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Server error' })
      })
    })
    
    await page.goto('http://localhost:3001/ops')
    
    // Check for error state
    await expect(page.locator('text=Server error')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button:has-text("Retry")')).toBeVisible()
  })

  test('should refresh data when retry is clicked', async ({ page, context }) => {
    let requestCount = 0
    
    // First request fails, second succeeds
    await context.route('**/api/ops/dashboard', route => {
      requestCount++
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ success: false, error: 'Server error' })
        })
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: {
              metrics: {
                salesPipeline: { value: 100000, change: 10, leads: 5 },
                production: { inProgress: 2, scheduled: 1, onTime: 90, blocked: 0 },
                inventory: { lowStock: 3, reorderNeeded: 1, totalItems: 150 },
                customers: { total: 100, new: 10, active: 20 }
              },
              recentActivities: [],
              upcomingDeliveries: []
            }
          })
        })
      }
    })
    
    await page.goto('http://localhost:3001/ops')
    
    // Wait for error
    await expect(page.locator('text=Server error')).toBeVisible({ timeout: 10000 })
    
    // Click retry
    await page.click('button:has-text("Retry")')
    
    // Check that data loads
    await expect(page.locator('text=Pipeline Value')).toBeVisible({ timeout: 10000 })
  })
})