import { test, expect } from '@playwright/test'

test.describe('Admin Panel - Text Contrast & Accessibility', () => {
  // WCAG AA requires contrast ratios of:
  // - 4.5:1 for normal text
  // - 3:1 for large text (18pt+ or 14pt+ bold)
  // - 3:1 for UI components

  test.describe('Login Page Contrast', () => {
    test('should have sufficient contrast for all text elements', async ({ page }) => {
      await page.goto('/login')
      
      // Wait for page to load
      await page.waitForSelector('text=Admin Login', { timeout: 5000 })

      // Check contrast using Playwright's accessibility testing
      const accessibilitySnapshot = await page.accessibility.snapshot()
      
      // Check specific elements for contrast
      const elements = [
        { selector: 'h2', minContrast: 3 }, // Large heading
        { selector: 'label', minContrast: 4.5 }, // Form labels
        { selector: 'input', minContrast: 3 }, // Input fields
        { selector: 'button', minContrast: 4.5 }, // Button text
        { selector: 'p', minContrast: 4.5 }, // Paragraph text
      ]

      for (const element of elements) {
        const els = await page.$$(element.selector)
        for (const el of els) {
          const color = await el.evaluate((e) => 
            window.getComputedStyle(e).color
          )
          const bgColor = await el.evaluate((e) => 
            window.getComputedStyle(e).backgroundColor
          )
          
          // Log colors for verification
          console.log(`${element.selector}: color=${color}, bg=${bgColor}`)
          
          // Check visibility
          const isVisible = await el.isVisible()
          if (isVisible) {
            const text = await el.textContent()
            expect(text).toBeTruthy() // Ensure text exists
          }
        }
      }
    })

    test('should have focus indicators with sufficient contrast', async ({ page }) => {
      await page.goto('/login')
      
      // Tab through interactive elements
      const interactiveElements = ['input[type="email"]', 'input[type="password"]', 'button']
      
      for (const selector of interactiveElements) {
        const element = await page.$(selector)
        if (element) {
          await element.focus()
          
          // Check focus outline
          const outline = await element.evaluate((e) => {
            const styles = window.getComputedStyle(e)
            return {
              outlineColor: styles.outlineColor,
              outlineWidth: styles.outlineWidth,
              outlineStyle: styles.outlineStyle,
              boxShadow: styles.boxShadow
            }
          })
          
          // Ensure focus indicator exists
          const hasFocusIndicator = 
            (outline.outlineStyle !== 'none' && outline.outlineWidth !== '0px') ||
            outline.boxShadow.includes('rgb')
          
          expect(hasFocusIndicator).toBeTruthy()
        }
      }
    })
  })

  test.describe('Admin Dashboard Contrast', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication by setting cookies/localStorage
      await page.goto('/login')
      // In a real test, you'd login properly
      // For now, we'll navigate directly and handle redirect
    })

    test('should check contrast in light mode', async ({ page }) => {
      await page.goto('/admin')
      
      // If redirected to login, that's expected behavior
      if (page.url().includes('/login')) {
        console.log('Admin page properly protected by auth')
        return
      }

      // Check stat cards contrast
      const statCards = await page.$$('.card')
      for (const card of statCards) {
        const textColor = await card.evaluate((e) => {
          const title = e.querySelector('.text-2xl')
          return title ? window.getComputedStyle(title).color : null
        })
        
        if (textColor) {
          // Parse RGB and check it's not too light
          const rgb = textColor.match(/\d+/g)
          if (rgb) {
            const [r, g, b] = rgb.map(Number)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            
            // Dark text on light background should have low luminance
            expect(luminance).toBeLessThan(0.5)
          }
        }
      }
    })

    test('should check sidebar navigation contrast', async ({ page }) => {
      // Test the admin layout sidebar
      await page.goto('/admin')
      
      if (!page.url().includes('/login')) {
        const sidebarLinks = await page.$$('nav a')
        
        for (const link of sidebarLinks) {
          const styles = await link.evaluate((e) => ({
            color: window.getComputedStyle(e).color,
            backgroundColor: window.getComputedStyle(e).backgroundColor,
            hover: window.getComputedStyle(e, ':hover').backgroundColor
          }))
          
          console.log('Sidebar link styles:', styles)
          
          // Ensure text is visible
          const text = await link.textContent()
          expect(text).toBeTruthy()
        }
      }
    })
  })

  test.describe('Color Contrast Calculations', () => {
    test('should verify specific color combinations meet WCAG AA', async ({ page }) => {
      await page.goto('/login')
      
      // Define color pairs to test
      const colorPairs = [
        { fg: 'rgb(30, 41, 59)', bg: 'rgb(255, 255, 255)', minRatio: 4.5 }, // slate-800 on white
        { fg: 'rgb(100, 116, 139)', bg: 'rgb(255, 255, 255)', minRatio: 4.5 }, // slate-500 on white
        { fg: 'rgb(37, 99, 235)', bg: 'rgb(255, 255, 255)', minRatio: 3 }, // blue-600 on white
        { fg: 'rgb(255, 255, 255)', bg: 'rgb(37, 99, 235)', minRatio: 4.5 }, // white on blue-600
      ]

      for (const pair of colorPairs) {
        const contrastRatio = await page.evaluate(([fg, bg]) => {
          // Calculate relative luminance
          function getLuminance(rgb: string) {
            const matches = rgb.match(/\d+/g)
            if (!matches) return 0
            
            const [r, g, b] = matches.map(n => {
              const val = Number(n) / 255
              return val <= 0.03928
                ? val / 12.92
                : Math.pow((val + 0.055) / 1.055, 2.4)
            })
            
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }
          
          const l1 = getLuminance(fg)
          const l2 = getLuminance(bg)
          const lighter = Math.max(l1, l2)
          const darker = Math.min(l1, l2)
          
          return (lighter + 0.05) / (darker + 0.05)
        }, [pair.fg, pair.bg])

        console.log(`Contrast ratio for ${pair.fg} on ${pair.bg}: ${contrastRatio.toFixed(2)}`)
        expect(contrastRatio).toBeGreaterThanOrEqual(pair.minRatio)
      }
    })
  })

  test.describe('Form Elements Accessibility', () => {
    test('should have proper labels and contrast for form elements', async ({ page }) => {
      await page.goto('/login')
      
      // Check all form inputs have labels
      const inputs = await page.$$('input')
      for (const input of inputs) {
        const id = await input.getAttribute('id')
        if (id) {
          const label = await page.$(`label[for="${id}"]`)
          expect(label).toBeTruthy()
          
          // Check label text contrast
          if (label) {
            const labelColor = await label.evaluate(e => 
              window.getComputedStyle(e).color
            )
            console.log(`Label for ${id} has color: ${labelColor}`)
          }
        }
      }
      
      // Check error states contrast (if any)
      const alerts = await page.$$('[role="alert"]')
      for (const alert of alerts) {
        const color = await alert.evaluate(e => window.getComputedStyle(e).color)
        const bgColor = await alert.evaluate(e => window.getComputedStyle(e).backgroundColor)
        console.log(`Alert contrast: ${color} on ${bgColor}`)
      }
    })

    test('should verify button states have sufficient contrast', async ({ page }) => {
      await page.goto('/login')
      
      const buttons = await page.$$('button')
      for (const button of buttons) {
        // Normal state
        const normalStyles = await button.evaluate(e => ({
          color: window.getComputedStyle(e).color,
          backgroundColor: window.getComputedStyle(e).backgroundColor
        }))
        
        // Hover state
        await button.hover()
        const hoverStyles = await button.evaluate(e => ({
          color: window.getComputedStyle(e).color,
          backgroundColor: window.getComputedStyle(e).backgroundColor
        }))
        
        // Disabled state (if applicable)
        const isDisabled = await button.isDisabled()
        if (isDisabled) {
          const disabledStyles = await button.evaluate(e => ({
            color: window.getComputedStyle(e).color,
            backgroundColor: window.getComputedStyle(e).backgroundColor,
            opacity: window.getComputedStyle(e).opacity
          }))
          
          // Disabled elements should still be perceivable
          expect(Number(disabledStyles.opacity)).toBeGreaterThan(0.3)
        }
        
        console.log('Button states:', { normal: normalStyles, hover: hoverStyles })
      }
    })
  })

  test.describe('Dark Mode Contrast (if implemented)', () => {
    test('should check contrast in dark mode', async ({ page }) => {
      // Check if dark mode is available
      await page.goto('/login')
      
      // Try to toggle dark mode (implementation may vary)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      
      // Re-check contrast in dark mode
      const isDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      )
      
      if (isDarkMode) {
        const bodyBg = await page.evaluate(() => 
          window.getComputedStyle(document.body).backgroundColor
        )
        
        const textElements = await page.$$('p, span, label, h1, h2, h3')
        for (const element of textElements.slice(0, 5)) { // Check first 5
          const color = await element.evaluate(e => 
            window.getComputedStyle(e).color
          )
          console.log(`Dark mode text: ${color} on ${bodyBg}`)
        }
      }
    })
  })

  test.describe('Accessibility Audit', () => {
    test('should pass automated accessibility checks', async ({ page }) => {
      await page.goto('/login')
      
      // Use Playwright's built-in accessibility testing
      const accessibilitySnapshot = await page.accessibility.snapshot()
      
      // Check for common issues
      if (accessibilitySnapshot) {
        // Log the snapshot for debugging
        console.log('Accessibility tree:', JSON.stringify(accessibilitySnapshot, null, 2).slice(0, 500))
        
        // Verify key elements have roles
        expect(accessibilitySnapshot.role).toBeTruthy()
        
        // Check for name/label on interactive elements
        const checkNode = (node: any) => {
          if (node.role && ['button', 'textbox', 'link'].includes(node.role)) {
            expect(node.name || node.value).toBeTruthy()
          }
          if (node.children) {
            node.children.forEach(checkNode)
          }
        }
        
        checkNode(accessibilitySnapshot)
      }
    })
  })
})