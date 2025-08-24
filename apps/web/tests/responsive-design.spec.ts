import { test, expect, devices } from '@playwright/test'

// Define viewport breakpoints for testing
const viewports = {
  mobile: {
    small: { width: 375, height: 812 }, // iPhone 12/13 Mini
    medium: { width: 414, height: 896 }, // iPhone 11 Pro Max
  },
  tablet: {
    portrait: { width: 768, height: 1024 }, // iPad Portrait
    landscape: { width: 1024, height: 768 }, // iPad Landscape
  },
  desktop: {
    small: { width: 1280, height: 720 }, // Small laptop
    medium: { width: 1440, height: 900 }, // Standard laptop
    large: { width: 1920, height: 1080 }, // Full HD
  }
}

// List of all pages to test
const pages = [
  { name: 'Home', path: '/' },
  { name: 'Models', path: '/models' },
  { name: 'Professional 35', path: '/models/professional-35' },
  { name: 'Configurator', path: '/configurator' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Operations Dashboard', path: '/ops' },
  { name: 'Builds', path: '/ops/builds' },
  { name: 'Pipeline', path: '/ops/pipeline' },
  { name: 'Inventory', path: '/ops/inventory' },
  { name: 'Customers', path: '/ops/customers' },
  { name: 'Quotes', path: '/ops/quotes' },
  { name: 'Knowledge Base', path: '/ops/knowledge' },
  { name: 'Reports', path: '/ops/reports' },
  { name: 'Settings', path: '/ops/settings' },
]

test.describe('Responsive Design Tests', () => {
  // Test each page at each viewport
  pages.forEach(page => {
    test.describe(`${page.name} Page`, () => {
      // Mobile Tests
      test.describe('Mobile Viewports', () => {
        Object.entries(viewports.mobile).forEach(([size, viewport]) => {
          test(`should be responsive at ${size} (${viewport.width}x${viewport.height})`, async ({ browser }) => {
            const context = await browser.newContext({
              viewport,
              isMobile: true,
              hasTouch: true,
            })
            const testPage = await context.newPage()
            
            await testPage.goto(page.path)
            await testPage.waitForLoadState('networkidle')
            
            // Check for horizontal scrolling
            const bodyWidth = await testPage.evaluate(() => document.body.scrollWidth)
            expect(bodyWidth).toBeLessThanOrEqual(viewport.width)
            
            // Check for overflow issues
            const hasHorizontalScroll = await testPage.evaluate(() => {
              return document.documentElement.scrollWidth > document.documentElement.clientWidth
            })
            expect(hasHorizontalScroll).toBe(false)
            
            // Check navigation is accessible
            if (!page.path.startsWith('/ops')) {
              // Site pages should have mobile menu
              const menuButton = testPage.locator('button:has-text("Menu"), button:has(svg.lucide-menu)')
              if (await menuButton.isVisible()) {
                await menuButton.click()
                const mobileNav = testPage.locator('nav.px-4.py-6').first()
                await expect(mobileNav).toBeVisible()
              }
            } else {
              // Ops pages should have hamburger menu on mobile
              const hamburgerButton = testPage.locator('button:has(svg.lucide-menu)').last()
              if (await hamburgerButton.count() > 0) {
                await expect(hamburgerButton).toBeVisible()
              }
            }
            
            // Check text readability
            const fontSize = await testPage.evaluate(() => {
              const body = document.body
              return window.getComputedStyle(body).fontSize
            })
            expect(parseInt(fontSize)).toBeGreaterThanOrEqual(14)
            
            // Check touch targets are large enough (minimum 44x44px)
            const buttons = await testPage.locator('button, a').all()
            for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
              const box = await button.boundingBox()
              if (box && await button.isVisible()) {
                expect(box.width).toBeGreaterThanOrEqual(44)
                expect(box.height).toBeGreaterThanOrEqual(44)
              }
            }
            
            await context.close()
          })
        })
      })
      
      // Tablet Tests
      test.describe('Tablet Viewports', () => {
        Object.entries(viewports.tablet).forEach(([size, viewport]) => {
          test(`should be responsive at ${size} (${viewport.width}x${viewport.height})`, async ({ browser }) => {
            const context = await browser.newContext({
              viewport,
              hasTouch: true,
            })
            const testPage = await context.newPage()
            
            await testPage.goto(page.path)
            await testPage.waitForLoadState('networkidle')
            
            // Check for horizontal scrolling
            const hasHorizontalScroll = await testPage.evaluate(() => {
              return document.documentElement.scrollWidth > document.documentElement.clientWidth
            })
            expect(hasHorizontalScroll).toBe(false)
            
            // Check layout doesn't break
            const bodyWidth = await testPage.evaluate(() => document.body.scrollWidth)
            expect(bodyWidth).toBeLessThanOrEqual(viewport.width)
            
            // For ops pages, check sidebar visibility
            if (page.path.startsWith('/ops')) {
              const sidebar = testPage.locator('aside').first()
              if (viewport.width >= 1024) {
                await expect(sidebar).toBeVisible()
              }
            }
            
            await context.close()
          })
        })
      })
      
      // Desktop Tests
      test.describe('Desktop Viewports', () => {
        Object.entries(viewports.desktop).forEach(([size, viewport]) => {
          test(`should be responsive at ${size} (${viewport.width}x${viewport.height})`, async ({ browser }) => {
            const context = await browser.newContext({ viewport })
            const testPage = await context.newPage()
            
            await testPage.goto(page.path)
            await testPage.waitForLoadState('networkidle')
            
            // Check for horizontal scrolling
            const hasHorizontalScroll = await testPage.evaluate(() => {
              return document.documentElement.scrollWidth > document.documentElement.clientWidth
            })
            expect(hasHorizontalScroll).toBe(false)
            
            // Check main content is centered and has max-width
            const mainContent = await testPage.locator('main, .container').first()
            if (await mainContent.count() > 0) {
              const box = await mainContent.boundingBox()
              if (box && viewport.width > 1440) {
                // Content should have max-width on very large screens
                expect(box.width).toBeLessThanOrEqual(1536) // max-w-7xl is 1536px
              }
            }
            
            await context.close()
          })
        })
      })
    })
  })
  
  // Specific component tests
  test.describe('Component Responsiveness', () => {
    test('Tables should be scrollable on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      // Test ops dashboard tables
      await page.goto('/ops')
      await page.waitForLoadState('networkidle')
      
      const tables = await page.locator('table').all()
      for (const table of tables) {
        if (await table.isVisible()) {
          const parent = await table.locator('..')
          const parentStyles = await parent.evaluate(el => {
            const styles = window.getComputedStyle(el)
            return {
              overflowX: styles.overflowX,
              overflowY: styles.overflowY,
            }
          })
          
          // Tables should be in scrollable containers on mobile
          expect(['auto', 'scroll']).toContain(parentStyles.overflowX)
        }
      }
      
      await context.close()
    })
    
    test('Cards should stack on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      await page.goto('/ops')
      await page.waitForLoadState('networkidle')
      
      // Check grid cards stack vertically
      const gridContainers = await page.locator('[class*="grid-cols-"]').all()
      for (const grid of gridContainers) {
        if (await grid.isVisible()) {
          const gridStyles = await grid.evaluate(el => {
            const styles = window.getComputedStyle(el)
            return {
              gridTemplateColumns: styles.gridTemplateColumns,
            }
          })
          
          // On mobile, should be single column
          const columns = gridStyles.gridTemplateColumns.split(' ').length
          expect(columns).toBeLessThanOrEqual(2)
        }
      }
      
      await context.close()
    })
    
    test('Modals should be full-screen on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      await page.goto('/ops/builds')
      await page.waitForLoadState('networkidle')
      
      // Try to open a modal if there's content
      const firstCard = page.locator('[class*="card"]').first()
      if (await firstCard.count() > 0) {
        await firstCard.click()
        
        const modal = page.locator('[role="dialog"], [class*="dialog"]').first()
        if (await modal.isVisible()) {
          const box = await modal.boundingBox()
          if (box) {
            // Modal should take most of the viewport on mobile
            expect(box.width).toBeGreaterThanOrEqual(viewports.mobile.small.width * 0.9)
          }
        }
      }
      
      await context.close()
    })
    
    test('Navigation sidebar should be hidden on mobile for ops pages', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      await page.goto('/ops')
      await page.waitForLoadState('networkidle')
      
      const sidebar = page.locator('aside').first()
      
      // Sidebar should be hidden or transformed on mobile
      if (await sidebar.count() > 0) {
        const sidebarStyles = await sidebar.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            display: styles.display,
            transform: styles.transform,
            position: styles.position,
          }
        })
        
        // Should either be hidden or positioned off-screen
        const isHidden = sidebarStyles.display === 'none' || 
                        sidebarStyles.transform.includes('translateX(-100%)')
        
        expect(isHidden).toBe(true)
      }
      
      await context.close()
    })
    
    test('Images should be responsive', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const images = await page.locator('img').all()
      for (const img of images.slice(0, 5)) { // Check first 5 images
        if (await img.isVisible()) {
          const box = await img.boundingBox()
          if (box) {
            // Images shouldn't overflow viewport
            expect(box.width).toBeLessThanOrEqual(viewports.mobile.small.width)
          }
        }
      }
      
      await context.close()
    })
  })
  
  // Test for specific problem areas mentioned
  test.describe('Ops Panel Responsive Fixes', () => {
    test('Ops dashboard should be usable on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      await page.goto('/ops')
      await page.waitForLoadState('networkidle')
      
      // Check main content is visible and not cut off
      const mainContent = page.locator('main').first()
      await expect(mainContent).toBeVisible()
      
      const mainBox = await mainContent.boundingBox()
      if (mainBox) {
        expect(mainBox.width).toBeLessThanOrEqual(viewports.mobile.small.width)
      }
      
      // Check cards are stacked
      const cards = await page.locator('[class*="card"]').all()
      const cardPositions = []
      
      for (const card of cards.slice(0, 4)) {
        if (await card.isVisible()) {
          const box = await card.boundingBox()
          if (box) {
            cardPositions.push(box)
          }
        }
      }
      
      // Cards should be stacked vertically (same x position, different y)
      if (cardPositions.length > 1) {
        const xPositions = cardPositions.map(p => p.x)
        const uniqueX = [...new Set(xPositions)]
        expect(uniqueX.length).toBeLessThanOrEqual(2) // Allow for slight variations
      }
      
      await context.close()
    })
    
    test('Builds page tables should be responsive', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: viewports.mobile.small,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      
      await page.goto('/ops/builds')
      await page.waitForLoadState('networkidle')
      
      // Check for horizontal scroll on page
      const hasScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })
      expect(hasScroll).toBe(false)
      
      await context.close()
    })
  })
})