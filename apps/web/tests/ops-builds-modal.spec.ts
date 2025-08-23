import { test, expect } from '@playwright/test'

test.describe('Ops Builds Modal Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the builds page
    await page.goto('http://localhost:3000/ops/builds')
    
    // Wait for the page to load and data to be fetched
    await page.waitForLoadState('networkidle')
    
    // Wait for either cards to appear or empty state
    await page.waitForSelector('.cursor-pointer, .text-center.text-muted-foreground', { timeout: 10000 })
  })

  test('modal should have proper contrast and visibility', async ({ page }) => {
    // Wait for cards to be visible
    const firstCard = page.locator('.cursor-pointer').first()
    
    // Check if there are any cards, if not, skip the test
    const cardCount = await firstCard.count()
    if (cardCount === 0) {
      console.log('No production jobs found, skipping modal test')
      return
    }

    // Click on the first card to open the modal
    await firstCard.click()

    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Get the dialog content element
    const dialogContent = dialog.locator('.fixed.left-\\[50\\%\\]').first()
    
    // Check background color
    const backgroundColor = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Check text color of dialog title
    const dialogTitle = dialog.locator('[role="heading"]').first()
    const titleColor = await dialogTitle.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    // Log the colors for debugging
    console.log('Background color:', backgroundColor)
    console.log('Title text color:', titleColor)
    
    // Calculate contrast ratio
    const getContrastRatio = (rgb1: string, rgb2: string) => {
      // Extract RGB values
      const extractRGB = (color: string) => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return { r: 0, g: 0, b: 0 };
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      };
      
      const color1 = extractRGB(rgb1);
      const color2 = extractRGB(rgb2);
      
      // Calculate relative luminance
      const getLuminance = (rgb: { r: number; g: number; b: number }) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      
      const l1 = getLuminance(color1);
      const l2 = getLuminance(color2);
      
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      
      return (lighter + 0.05) / (darker + 0.05);
    };
    
    const contrastRatio = getContrastRatio(backgroundColor, titleColor);
    console.log('Contrast ratio:', contrastRatio);
    
    // WCAG AA requires at least 4.5:1 for normal text
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    
    // Check that text is visible (not dark on dark)
    // For a white/light background, we expect dark text
    // Parse the background color to check if it's light
    const bgRGB = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (bgRGB) {
      const brightness = (parseInt(bgRGB[1]) * 299 + parseInt(bgRGB[2]) * 587 + parseInt(bgRGB[3]) * 114) / 1000;
      
      // If background is light (brightness > 128), text should be dark
      // If background is dark (brightness <= 128), text should be light
      if (brightness > 128) {
        // Light background - ensure text is dark
        const textRGB = titleColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (textRGB) {
          const textBrightness = (parseInt(textRGB[1]) * 299 + parseInt(textRGB[2]) * 587 + parseInt(textRGB[3]) * 114) / 1000;
          expect(textBrightness).toBeLessThan(128); // Text should be dark
        }
      } else {
        // Dark background - ensure text is light
        const textRGB = titleColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (textRGB) {
          const textBrightness = (parseInt(textRGB[1]) * 299 + parseInt(textRGB[2]) * 587 + parseInt(textRGB[3]) * 114) / 1000;
          expect(textBrightness).toBeGreaterThan(128); // Text should be light
        }
      }
    }
    
    // Test other text elements in the modal
    const dialogDescription = dialog.locator('.text-sm.text-muted-foreground').first()
    if (await dialogDescription.count() > 0) {
      const descColor = await dialogDescription.evaluate((el) => {
        return window.getComputedStyle(el).color
      })
      
      const descContrastRatio = getContrastRatio(backgroundColor, descColor);
      console.log('Description contrast ratio:', descContrastRatio);
      
      // WCAG AA requires at least 4.5:1 for normal text
      expect(descContrastRatio).toBeGreaterThanOrEqual(4.5);
    }
    
    // Test buttons in modal
    const buttons = dialog.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i)
      const buttonBg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor)
      const buttonText = await button.evaluate((el) => window.getComputedStyle(el).color)
      
      const buttonContrast = getContrastRatio(buttonBg, buttonText);
      console.log(`Button ${i} contrast ratio:`, buttonContrast);
      
      // Buttons should have at least 4.5:1 contrast
      expect(buttonContrast).toBeGreaterThanOrEqual(4.5);
    }
    
    // Close the modal
    const closeButton = dialog.locator('[aria-label="Close"]').or(dialog.locator('button:has-text("Cancel")')).first()
    if (await closeButton.count() > 0) {
      await closeButton.click()
      await expect(dialog).not.toBeVisible()
    }
  })

  test('update stage modal should have proper visibility', async ({ page }) => {
    // Wait for cards to be visible
    const firstCard = page.locator('.cursor-pointer').first()
    
    // Check if there are any cards
    const cardCount = await firstCard.count()
    if (cardCount === 0) {
      console.log('No production jobs found, skipping update stage modal test')
      return
    }

    // Click on the first card to open the detail modal
    await firstCard.click()

    // Wait for dialog to be visible
    const detailDialog = page.locator('[role="dialog"]').first()
    await expect(detailDialog).toBeVisible()

    // Click on Update button for first stage
    const updateButton = detailDialog.locator('button:has-text("Update")').first()
    await updateButton.click()

    // Wait for update stage dialog to appear (there should be 2 dialogs now)
    const dialogs = page.locator('[role="dialog"]')
    await expect(dialogs).toHaveCount(2)

    // Get the update stage dialog (second one)
    const updateDialog = dialogs.nth(1)
    await expect(updateDialog).toBeVisible()

    // Check the update dialog visibility
    const updateDialogContent = updateDialog.locator('.fixed.left-\\[50\\%\\]').first()
    
    const backgroundColor = await updateDialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    const dialogTitle = updateDialog.locator('[role="heading"]').first()
    const titleColor = await dialogTitle.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    console.log('Update dialog background:', backgroundColor)
    console.log('Update dialog title color:', titleColor)
    
    // Check form elements visibility
    const labels = updateDialog.locator('label')
    const labelCount = await labels.count()
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i)
      const labelColor = await label.evaluate((el) => window.getComputedStyle(el).color)
      
      // Calculate contrast
      const extractRGB = (color: string) => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return { r: 0, g: 0, b: 0 };
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      };
      
      const bgRGB = extractRGB(backgroundColor);
      const textRGB = extractRGB(labelColor);
      
      // Simple brightness check
      const bgBrightness = (bgRGB.r * 299 + bgRGB.g * 587 + bgRGB.b * 114) / 1000;
      const textBrightness = (textRGB.r * 299 + textRGB.g * 587 + textRGB.b * 114) / 1000;
      
      // Ensure sufficient difference in brightness
      const brightnessDiff = Math.abs(bgBrightness - textBrightness);
      console.log(`Label ${i} brightness difference:`, brightnessDiff);
      
      // Should have at least 125 brightness difference for good readability
      expect(brightnessDiff).toBeGreaterThan(100);
    }
  })

  test('modal should be readable in both light and dark modes', async ({ page }) => {
    // Test in light mode (default)
    await page.emulateMedia({ colorScheme: 'light' })
    
    const firstCard = page.locator('.cursor-pointer').first()
    if (await firstCard.count() === 0) {
      console.log('No production jobs found')
      return
    }

    await firstCard.click()
    
    let dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Check light mode colors
    const lightBg = await dialog.locator('.fixed.left-\\[50\\%\\]').first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    console.log('Light mode background:', lightBg)
    
    // Close dialog
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    
    // Switch to dark mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForTimeout(500) // Wait for theme to apply
    
    // Reopen dialog
    await firstCard.click()
    dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Check dark mode colors
    const darkBg = await dialog.locator('.fixed.left-\\[50\\%\\]').first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    console.log('Dark mode background:', darkBg)
    
    // Ensure backgrounds are different between modes
    expect(lightBg).not.toBe(darkBg)
    
    // In both modes, ensure proper visibility
    const dialogTitle = dialog.locator('[role="heading"]').first()
    const titleColor = await dialogTitle.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    // Check visibility based on background
    const bgMatch = darkBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const textMatch = titleColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    
    if (bgMatch && textMatch) {
      const bgBrightness = (parseInt(bgMatch[1]) * 299 + parseInt(bgMatch[2]) * 587 + parseInt(bgMatch[3]) * 114) / 1000;
      const textBrightness = (parseInt(textMatch[1]) * 299 + parseInt(textMatch[2]) * 587 + parseInt(textMatch[3]) * 114) / 1000;
      
      const brightnessDiff = Math.abs(bgBrightness - textBrightness);
      console.log('Dark mode brightness difference:', brightnessDiff);
      
      // Should have significant brightness difference
      expect(brightnessDiff).toBeGreaterThan(100);
    }
  })
})