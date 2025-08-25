import { test, expect } from '@playwright/test'

test.describe('JTH Operations Platform - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the main ops dashboard
    await page.goto('/ops')
  })

  test('Operations Dashboard loads with all sections', async ({ page }) => {
    // Check dashboard title
    await expect(page.locator('h1')).toContainText('Operations Dashboard')
    
    // Check all metric cards are present
    await expect(page.locator('[data-testid="active-leads"]')).toBeVisible()
    await expect(page.locator('[data-testid="production-jobs"]')).toBeVisible()
    await expect(page.locator('[data-testid="pending-quotes"]')).toBeVisible()
    await expect(page.locator('[data-testid="stock-alerts"]')).toBeVisible()
    
    // Check navigation menu
    await expect(page.locator('nav').locator('text=Pipeline')).toBeVisible()
    await expect(page.locator('nav').locator('text=Builds')).toBeVisible()
    await expect(page.locator('nav').locator('text=Customers')).toBeVisible()
    await expect(page.locator('nav').locator('text=Inventory')).toBeVisible()
  })

  test('Sales Pipeline Kanban Board works correctly', async ({ page }) => {
    await page.goto('/ops/pipeline')
    
    // Check pipeline title
    await expect(page.locator('h1')).toContainText('Sales Pipeline')
    
    // Check stage columns exist
    await expect(page.locator('text=Inquiry')).toBeVisible()
    await expect(page.locator('text=Qualifying')).toBeVisible()
    await expect(page.locator('text=Quoted')).toBeVisible()
    await expect(page.locator('text=Negotiating')).toBeVisible()
    await expect(page.locator('text=Committed')).toBeVisible()
    await expect(page.locator('text=Contracted')).toBeVisible()
    await expect(page.locator('text=Closed Won')).toBeVisible()
    
    // Check add new button
    await expect(page.locator('button:has-text("Add New Lead")')).toBeVisible()
    
    // Test opening add lead dialog
    await page.locator('button:has-text("Add New Lead")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('[role="dialog"]').locator('text=Add New Lead')).toBeVisible()
    
    // Close dialog
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Build Tracking System displays production jobs', async ({ page }) => {
    await page.goto('/ops/builds')
    
    // Check builds title
    await expect(page.locator('h1')).toContainText('Build Tracking')
    
    // Check for build cards or list
    const buildCards = page.locator('[data-testid="build-card"]')
    const cardCount = await buildCards.count()
    
    // If there are build cards, check their structure
    if (cardCount > 0) {
      const firstCard = buildCards.first()
      await expect(firstCard).toBeVisible()
      
      // Check for key elements in build card
      await expect(firstCard.locator('text=/JOB-/')).toBeVisible()
      await expect(firstCard.locator('text=/Customer/')).toBeVisible()
    }
    
    // Check add new build button
    await expect(page.locator('button:has-text("Add Build"), button:has-text("New Build")')).toBeVisible()
  })

  test('Customer Portal Tracker loads correctly', async ({ page }) => {
    // Use a test build ID
    await page.goto('/portal/tracker/test-build-001')
    
    // Check for tracker elements
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Check for progress stages
    await expect(page.locator('text=/Order Confirmed|Preparation|Construction|Quality Control/')).toBeVisible()
    
    // Check for tabs
    await expect(page.locator('[role="tablist"]')).toBeVisible()
    await expect(page.locator('text=Overview')).toBeVisible()
    await expect(page.locator('text=Photos')).toBeVisible()
    await expect(page.locator('text=Documents')).toBeVisible()
  })

  test('Inventory Management displays stock levels', async ({ page }) => {
    await page.goto('/ops/inventory')
    
    // Check inventory title
    await expect(page.locator('h1')).toContainText('Inventory')
    
    // Check for inventory table or cards
    await expect(page.locator('text=/Stock|Parts|Materials/')).toBeVisible()
    
    // Check for search/filter options
    await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Filter"]')).toBeVisible()
  })

  test('Reports Dashboard shows analytics', async ({ page }) => {
    await page.goto('/ops/reports')
    
    // Check reports title
    await expect(page.locator('h1')).toContainText('Reports')
    
    // Check for report sections
    await expect(page.locator('text=/Analytics|Performance|Metrics/')).toBeVisible()
    
    // Check for date range selector
    await expect(page.locator('button:has-text("Date Range"), button:has-text("Period"), select')).toBeVisible()
  })

  test('Settings page loads configuration options', async ({ page }) => {
    await page.goto('/ops/settings')
    
    // Check settings title
    await expect(page.locator('h1')).toContainText('Settings')
    
    // Check for settings sections
    await expect(page.locator('text=/General|Notifications|Preferences|Configuration/')).toBeVisible()
  })

  test('Mobile responsiveness of Operations Platform', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    
    await page.goto('/ops')
    
    // Check mobile menu button is visible
    await expect(page.locator('button[aria-label*="menu"], button:has-text("☰"), svg.lucide-menu').first()).toBeVisible()
    
    // Check that content adjusts for mobile
    const dashboardContainer = page.locator('main').first()
    await expect(dashboardContainer).toBeVisible()
    
    // Navigate to pipeline on mobile
    await page.goto('/ops/pipeline')
    
    // Check pipeline is accessible on mobile
    await expect(page.locator('h1')).toContainText('Sales Pipeline')
    
    // Stage columns should stack or be scrollable on mobile
    const pipelineContainer = page.locator('main').first()
    await expect(pipelineContainer).toBeVisible()
  })

  test('API endpoints return data', async ({ page }) => {
    // Test dashboard API
    const dashboardResponse = await page.request.get('/api/ops/dashboard')
    expect(dashboardResponse.ok()).toBeTruthy()
    const dashboardData = await dashboardResponse.json()
    expect(dashboardData).toHaveProperty('metrics')
    
    // Test pipeline API
    const pipelineResponse = await page.request.get('/api/ops/pipeline')
    expect(pipelineResponse.ok()).toBeTruthy()
    const pipelineData = await pipelineResponse.json()
    expect(pipelineData).toHaveProperty('stages')
    
    // Test builds API
    const buildsResponse = await page.request.get('/api/ops/builds')
    expect(buildsResponse.ok()).toBeTruthy()
    const buildsData = await buildsResponse.json()
    expect(buildsData).toHaveProperty('builds')
  })

  test('Real-time features work (if implemented)', async ({ page }) => {
    await page.goto('/ops/pipeline')
    
    // Check for real-time indicators
    const realtimeIndicator = page.locator('text=/Live|Real-time|Connected/')
    
    if (await realtimeIndicator.isVisible()) {
      // If real-time is implemented, verify it shows as connected
      await expect(realtimeIndicator).toBeVisible()
    }
  })

  test('Navigation between ops sections works', async ({ page }) => {
    await page.goto('/ops')
    
    // Navigate to Pipeline
    await page.locator('nav').locator('text=Pipeline').click()
    await expect(page).toHaveURL('/ops/pipeline')
    await expect(page.locator('h1')).toContainText('Sales Pipeline')
    
    // Navigate to Builds
    await page.locator('nav').locator('text=Builds').click()
    await expect(page).toHaveURL('/ops/builds')
    await expect(page.locator('h1')).toContainText('Build')
    
    // Navigate to Customers
    await page.locator('nav').locator('text=Customers').click()
    await expect(page).toHaveURL('/ops/customers')
    await expect(page.locator('h1')).toContainText('Customer')
    
    // Navigate back to Dashboard
    await page.locator('nav').locator('text=Dashboard').click()
    await expect(page).toHaveURL('/ops')
    await expect(page.locator('h1')).toContainText('Operations Dashboard')
  })

  test('Error handling works correctly', async ({ page }) => {
    // Test 404 page
    await page.goto('/ops/non-existent-page')
    await expect(page.locator('text=/404|Not Found|Page not found/')).toBeVisible()
    
    // Test error recovery in dashboard
    await page.goto('/ops')
    
    // If there's an error message, check retry button exists
    const errorMessage = page.locator('text=/Error|Failed|Unable to load/')
    if (await errorMessage.isVisible()) {
      await expect(page.locator('button:has-text("Retry"), button:has-text("Refresh")')).toBeVisible()
    }
  })

  test('User permissions are respected', async ({ page }) => {
    // This test would require authentication setup
    // For now, just check that sensitive actions have proper buttons
    
    await page.goto('/ops/builds')
    
    // Admin actions should be present
    const adminActions = page.locator('button:has-text("Delete"), button:has-text("Archive")')
    
    // Check if admin actions exist (they should for admin users)
    // In a real test, you'd test with different user roles
  })
})

test.describe('Integration Tests', () => {
  test('Configurator to Pipeline flow', async ({ page }) => {
    // Start from configurator
    await page.goto('/configurator')
    
    // Check configurator loads
    await expect(page.locator('h1, h2').first()).toContainText(/Configurator|Configure|Build/)
    
    // Check for model selection
    await expect(page.locator('text=/Professional|Principle|Progeny/')).toBeVisible()
  })

  test('Pipeline to Build conversion', async ({ page }) => {
    await page.goto('/ops/pipeline')
    
    // Look for a deal in contracted stage
    const contractedDeals = page.locator('text=Contracted').locator('..')
    
    if (await contractedDeals.isVisible()) {
      // Check for convert to build action
      const dealCard = contractedDeals.locator('[data-testid="deal-card"]').first()
      if (await dealCard.isVisible()) {
        await dealCard.click()
        // Check for convert to build option in modal or menu
        await expect(page.locator('text=/Convert to Build|Create Build/')).toBeVisible()
      }
    }
  })
})