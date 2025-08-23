import { test, expect } from '@playwright/test'

test.describe('Modal Visibility Check', () => {
  test('verify dialog has proper contrast', async ({ page }) => {
    // Navigate to the builds page with a timeout
    await page.goto('http://localhost:3000/ops/builds', { waitUntil: 'domcontentloaded', timeout: 10000 })
    
    // Wait for either cards or empty state to appear
    await page.waitForSelector('.cursor-pointer, .text-center.text-muted-foreground', { timeout: 10000 })
    
    // Get the cards
    const cards = await page.locator('.cursor-pointer').count()
    
    console.log(`Found ${cards} production job cards`)
    
    if (cards > 0) {
      // Click on the first card
      await page.locator('.cursor-pointer').first().click()
      
      // Wait for dialog
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      
      // Check the dialog content background and text colors
      const dialogStyles = await dialog.evaluate((el) => {
        const content = el.querySelector('.fixed.left-\\[50\\%\\]') || el.querySelector('[class*="fixed"][class*="left-"]')
        if (!content) return null
        
        const styles = window.getComputedStyle(content)
        const titleEl = el.querySelector('[role="heading"]') || el.querySelector('h2')
        const titleStyles = titleEl ? window.getComputedStyle(titleEl) : null
        
        return {
          background: styles.backgroundColor,
          color: styles.color,
          titleColor: titleStyles?.color
        }
      })
      
      console.log('Dialog styles:', dialogStyles)
      
      if (dialogStyles) {
        // Parse RGB values
        const parseRGB = (color: string) => {
          const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
          if (!match) return null
          return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
          }
        }
        
        const bg = parseRGB(dialogStyles.background)
        const text = parseRGB(dialogStyles.titleColor || dialogStyles.color)
        
        if (bg && text) {
          // Calculate brightness
          const bgBrightness = (bg.r * 299 + bg.g * 587 + bg.b * 114) / 1000
          const textBrightness = (text.r * 299 + text.g * 587 + text.b * 114) / 1000
          
          console.log(`Background brightness: ${bgBrightness}`)
          console.log(`Text brightness: ${textBrightness}`)
          console.log(`Brightness difference: ${Math.abs(bgBrightness - textBrightness)}`)
          
          // Should have good contrast
          const brightnessDiff = Math.abs(bgBrightness - textBrightness)
          expect(brightnessDiff).toBeGreaterThan(125)
          
          // Specific checks for light/dark theme
          if (bgBrightness > 200) {
            // Light background - text should be dark
            expect(textBrightness).toBeLessThan(100)
            console.log('✓ Light background with dark text')
          } else if (bgBrightness < 50) {
            // Dark background - text should be light
            expect(textBrightness).toBeGreaterThan(200)
            console.log('✓ Dark background with light text')
          }
        }
      }
      
      // Close dialog
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
    } else {
      console.log('No production jobs found, skipping modal test')
    }
  })
  
  test('test both light and dark modes', async ({ page }) => {
    // Test in light mode
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('http://localhost:3000/ops/builds', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForSelector('.cursor-pointer, .text-center.text-muted-foreground', { timeout: 10000 })
    
    const cardsLight = await page.locator('.cursor-pointer').count()
    
    if (cardsLight > 0) {
      await page.locator('.cursor-pointer').first().click()
      
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      
      // Check light mode colors
      const lightStyles = await dialog.evaluate((el) => {
        const content = el.querySelector('.bg-white, .dark\\:bg-slate-900')
        if (!content) return null
        const styles = window.getComputedStyle(content)
        return {
          background: styles.backgroundColor,
          expectedBg: 'white'
        }
      })
      
      console.log('Light mode dialog:', lightStyles)
      
      await page.keyboard.press('Escape')
    }
    
    // Test in dark mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForSelector('.cursor-pointer, .text-center.text-muted-foreground', { timeout: 10000 })
    
    const cardsDark = await page.locator('.cursor-pointer').count()
    
    if (cardsDark > 0) {
      await page.locator('.cursor-pointer').first().click()
      
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      
      // Check dark mode colors
      const darkStyles = await dialog.evaluate((el) => {
        const content = el.querySelector('.bg-white, .dark\\:bg-slate-900')
        if (!content) return null
        const styles = window.getComputedStyle(content)
        return {
          background: styles.backgroundColor,
          expectedBg: 'dark slate'
        }
      })
      
      console.log('Dark mode dialog:', darkStyles)
      
      await page.keyboard.press('Escape')
    }
  })
})