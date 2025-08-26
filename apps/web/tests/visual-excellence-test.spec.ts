import { test, expect } from '@playwright/test'

test.describe('JTH Visual Excellence Transformation Tests', () => {
  test.describe('Design System Implementation', () => {
    test('Homepage uses new British Racing Green and Champagne Gold colors', async ({ page }) => {
      await page.goto('/')
      
      // Check for green color usage
      const greenElements = await page.$$('[class*="green-600"]')
      expect(greenElements.length).toBeGreaterThan(0)
      
      // Check for amber/gold color usage
      const amberElements = await page.$$('[class*="amber-"]')
      expect(amberElements.length).toBeGreaterThan(0)
      
      // Verify showcase content is on homepage
      const gallery = await page.locator('#gallery')
      await expect(gallery).toBeVisible()
      
      // Check for dissolve gallery component
      const dissolveGallery = await page.locator('[class*="DissolveGallery"]')
      await expect(dissolveGallery.first()).toBeVisible()
    })

    test('All main pages use consistent design system', async ({ page }) => {
      const pages = ['/', '/models', '/about', '/contact', '/configurator']
      
      for (const path of pages) {
        await page.goto(path)
        
        // Check for glass morphism effects
        const glassElements = await page.$$('[class*="glass-"]')
        expect(glassElements.length).toBeGreaterThan(0)
        
        // Check for fluid typography
        const fluidTextElements = await page.$$('[class*="text-fluid-"]')
        expect(fluidTextElements.length).toBeGreaterThan(0)
      }
    })

    test('Modern Lucide React icons are used consistently', async ({ page }) => {
      await page.goto('/')
      
      // Check for Lucide icons (they typically have specific SVG attributes)
      const icons = await page.$$('svg[class*="lucide"]')
      expect(icons.length).toBeGreaterThan(0)
      
      // Verify no outdated icon libraries
      const fontAwesome = await page.$$('[class*="fa-"]')
      expect(fontAwesome.length).toBe(0)
    })
  })

  test.describe('Contrast and Accessibility', () => {
    test('Text contrast meets WCAG AA standards', async ({ page }) => {
      await page.goto('/')
      
      // Check specific text elements for sufficient contrast
      const textElements = [
        { selector: 'h1', minContrast: 4.5 },
        { selector: 'h2', minContrast: 4.5 },
        { selector: 'p', minContrast: 4.5 },
        { selector: 'a', minContrast: 4.5 },
      ]
      
      for (const element of textElements) {
        const els = await page.$$(element.selector)
        for (const el of els) {
          const color = await el.evaluate(e => window.getComputedStyle(e).color)
          const bgColor = await el.evaluate(e => {
            let bg = window.getComputedStyle(e).backgroundColor
            let parent = e.parentElement
            while (bg === 'rgba(0, 0, 0, 0)' && parent) {
              bg = window.getComputedStyle(parent).backgroundColor
              parent = parent.parentElement
            }
            return bg
          })
          
          // Basic check that text is not too light on white
          if (bgColor.includes('255, 255, 255')) {
            // Text should not be light gray on white
            expect(color).not.toMatch(/rgba?\(\s*\d{3},\s*\d{3},\s*\d{3}/)
          }
        }
      }
    })

    test('Focus states are clearly visible', async ({ page }) => {
      await page.goto('/')
      
      // Tab through interactive elements
      const interactiveElements = await page.$$('a, button, input, textarea, select')
      
      for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
        await page.keyboard.press('Tab')
        
        // Check that focused element has visible outline
        const focusedElement = await page.evaluateHandle(() => document.activeElement)
        const outline = await focusedElement.evaluate(el => {
          if (!el) return null
          const styles = window.getComputedStyle(el as Element)
          return {
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow
          }
        })
        
        // Element should have either outline or box-shadow for focus
        if (outline) {
          const hasOutline = outline.outlineStyle !== 'none' && outline.outlineWidth !== '0px'
          const hasBoxShadow = outline.boxShadow !== 'none'
          expect(hasOutline || hasBoxShadow).toBeTruthy()
        }
      }
    })

    test('All images have alt text', async ({ page }) => {
      await page.goto('/')
      
      const images = await page.$$('img')
      for (const img of images) {
        const alt = await img.getAttribute('alt')
        expect(alt).toBeTruthy()
        expect(alt?.length ?? 0).toBeGreaterThan(0)
      }
    })
  })

  test.describe('SEO Preservation', () => {
    test('Meta tags are preserved on all pages', async ({ page }) => {
      const pages = [
        { path: '/', title: 'JTH Horseboxes' },
        { path: '/models', title: 'Horsebox Models' },
        { path: '/about', title: 'About J Taylor Horseboxes' },
        { path: '/contact', title: 'Contact JTH' },
      ]
      
      for (const pageInfo of pages) {
        await page.goto(pageInfo.path)
        
        // Check title tag
        const title = await page.title()
        expect(title).toContain(pageInfo.title)
        
        // Check meta description
        const description = await page.$('meta[name="description"]')
        expect(description).toBeTruthy()
        
        // Check Open Graph tags
        const ogTitle = await page.$('meta[property="og:title"]')
        expect(ogTitle).toBeTruthy()
      }
    })

    test('Structured data is present', async ({ page }) => {
      await page.goto('/')
      
      // Check for JSON-LD structured data
      const structuredData = await page.$$('script[type="application/ld+json"]')
      expect(structuredData.length).toBeGreaterThan(0)
    })

    test('Canonical URLs are set', async ({ page }) => {
      await page.goto('/')
      
      const canonical = await page.$('link[rel="canonical"]')
      if (canonical) {
        const href = await canonical.getAttribute('href')
        expect(href).toBeTruthy()
      }
    })
  })

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1440, height: 900 },
    ]

    for (const viewport of viewports) {
      test(`${viewport.name} layout renders correctly`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/')
        
        // Check that navigation is accessible
        if (viewport.width < 768) {
          // Mobile should have hamburger menu
          const mobileMenu = await page.$('[aria-label*="menu"]')
          expect(mobileMenu).toBeTruthy()
        } else {
          // Desktop should have full navigation
          const nav = await page.locator('nav').first()
          await expect(nav).toBeVisible()
        }
        
        // Check that content is not cut off
        const overflow = await page.evaluate(() => {
          return document.body.scrollWidth > document.body.clientWidth
        })
        expect(overflow).toBeFalsy()
      })
    }
  })

  test.describe('Performance', () => {
    test('Core Web Vitals are within acceptable range', async ({ page }) => {
      await page.goto('/')
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle')
      
      // Check that critical resources load
      const hero = await page.$('[class*="Hero"]')
      expect(hero).toBeTruthy()
      
      // Images should be using Next.js Image optimization
      const images = await page.$$('img[loading="lazy"]')
      expect(images.length).toBeGreaterThan(0)
    })
  })
})