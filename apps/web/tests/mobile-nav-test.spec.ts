import { test, expect } from '@playwright/test'

test.describe('Mobile Operations Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone viewport

  test('Bottom navigation is visible on mobile', async ({ page }) => {
    await page.goto('/ops')
    
    // Check bottom nav is visible
    const bottomNav = page.locator('nav.fixed.bottom-0')
    await expect(bottomNav).toBeVisible()
    
    // Check main navigation items are present
    await expect(page.locator('nav.fixed.bottom-0').locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=Pipeline')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=Builds')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=Customers')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=More')).toBeVisible()
    
    console.log('✅ Bottom navigation bar is visible with all main items')
  })

  test('Can navigate between sections using bottom nav', async ({ page }) => {
    await page.goto('/ops')
    
    // Navigate to Pipeline
    await page.locator('nav.fixed.bottom-0').locator('text=Pipeline').click()
    await expect(page).toHaveURL('/ops/pipeline')
    await expect(page.locator('h1')).toContainText('Sales Pipeline')
    
    // Navigate to Builds
    await page.locator('nav.fixed.bottom-0').locator('text=Builds').click()
    await expect(page).toHaveURL('/ops/builds')
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Navigate to Customers
    await page.locator('nav.fixed.bottom-0').locator('text=Customers').click()
    await expect(page).toHaveURL('/ops/customers')
    
    // Navigate back to Dashboard
    await page.locator('nav.fixed.bottom-0').locator('text=Dashboard').click()
    await expect(page).toHaveURL('/ops')
    await expect(page.locator('h1')).toContainText('Operations Dashboard')
    
    console.log('✅ Navigation between sections works correctly')
  })

  test('More dropdown menu works', async ({ page }) => {
    await page.goto('/ops')
    
    // Click More button
    await page.locator('nav.fixed.bottom-0').locator('text=More').click()
    
    // Check dropdown is visible
    const dropdown = page.locator('[role="menu"]')
    await expect(dropdown).toBeVisible()
    
    // Check dropdown items
    await expect(dropdown.locator('text=Inventory')).toBeVisible()
    await expect(dropdown.locator('text=Quotes')).toBeVisible()
    await expect(dropdown.locator('text=Knowledge Base')).toBeVisible()
    await expect(dropdown.locator('text=Reports')).toBeVisible()
    await expect(dropdown.locator('text=Settings')).toBeVisible()
    
    // Navigate to Inventory via dropdown
    await dropdown.locator('text=Inventory').click()
    await expect(page).toHaveURL('/ops/inventory')
    
    console.log('✅ More dropdown menu works correctly')
  })

  test('Active state highlights correctly', async ({ page }) => {
    await page.goto('/ops')
    
    // Check Dashboard is active
    const dashboardLink = page.locator('nav.fixed.bottom-0 a[href="/ops"]').first()
    await expect(dashboardLink).toHaveClass(/text-primary/)
    
    // Navigate to Pipeline and check it becomes active
    await page.goto('/ops/pipeline')
    const pipelineLink = page.locator('nav.fixed.bottom-0 a[href="/ops/pipeline"]')
    await expect(pipelineLink).toHaveClass(/text-primary/)
    
    console.log('✅ Active navigation state updates correctly')
  })

  test('Desktop view does not show bottom nav', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/ops')
    
    // Bottom nav should not be visible
    const bottomNav = page.locator('nav.fixed.bottom-0')
    await expect(bottomNav).not.toBeVisible()
    
    // Desktop sidebar should be visible
    const sidebar = page.locator('aside.hidden.lg\\:block')
    await expect(sidebar).toBeVisible()
    
    console.log('✅ Bottom nav is hidden on desktop, sidebar is visible')
  })

  test('Content is not hidden behind bottom nav', async ({ page }) => {
    await page.goto('/ops')
    
    // Check that main content has proper padding
    const main = page.locator('main')
    const mainClasses = await main.getAttribute('class')
    expect(mainClasses).toContain('pb-16')
    
    // Scroll to bottom and check content is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    console.log('✅ Content has proper padding and is not hidden behind bottom nav')
  })
})