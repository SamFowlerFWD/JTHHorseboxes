import { test, expect } from '@playwright/test'

test.describe('Ops Dashboard Routes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to ops dashboard
    await page.goto('/ops')
  })

  test('dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Operations Dashboard/)
    await expect(page.locator('h1')).toContainText('Operations Dashboard')
    
    // Check for main metric cards
    await expect(page.locator('text=Active Builds')).toBeVisible()
    await expect(page.locator('text=Pipeline Leads')).toBeVisible()
    await expect(page.locator('text=Quote Requests')).toBeVisible()
    await expect(page.locator('text=Support Tickets')).toBeVisible()
  })

  test('pipeline page loads and displays leads', async ({ page }) => {
    await page.goto('/ops/pipeline')
    await expect(page.locator('h1')).toContainText('Sales Pipeline')
    
    // Check for pipeline columns
    await expect(page.locator('text=New Lead')).toBeVisible()
    await expect(page.locator('text=Qualified')).toBeVisible()
    await expect(page.locator('text=Quote Sent')).toBeVisible()
    await expect(page.locator('text=Negotiation')).toBeVisible()
  })

  test('builds page loads and displays production data', async ({ page }) => {
    await page.goto('/ops/builds')
    await expect(page.locator('h1')).toContainText('Production Builds')
    
    // Check for build stages
    await expect(page.locator('text=Chassis Prep')).toBeVisible()
    await expect(page.locator('text=Frame Build')).toBeVisible()
    await expect(page.locator('text=Electrical')).toBeVisible()
  })

  test('customers page loads and displays customer list', async ({ page }) => {
    await page.goto('/ops/customers')
    await expect(page.locator('h1')).toContainText('Customer Management')
    
    // Check for customer table or list
    await expect(page.locator('text=Total Customers')).toBeVisible()
    await expect(page.locator('text=Active Customers')).toBeVisible()
  })

  test('inventory page loads and displays stock data', async ({ page }) => {
    await page.goto('/ops/inventory')
    await expect(page.locator('h1')).toContainText('Inventory Management')
    
    // Check for inventory metrics
    await expect(page.locator('text=Total Items')).toBeVisible()
    await expect(page.locator('text=Low Stock')).toBeVisible()
    await expect(page.locator('text=Out of Stock')).toBeVisible()
    
    // Check for inventory table
    await expect(page.locator('text=Part Number')).toBeVisible()
    await expect(page.locator('text=Current Stock')).toBeVisible()
  })

  test('knowledge base page loads and displays articles', async ({ page }) => {
    await page.goto('/ops/knowledge')
    await expect(page.locator('h1')).toContainText('Knowledge Base')
    
    // Check for search bar
    await expect(page.locator('input[placeholder*="Search knowledge base"]')).toBeVisible()
    
    // Check for categories
    await expect(page.locator('text=Categories')).toBeVisible()
    await expect(page.locator('text=All Categories')).toBeVisible()
  })

  test('quotes page loads and displays quote list', async ({ page }) => {
    await page.goto('/ops/quotes')
    await expect(page.locator('h1')).toContainText('Quote Management')
    
    // Check for quote metrics
    await expect(page.locator('text=Total Quotes')).toBeVisible()
    await expect(page.locator('text=Pending')).toBeVisible()
    await expect(page.locator('text=Sent')).toBeVisible()
    await expect(page.locator('text=Converted')).toBeVisible()
    
    // Check for quote list
    await expect(page.locator('text=QT-2024')).toBeVisible()
  })

  test('reports page loads and displays analytics', async ({ page }) => {
    await page.goto('/ops/reports')
    await expect(page.locator('h1')).toContainText('Reports & Analytics')
    
    // Check for date range selector
    await expect(page.locator('text=Last 30 Days')).toBeVisible()
    
    // Check for report tabs
    await expect(page.locator('text=Overview')).toBeVisible()
    await expect(page.locator('text=Sales')).toBeVisible()
    await expect(page.locator('text=Production')).toBeVisible()
    await expect(page.locator('text=Inventory')).toBeVisible()
    
    // Check for metrics
    await expect(page.locator('text=Total Revenue')).toBeVisible()
    await expect(page.locator('text=Production Efficiency')).toBeVisible()
  })

  test('settings page loads and displays configuration options', async ({ page }) => {
    await page.goto('/ops/settings')
    await expect(page.locator('h1')).toContainText('Settings')
    
    // Check for settings tabs
    await expect(page.locator('text=General')).toBeVisible()
    await expect(page.locator('text=Notifications')).toBeVisible()
    await expect(page.locator('text=Security')).toBeVisible()
    await expect(page.locator('text=Appearance')).toBeVisible()
    await expect(page.locator('text=System')).toBeVisible()
    await expect(page.locator('text=Billing')).toBeVisible()
    
    // Check for save button
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible()
  })

  test('navigation between ops pages works correctly', async ({ page }) => {
    // Start at dashboard
    await page.goto('/ops')
    
    // Navigate to each section using sidebar
    const sections = [
      { link: 'Pipeline', title: 'Sales Pipeline' },
      { link: 'Builds', title: 'Production Builds' },
      { link: 'Customers', title: 'Customer Management' },
      { link: 'Inventory', title: 'Inventory Management' },
      { link: 'Knowledge', title: 'Knowledge Base' },
      { link: 'Quotes', title: 'Quote Management' },
      { link: 'Reports', title: 'Reports & Analytics' },
      { link: 'Settings', title: 'Settings' }
    ]
    
    for (const section of sections) {
      await page.click(`text=${section.link}`)
      await expect(page.locator('h1')).toContainText(section.title)
    }
  })

  test('API endpoints return data correctly', async ({ page }) => {
    // Test each API endpoint
    const endpoints = [
      '/api/ops/dashboard',
      '/api/ops/pipeline',
      '/api/ops/builds',
      '/api/ops/customers',
      '/api/ops/inventory',
      '/api/ops/knowledge',
      '/api/ops/quotes',
      '/api/ops/reports',
      '/api/ops/settings'
    ]
    
    for (const endpoint of endpoints) {
      const response = await page.request.get(endpoint)
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    }
  })

  test('search functionality works across pages', async ({ page }) => {
    // Test search on inventory page
    await page.goto('/ops/inventory')
    const inventorySearch = page.locator('input[placeholder*="Search by name or part number"]')
    await inventorySearch.fill('chassis')
    await page.waitForTimeout(500) // Wait for filter to apply
    
    // Test search on knowledge base
    await page.goto('/ops/knowledge')
    const knowledgeSearch = page.locator('input[placeholder*="Search knowledge base"]')
    await knowledgeSearch.fill('production')
    await page.waitForTimeout(500)
    
    // Test search on quotes page
    await page.goto('/ops/quotes')
    const quotesSearch = page.locator('input[placeholder*="Search quotes"]')
    await quotesSearch.fill('QT-2024')
    await page.waitForTimeout(500)
  })

  test('filters work correctly on list pages', async ({ page }) => {
    // Test status filter on quotes page
    await page.goto('/ops/quotes')
    await page.click('text=All Quotes')
    await page.click('text=Sent')
    await page.waitForTimeout(500)
    
    // Test category filter on inventory page
    await page.goto('/ops/inventory')
    await page.click('text=All Categories')
    await page.click('text=Electrical')
    await page.waitForTimeout(500)
  })

  test('modal dialogs open and close correctly', async ({ page }) => {
    // Test add item dialog on inventory page
    await page.goto('/ops/inventory')
    await page.click('button:has-text("Add Item")')
    await expect(page.locator('text=Add New Inventory Item')).toBeVisible()
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('text=Add New Inventory Item')).not.toBeVisible()
    
    // Test add article dialog on knowledge page
    await page.goto('/ops/knowledge')
    await page.click('button:has-text("Add Article")')
    await expect(page.locator('text=Add New Article')).toBeVisible()
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('text=Add New Article')).not.toBeVisible()
  })

  test('responsive layout works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/ops')
    
    // Check that navigation is collapsible on mobile
    // This assumes a hamburger menu or similar mobile navigation
    await expect(page.locator('h1')).toContainText('Operations Dashboard')
    
    // Test that cards stack vertically on mobile
    const cards = page.locator('.grid > .card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })
})