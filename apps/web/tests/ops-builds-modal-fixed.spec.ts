import { test, expect } from '@playwright/test'

test.describe('Ops Builds Modal Fixed Visibility', () => {
  test('modal should have white background with dark text in light mode', async ({ page }) => {
    // Set light mode
    await page.emulateMedia({ colorScheme: 'light' })
    
    // Navigate to the builds page
    await page.goto('http://localhost:3000/ops/builds')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Wait a bit for data to load
    await page.waitForTimeout(2000)
    
    // Wait for cards or empty state
    const cards = page.locator('.cursor-pointer')
    const cardCount = await cards.count()
    
    if (cardCount === 0) {
      console.log('No production jobs found, creating test expectation')
      // Even with no data, we should test the modal can open with proper styling
      return
    }
    
    // Click on the first card
    await cards.first().click()
    
    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Get the dialog content
    const dialogContent = dialog.locator('.fixed.left-\\[50\\%\\]').first()
    
    // Verify background is white
    const bgColor = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    console.log('Light mode background color:', bgColor)
    
    // Check if background is white or very light
    expect(bgColor).toMatch(/rgb\(255,\s*255,\s*255\)|rgb\(254,\s*254,\s*254\)|rgb\(253,\s*253,\s*253\)/)
    
    // Verify text is dark
    const title = dialog.locator('[role="heading"]').first()
    const textColor = await title.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    console.log('Light mode text color:', textColor)
    
    // Text should be dark (close to black)
    expect(textColor).toMatch(/rgb\(15,\s*23,\s*42\)|rgb\(30,\s*41,\s*59\)|rgb\(51,\s*65,\s*85\)/)
    
    // Verify all text elements are visible
    const allTexts = dialog.locator('p, span, label, h1, h2, h3, h4, div')
    const textCount = await allTexts.count()
    
    for (let i = 0; i < Math.min(textCount, 5); i++) {
      const element = allTexts.nth(i)
      const isVisible = await element.isVisible()
      if (isVisible) {
        const color = await element.evaluate((el) => window.getComputedStyle(el).color)
        const bg = await element.evaluate((el) => window.getComputedStyle(el).backgroundColor)
        
        // If element has its own background, skip
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
          // Element inherits background, check contrast with dialog background
          const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
          if (colorMatch) {
            const brightness = (parseInt(colorMatch[1]) * 299 + parseInt(colorMatch[2]) * 587 + parseInt(colorMatch[3]) * 114) / 1000
            // Text should be dark on white background
            expect(brightness).toBeLessThan(200)
          }
        }
      }
    }
  })

  test('modal should have dark background with light text in dark mode', async ({ page }) => {
    // Set dark mode
    await page.emulateMedia({ colorScheme: 'dark' })
    
    // Navigate to the builds page
    await page.goto('http://localhost:3000/ops/builds')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Wait a bit for data to load
    await page.waitForTimeout(2000)
    
    // Wait for cards or empty state
    const cards = page.locator('.cursor-pointer')
    const cardCount = await cards.count()
    
    if (cardCount === 0) {
      console.log('No production jobs found, creating test expectation')
      return
    }
    
    // Click on the first card
    await cards.first().click()
    
    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Get the dialog content
    const dialogContent = dialog.locator('.fixed.left-\\[50\\%\\]').first()
    
    // Verify background is dark (slate-900)
    const bgColor = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    console.log('Dark mode background color:', bgColor)
    
    // Check if background is dark
    const bgMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (bgMatch) {
      const brightness = (parseInt(bgMatch[1]) * 299 + parseInt(bgMatch[2]) * 587 + parseInt(bgMatch[3]) * 114) / 1000
      expect(brightness).toBeLessThan(50) // Dark background
    }
    
    // Verify text is light
    const title = dialog.locator('[role="heading"]').first()
    const textColor = await title.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    console.log('Dark mode text color:', textColor)
    
    // Text should be light
    const textMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (textMatch) {
      const brightness = (parseInt(textMatch[1]) * 299 + parseInt(textMatch[2]) * 587 + parseInt(textMatch[3]) * 114) / 1000
      expect(brightness).toBeGreaterThan(200) // Light text
    }
  })

  test('update stage modal should also have proper visibility', async ({ page }) => {
    // Navigate to the builds page
    await page.goto('http://localhost:3000/ops/builds')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Wait for cards
    const cards = page.locator('.cursor-pointer')
    const cardCount = await cards.count()
    
    if (cardCount === 0) {
      console.log('No production jobs found')
      return
    }
    
    // Click on the first card
    await cards.first().click()
    
    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"]').first()
    await expect(dialog).toBeVisible()
    
    // Click on the first Update button
    const updateButton = dialog.locator('button:has-text("Update")').first()
    await updateButton.click()
    
    // Wait for second dialog (update stage dialog)
    await page.waitForTimeout(500)
    const dialogs = page.locator('[role="dialog"]')
    const dialogCount = await dialogs.count()
    expect(dialogCount).toBe(2)
    
    // Get the update dialog (second one)
    const updateDialog = dialogs.nth(1)
    await expect(updateDialog).toBeVisible()
    
    // Verify update dialog has proper styling
    const updateContent = updateDialog.locator('.fixed.left-\\[50\\%\\]').first()
    
    const bgColor = await updateContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    const title = updateDialog.locator('[role="heading"]').first()
    const textColor = await title.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    console.log('Update dialog background:', bgColor)
    console.log('Update dialog text:', textColor)
    
    // Calculate contrast
    const extractRGB = (color: string) => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (!match) return { r: 0, g: 0, b: 0 }
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
    }
    
    const bg = extractRGB(bgColor)
    const text = extractRGB(textColor)
    
    const bgBrightness = (bg.r * 299 + bg.g * 587 + bg.b * 114) / 1000
    const textBrightness = (text.r * 299 + text.g * 587 + text.b * 114) / 1000
    
    const brightnessDiff = Math.abs(bgBrightness - textBrightness)
    
    console.log('Brightness difference:', brightnessDiff)
    
    // Should have significant brightness difference
    expect(brightnessDiff).toBeGreaterThan(125)
    
    // Check form labels are visible
    const labels = updateDialog.locator('label')
    const labelCount = await labels.count()
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i)
      const labelColor = await label.evaluate((el) => window.getComputedStyle(el).color)
      
      const labelRGB = extractRGB(labelColor)
      const labelBrightness = (labelRGB.r * 299 + labelRGB.g * 587 + labelRGB.b * 114) / 1000
      
      const labelBrightnessDiff = Math.abs(bgBrightness - labelBrightness)
      
      // Labels should be clearly visible
      expect(labelBrightnessDiff).toBeGreaterThan(100)
    }
  })

  test('all modal text elements should meet WCAG AA contrast requirements', async ({ page }) => {
    // Navigate to the builds page
    await page.goto('http://localhost:3000/ops/builds')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Wait for cards
    const cards = page.locator('.cursor-pointer')
    const cardCount = await cards.count()
    
    if (cardCount === 0) {
      console.log('No production jobs found')
      return
    }
    
    // Click on the first card
    await cards.first().click()
    
    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Function to calculate WCAG contrast ratio
    const getContrastRatio = (color1: string, color2: string) => {
      const extractRGB = (color: string) => {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (!match) return { r: 0, g: 0, b: 0 }
        return {
          r: parseInt(match[1]) / 255,
          g: parseInt(match[2]) / 255,
          b: parseInt(match[3]) / 255
        }
      }
      
      const getLuminance = (rgb: { r: number; g: number; b: number }) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      
      const rgb1 = extractRGB(color1)
      const rgb2 = extractRGB(color2)
      
      const l1 = getLuminance(rgb1)
      const l2 = getLuminance(rgb2)
      
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      
      return (lighter + 0.05) / (darker + 0.05)
    }
    
    // Get dialog background color
    const dialogContent = dialog.locator('.fixed.left-\\[50\\%\\]').first()
    const bgColor = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Test various text elements
    const textSelectors = [
      '[role="heading"]', // Dialog title
      '.text-sm', // Small text
      'label', // Form labels
      'button', // Buttons
      'p', // Paragraphs
    ]
    
    for (const selector of textSelectors) {
      const elements = dialog.locator(selector)
      const count = await elements.count()
      
      if (count > 0) {
        const element = elements.first()
        const isVisible = await element.isVisible()
        
        if (isVisible) {
          const textColor = await element.evaluate((el) => window.getComputedStyle(el).color)
          const elementBg = await element.evaluate((el) => window.getComputedStyle(el).backgroundColor)
          
          // Use element's own background if it has one, otherwise use dialog background
          const effectiveBg = (elementBg === 'rgba(0, 0, 0, 0)' || elementBg === 'transparent') ? bgColor : elementBg
          
          const contrastRatio = getContrastRatio(effectiveBg, textColor)
          
          console.log(`${selector} contrast ratio: ${contrastRatio.toFixed(2)}`)
          
          // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
          // We'll use 4.5:1 as the minimum for all text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })
})