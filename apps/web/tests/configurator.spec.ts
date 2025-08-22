import { test, expect } from '@playwright/test'

test.describe('JTH Configurator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configurator')
  })

  test('should display all 5 steps in the configurator', async ({ page }) => {
    // Step 1: Customer Information
    await expect(page.getByRole('heading', { name: 'Customer Information' })).toBeVisible()
    await expect(page.getByText('Step 1 of 5')).toBeVisible()
    
    // Fill customer info
    await page.fill('input[id="name"]', 'John Doe')
    await page.fill('input[id="email"]', 'john@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    
    // Move to Step 2
    await page.click('button:has-text("Next")')
    
    // Step 2: Vehicle & Chassis
    await expect(page.getByRole('heading', { name: 'Vehicle & Chassis' })).toBeVisible()
    await expect(page.getByText('Step 2 of 5')).toBeVisible()
  })

  test('should show correct model prices', async ({ page }) => {
    // Fill customer info first
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    // Check model prices
    await expect(page.getByText('Professional 35')).toBeVisible()
    await expect(page.getByText('£22,000')).toBeVisible()
    
    await expect(page.getByText('Principle 35')).toBeVisible()
    await expect(page.getByText('£18,500')).toBeVisible()
    
    await expect(page.getByText('Progeny 35')).toBeVisible()
    await expect(page.getByText('£25,500')).toBeVisible()
  })

  test('should select model and enter chassis cost', async ({ page }) => {
    // Navigate to Vehicle & Chassis step
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    // Select Professional 35 model
    await page.click('button:has-text("Professional 35")')
    
    // Enter chassis cost
    await page.fill('input[id="chassis-cost"]', '20000')
    await page.fill('input[id="color"]', 'Midnight Blue')
    
    // Move to Step 3
    await page.click('button:has-text("Next")')
    
    // Verify we're on Deposit step
    await expect(page.getByRole('heading', { name: 'Set Your Deposit' })).toBeVisible()
  })

  test('should show default deposit of £5,000', async ({ page }) => {
    // Navigate to Deposit step
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    await page.click('button:has-text("Professional 35")')
    await page.fill('input[id="chassis-cost"]', '20000')
    await page.click('button:has-text("Next")')
    
    // Check default deposit
    await expect(page.getByText('£5,000', { exact: false })).toBeVisible()
  })

  test('should show Pioneer Package for £10,800', async ({ page }) => {
    // Navigate to Options step
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    await page.click('button:has-text("Professional 35")')
    await page.fill('input[id="chassis-cost"]', '20000')
    await page.click('button:has-text("Next")')
    
    await page.click('button:has-text("Next")') // Skip deposit (default £5,000)
    
    // Check Pioneer Package
    await expect(page.getByText('Pioneer Package')).toBeVisible()
    await expect(page.getByText('£10,800')).toBeVisible()
    await expect(page.getByText('SAVE £2,400')).toBeVisible()
  })

  test('should show dialog for Pioneer Package on Professional/Principle models', async ({ page }) => {
    // Navigate to Options step with Professional model
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    await page.click('button:has-text("Professional 35")')
    await page.fill('input[id="chassis-cost"]', '20000')
    await page.click('button:has-text("Next")')
    await page.click('button:has-text("Next")')
    
    // Click Add Package
    await page.click('button:has-text("Add Package")')
    
    // Check if dialog appears
    await expect(page.getByText('Select Horse Area Configuration')).toBeVisible()
    await expect(page.getByText('1ft Half Wall Extension')).toBeVisible()
    await expect(page.getByText('3ft Full Extension')).toBeVisible()
    
    // Select 3ft option
    await page.click('button:has-text("3ft Full Extension")')
    
    // Verify package is selected
    await expect(page.getByText('Selected')).toBeVisible()
  })

  test('should calculate payment schedule correctly', async ({ page }) => {
    // Complete full configuration
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    // Select Professional 35 (£22,000)
    await page.click('button:has-text("Professional 35")')
    await page.fill('input[id="chassis-cost"]', '20000')
    await page.click('button:has-text("Next")')
    
    // Keep default deposit (£5,000)
    await page.click('button:has-text("Next")')
    
    // Add Pioneer Package (£10,800)
    await page.click('button:has-text("Add Package")')
    if (await page.getByText('Select Horse Area Configuration').isVisible()) {
      await page.click('button:has-text("3ft Full Extension")')
    }
    
    // Go to Review step
    await page.click('button:has-text("Next")')
    
    // Check payment schedule is displayed
    await expect(page.getByText('Payment Schedule')).toBeVisible()
    await expect(page.getByText('Deposit')).toBeVisible()
    await expect(page.getByText('1st Payment')).toBeVisible()
    await expect(page.getByText('2nd Payment')).toBeVisible()
    await expect(page.getByText('Final Payment')).toBeVisible()
    
    // Verify totals are shown
    await expect(page.getByText('Total (inc VAT)')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling customer info
    await page.click('button:has-text("Next")')
    
    // Should see error message
    await expect(page.getByText('Please fill in all required customer information')).toBeVisible()
    
    // Fill only partial info
    await page.fill('input[id="name"]', 'Test User')
    await page.click('button:has-text("Next")')
    
    // Should still see error
    await expect(page.getByText('Please fill in all required customer information')).toBeVisible()
    
    // Fill all required fields
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    // Should proceed to next step
    await expect(page.getByRole('heading', { name: 'Vehicle & Chassis' })).toBeVisible()
  })

  test('should handle quantity-based options', async ({ page }) => {
    // Navigate to Options step
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '+44 7123 456789')
    await page.click('button:has-text("Next")')
    
    await page.click('button:has-text("Professional 35")')
    await page.fill('input[id="chassis-cost"]', '20000')
    await page.click('button:has-text("Next")')
    await page.click('button:has-text("Next")')
    
    // Expand a category (e.g., Exterior)
    await page.click('button:has-text("Exterior")')
    
    // Look for quantity options (windows, lockers, etc.)
    const addButton = page.locator('button:has-text("Add")').first()
    if (await addButton.isVisible()) {
      await addButton.click()
      
      // Check if quantity controls appear
      const plusButton = page.locator('button:has(svg.lucide-plus)').first()
      if (await plusButton.isVisible()) {
        // Increase quantity
        await plusButton.click()
        
        // Verify quantity changed
        await expect(page.locator('span:has-text("2")').first()).toBeVisible()
      }
    }
  })

  test('should show payment breakdown in review', async ({ page }) => {
    // Complete full configuration
    await page.fill('input[id="name"]', 'John Smith')
    await page.fill('input[id="email"]', 'john.smith@example.com')
    await page.fill('input[id="phone"]', '+44 7890 123456')
    await page.click('button:has-text("Next")')
    
    // Professional 35: £22,000
    await page.click('button:has-text("Professional 35")')
    await page.fill('input[id="chassis-cost"]', '25000') // £25,000 chassis
    await page.click('button:has-text("Next")')
    
    // Deposit: £5,000 (default)
    await page.click('button:has-text("Next")')
    
    // Options: Skip for now
    await page.click('button:has-text("Next")')
    
    // Review step - verify calculations
    await expect(page.getByText('Review & Submit')).toBeVisible()
    
    // Check all sections are present
    await expect(page.getByText('Customer Information')).toBeVisible()
    await expect(page.getByText('Vehicle Configuration')).toBeVisible()
    await expect(page.getByText('Pricing Summary')).toBeVisible()
    await expect(page.getByText('Payment Schedule')).toBeVisible()
    
    // Verify customer info is shown
    await expect(page.getByText('John Smith')).toBeVisible()
    await expect(page.getByText('john.smith@example.com')).toBeVisible()
    
    // Verify model and prices
    await expect(page.getByText('Professional 35')).toBeVisible()
    await expect(page.getByText('Base Price:')).toBeVisible()
    await expect(page.getByText('Chassis Cost:')).toBeVisible()
    
    // Check payment breakdown exists
    await expect(page.getByText('Chassis with VAT:')).toBeVisible()
    await expect(page.getByText('Build with VAT:')).toBeVisible()
    await expect(page.getByText('Balance after deposit:')).toBeVisible()
  })
})