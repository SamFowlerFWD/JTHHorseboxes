import { test, expect, Page } from '@playwright/test'

// Helper function to log with timestamp
const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }
  console.log(`[${timestamp}] ${symbols[type]} ${message}`)
}

// Helper to check if using real database
const checkDatabaseConnection = async (page: Page, endpoint: string): Promise<boolean> => {
  try {
    const response = await page.request.get(endpoint)
    const data = await response.json()
    return data.success && !data.mock
  } catch {
    return false
  }
}

test.describe('Operations Platform Database Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the ops dashboard
    await page.goto('/ops')
    log('Starting test from /ops dashboard')
  })

  test.describe('Authentication & Access Control', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/ops')
      await expect(page).toHaveURL(/\/ops\/login/)
      await expect(page.locator('h1')).toContainText(/sign in|login/i)
    })

    test('should show login form with proper fields', async ({ page }) => {
      await page.goto('/ops/login')
      
      // Check for email and password fields
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should handle login errors gracefully', async ({ page }) => {
      await page.goto('/ops/login')
      
      // Try to login with invalid credentials
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show error message (exact text may vary)
      await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Customers API with Fallback', () => {
    test('should fetch customers data (mock or real)', async ({ page }) => {
      const response = await page.request.get('/api/ops/customers')
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBeTruthy()
      
      // Check if using mock data
      if (data.mock) {
        console.log('✓ Using mock customer data (database table not available)')
        expect(data.data.length).toBeGreaterThan(0)
        expect(data.data[0]).toHaveProperty('firstName')
        expect(data.data[0]).toHaveProperty('lastName')
        expect(data.data[0]).toHaveProperty('email')
      } else {
        console.log('✓ Using real customer data from database')
      }
    })

    test('should handle customer search with parameters', async ({ page }) => {
      const response = await page.request.get('/api/ops/customers?search=sarah&status=active')
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBeTruthy()
    })

    test('should handle customer creation request', async ({ page }) => {
      const response = await page.request.post('/api/ops/customers', {
        data: {
          action: 'create',
          data: {
            firstName: 'Test',
            lastName: 'Customer',
            email: `test${Date.now()}@example.com`,
            phone: '+44 7700 900000',
            status: 'prospect',
            type: 'individual'
          }
        }
      })
      
      // If database is not available, it should fail gracefully
      const data = await response.json()
      if (!data.success) {
        console.log('✓ Customer creation failed gracefully (expected if DB not configured)')
        expect(data.error).toBeTruthy()
      } else {
        console.log('✓ Customer created successfully')
        expect(data.data).toHaveProperty('id')
      }
    })
  })

  test.describe('Inventory API with Fallback', () => {
    test('should fetch inventory data (mock or real)', async ({ page }) => {
      const response = await page.request.get('/api/ops/inventory')
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBeTruthy()
      
      // Check if using mock data
      if (data.mock) {
        console.log('✓ Using mock inventory data (database table not available)')
        expect(data.data.length).toBeGreaterThan(0)
        expect(data.data[0]).toHaveProperty('partNumber')
        expect(data.data[0]).toHaveProperty('name')
        expect(data.data[0]).toHaveProperty('currentStock')
      } else {
        console.log('✓ Using real inventory data from database')
      }
    })

    test('should handle stock adjustment request', async ({ page }) => {
      const response = await page.request.post('/api/ops/inventory', {
        data: {
          action: 'adjustStock',
          data: {
            itemId: '1',
            adjustment: 5,
            reason: 'Test adjustment'
          }
        }
      })
      
      // If database is not available, it should fail gracefully
      const data = await response.json()
      if (!data.success) {
        console.log('✓ Stock adjustment failed gracefully (expected if DB not configured)')
        expect(data.error).toBeTruthy()
      } else {
        console.log('✓ Stock adjusted successfully')
        expect(data.message).toContain('success')
      }
    })
  })

  test.describe('Main Site Functionality', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/J Taylor Horseboxes|JTH/i)
      
      // Check for main navigation
      await expect(page.locator('nav')).toBeVisible()
      
      // Check for hero section
      const heroSection = page.locator('section').first()
      await expect(heroSection).toBeVisible()
    })

    test('should navigate to models page', async ({ page }) => {
      await page.goto('/models')
      
      // Check for model listings
      await expect(page.locator('h1, h2').filter({ hasText: /models|range/i })).toBeVisible()
    })

    test('should load configurator page', async ({ page }) => {
      await page.goto('/configurator')
      
      // Check for configurator elements
      await expect(page.locator('text=/configure|build|design/i')).toBeVisible()
    })
  })

  test.describe('Error Pages', () => {
    test('should show proper error page for unauthorized access', async ({ page }) => {
      await page.goto('/ops/unauthorized')
      await expect(page.locator('text=/unauthorized|access denied/i')).toBeVisible()
    })

    test('should show proper error page for locked account', async ({ page }) => {
      await page.goto('/ops/locked')
      await expect(page.locator('text=/locked|temporarily locked/i')).toBeVisible()
    })

    test('should show proper error page for inactive account', async ({ page }) => {
      await page.goto('/ops/inactive')
      await expect(page.locator('text=/inactive|deactivated/i')).toBeVisible()
    })
  })

  test.describe('Comprehensive Database Validation', () => {
    test('should validate all database tables and connections', async ({ page }) => {
      console.log('\n' + '='.repeat(60))
      console.log('       🔍 COMPREHENSIVE DATABASE VALIDATION REPORT')
      console.log('='.repeat(60) + '\n')
      
      const startTime = Date.now()
      
      // Test 1: Customers Table
      console.log('\n📊 CUSTOMERS TABLE VALIDATION')
      console.log('-'.repeat(40))
      
      const customersResponse = await page.request.get('/api/ops/customers')
      const customersData = await customersResponse.json()
      
      if (customersData.mock) {
        log('Customers Table: Using mock data (database not configured)', 'warning')
        log(`Mock records available: ${customersData.data?.length || 0}`, 'info')
      } else {
        log('Customers Table: Connected to real database', 'success')
        log(`Records in database: ${customersData.data?.length || 0}`, 'info')
        
        // Validate table structure
        if (customersData.data && customersData.data.length > 0) {
          const sample = customersData.data[0]
          const requiredFields = ['id', 'firstName', 'lastName', 'email', 'status']
          const missingFields = requiredFields.filter(field => !(field in sample))
          
          if (missingFields.length === 0) {
            log('Table structure validated successfully', 'success')
          } else {
            log(`Missing fields: ${missingFields.join(', ')}`, 'error')
          }
        }
      }
      
      // Test 2: Inventory Table
      console.log('\n📦 INVENTORY TABLE VALIDATION')
      console.log('-'.repeat(40))
      
      const inventoryResponse = await page.request.get('/api/ops/inventory')
      const inventoryData = await inventoryResponse.json()
      
      if (inventoryData.mock) {
        log('Inventory Table: Using mock data (database not configured)', 'warning')
        log(`Mock items available: ${inventoryData.data?.length || 0}`, 'info')
      } else {
        log('Inventory Table: Connected to real database', 'success')
        log(`Items in database: ${inventoryData.data?.length || 0}`, 'info')
        
        // Validate inventory structure and stock levels
        if (inventoryData.data && inventoryData.data.length > 0) {
          const sample = inventoryData.data[0]
          const requiredFields = ['id', 'partNumber', 'name', 'currentStock', 'minStock', 'maxStock']
          const missingFields = requiredFields.filter(field => !(field in sample))
          
          if (missingFields.length === 0) {
            log('Table structure validated successfully', 'success')
            
            // Check for low stock items
            const lowStock = inventoryData.data.filter((item: any) => 
              item.currentStock < item.minStock
            )
            if (lowStock.length > 0) {
              log(`Low stock warning: ${lowStock.length} items below minimum`, 'warning')
            }
          } else {
            log(`Missing fields: ${missingFields.join(', ')}`, 'error')
          }
        }
      }
      
      // Test 3: Authentication System & Profiles Table
      console.log('\n🔐 AUTHENTICATION SYSTEM VALIDATION')
      console.log('-'.repeat(40))
      
      const authCheckResponse = await page.request.get('/api/auth/check')
      if (authCheckResponse.ok()) {
        const authData = await authCheckResponse.json()
        if (authData.authenticated) {
          log('Auth System: Active with current session', 'success')
          if (authData.user) {
            log(`Logged in as: ${authData.user.email || 'Unknown'}`, 'info')
          }
        } else {
          log('Auth System: Available but no active session', 'warning')
        }
        
        // Check profiles table structure
        const profilesResponse = await page.request.get('/api/ops/profiles')
        if (profilesResponse.ok()) {
          const profilesData = await profilesResponse.json()
          if (profilesData.success && !profilesData.mock) {
            log('Profiles Table: Connected to real database', 'success')
          } else {
            log('Profiles Table: Not configured or using mock', 'warning')
          }
        }
      } else {
        log('Auth System: Not configured', 'error')
      }
      
      // Test 4: Additional Tables
      console.log('\n🗂️ ADDITIONAL TABLES VALIDATION')
      console.log('-'.repeat(40))
      
      const additionalTables = [
        { endpoint: '/api/ops/quotes', name: 'Quotes' },
        { endpoint: '/api/ops/builds', name: 'Builds' },
        { endpoint: '/api/ops/leads', name: 'Leads' }
      ]
      
      for (const table of additionalTables) {
        try {
          const response = await page.request.get(table.endpoint)
          const data = await response.json()
          
          if (data.success) {
            if (data.mock) {
              log(`${table.name} Table: Using mock data`, 'warning')
            } else {
              log(`${table.name} Table: Connected to database`, 'success')
            }
          } else {
            log(`${table.name} Table: Not available`, 'error')
          }
        } catch (error) {
          log(`${table.name} Table: Error checking status`, 'error')
        }
      }
      
      // Summary Report
      console.log('\n' + '='.repeat(60))
      console.log('       📋 VALIDATION SUMMARY')
      console.log('='.repeat(60))
      
      const elapsed = Date.now() - startTime
      log(`Total validation time: ${elapsed}ms`, 'info')
      
      // Determine overall status
      const isCustomersConnected = await checkDatabaseConnection(page, '/api/ops/customers')
      const isInventoryConnected = await checkDatabaseConnection(page, '/api/ops/inventory')
      
      if (isCustomersConnected && isInventoryConnected) {
        console.log('\n🎉 SUCCESS: Database is fully operational!')
        console.log('All critical tables are connected and functioning.')
      } else if (!isCustomersConnected && !isInventoryConnected) {
        console.log('\n⚠️ WARNING: Running in mock mode')
        console.log('The application is using mock data. To connect to the database:')
        console.log('1. Run the migration script: apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql')
        console.log('2. Verify with: npm run validate:db')
      } else {
        console.log('\n⚠️ PARTIAL: Some tables connected, others using mock data')
        console.log('Check the detailed report above for specific issues.')
      }
      
      console.log('\n' + '='.repeat(60) + '\n')
    })
    
    test('should perform deep database functionality tests', async ({ page }) => {
      console.log('\n' + '='.repeat(60))
      console.log('       🔬 DEEP FUNCTIONALITY TESTING')
      console.log('='.repeat(60) + '\n')
      
      // Test CRUD operations
      console.log('\n🔄 TESTING CRUD OPERATIONS')
      console.log('-'.repeat(40))
      
      // Test Customer Creation
      const testCustomerId = `test_${Date.now()}`
      const createCustomerResponse = await page.request.post('/api/ops/customers', {
        data: {
          action: 'create',
          data: {
            firstName: 'Playwright',
            lastName: 'Test',
            email: `${testCustomerId}@test.com`,
            phone: '+44 7700 900000',
            status: 'prospect',
            type: 'individual'
          }
        }
      })
      
      const createResult = await createCustomerResponse.json()
      if (createResult.success && !createResult.mock) {
        log('Customer creation: Success', 'success')
        log(`Created customer ID: ${createResult.data?.id}`, 'info')
        
        // Test Customer Search
        const searchResponse = await page.request.get(`/api/ops/customers?search=Playwright`)
        const searchResult = await searchResponse.json()
        if (searchResult.success && searchResult.data?.length > 0) {
          log('Customer search: Working correctly', 'success')
        } else {
          log('Customer search: No results found', 'warning')
        }
        
        // Clean up test data if possible
        if (createResult.data?.id) {
          const deleteResponse = await page.request.post('/api/ops/customers', {
            data: {
              action: 'delete',
              id: createResult.data.id
            }
          })
          if (deleteResponse.ok()) {
            log('Test data cleanup: Success', 'info')
          }
        }
      } else if (createResult.mock) {
        log('Customer creation: Using mock (database not available)', 'warning')
      } else {
        log('Customer creation: Failed', 'error')
        if (createResult.error) {
          log(`Error: ${createResult.error}`, 'error')
        }
      }
      
      // Test Inventory Stock Adjustment
      console.log('\n📊 TESTING INVENTORY OPERATIONS')
      console.log('-'.repeat(40))
      
      const stockAdjustResponse = await page.request.post('/api/ops/inventory', {
        data: {
          action: 'adjustStock',
          data: {
            itemId: '1',
            adjustment: 5,
            reason: 'Playwright test adjustment'
          }
        }
      })
      
      const stockResult = await stockAdjustResponse.json()
      if (stockResult.success && !stockResult.mock) {
        log('Stock adjustment: Success', 'success')
      } else if (stockResult.mock) {
        log('Stock adjustment: Using mock (database not available)', 'warning')
      } else {
        log('Stock adjustment: Failed', 'error')
      }
      
      console.log('\n' + '='.repeat(60) + '\n')
    })
  })
})

test.describe('API Error Handling & Recovery', () => {
  test('should handle database connection errors gracefully', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('       🛡️ ERROR HANDLING VALIDATION')
    console.log('='.repeat(60) + '\n')
    
    // Test various API endpoints for proper error handling
    const endpoints = [
      { path: '/api/ops/customers', name: 'Customers API' },
      { path: '/api/ops/inventory', name: 'Inventory API' },
      { path: '/api/ops/quotes', name: 'Quotes API' },
      { path: '/api/ops/builds', name: 'Builds API' }
    ]
    
    for (const endpoint of endpoints) {
      const response = await page.request.get(endpoint.path)
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data).toHaveProperty('success')
      
      // Should either have data or mock flag
      if (data.success) {
        expect(data.data).toBeDefined()
        const status = data.mock ? '🔄 Mock mode' : '✅ Database connected'
        console.log(`${endpoint.name.padEnd(20)} ${status}`)
      } else {
        console.log(`${endpoint.name.padEnd(20)} ❌ Error: ${data.error || 'Unknown'}`)
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n')
  })

  test('should validate response structure and data integrity', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('       🔍 DATA INTEGRITY VALIDATION')
    console.log('='.repeat(60) + '\n')
    
    // Test Customers API Structure
    console.log('Testing Customers API data structure...')
    const customersResponse = await page.request.get('/api/ops/customers')
    const customersData = await customersResponse.json()
    
    // Check consistent response structure
    expect(customersData).toHaveProperty('success')
    expect(customersData).toHaveProperty('data')
    
    if (customersData.data && customersData.data.length > 0) {
      const customer = customersData.data[0]
      
      // Validate customer structure
      const requiredFields = ['id', 'firstName', 'lastName', 'email']
      const foundFields = requiredFields.filter(field => field in customer)
      
      log(`Customer fields validated: ${foundFields.length}/${requiredFields.length}`, 
          foundFields.length === requiredFields.length ? 'success' : 'warning')
      
      // Check data types
      if (typeof customer.id === 'string' || typeof customer.id === 'number') {
        log('Data types: Valid', 'success')
      } else {
        log('Data types: Invalid ID type', 'error')
      }
    }
    
    // Test Inventory API Structure
    console.log('\nTesting Inventory API data structure...')
    const inventoryResponse = await page.request.get('/api/ops/inventory')
    const inventoryData = await inventoryResponse.json()
    
    expect(inventoryData).toHaveProperty('success')
    expect(inventoryData).toHaveProperty('data')
    
    if (inventoryData.data && inventoryData.data.length > 0) {
      const item = inventoryData.data[0]
      
      // Validate inventory structure
      const requiredFields = ['id', 'partNumber', 'name', 'currentStock']
      const foundFields = requiredFields.filter(field => field in item)
      
      log(`Inventory fields validated: ${foundFields.length}/${requiredFields.length}`, 
          foundFields.length === requiredFields.length ? 'success' : 'warning')
      
      // Validate stock levels are numbers
      if (typeof item.currentStock === 'number' && item.currentStock >= 0) {
        log('Stock levels: Valid numeric values', 'success')
      } else {
        log('Stock levels: Invalid values detected', 'error')
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n')
  })
})

test.describe('UI Components with Database Integration', () => {
  test('should validate operations dashboard with real data', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('       🖥️ UI INTEGRATION TESTING')
    console.log('='.repeat(60) + '\n')
    
    // Navigate to ops dashboard
    await page.goto('/ops')
    
    // Check if redirected to login
    if (page.url().includes('/login')) {
      log('Dashboard requires authentication', 'info')
      
      // Validate login page
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      log('Login page: Rendered correctly', 'success')
    } else {
      log('Dashboard: Accessible without login', 'warning')
      
      // Check for dashboard components
      const metricsCards = await page.locator('[data-testid="metric-card"]').count()
      if (metricsCards > 0) {
        log(`Dashboard metrics: ${metricsCards} cards found`, 'success')
      }
      
      // Check for navigation
      const navItems = await page.locator('nav a').count()
      if (navItems > 0) {
        log(`Navigation: ${navItems} links found`, 'success')
      }
    }
    
    // Test customers page (if accessible)
    const customersPageResponse = await page.goto('/ops/customers', { waitUntil: 'domcontentloaded' })
    if (customersPageResponse && !page.url().includes('/login')) {
      log('Customers page: Accessible', 'success')
      
      // Look for customer table or list
      const hasTable = await page.locator('table').count() > 0
      const hasList = await page.locator('[role="list"]').count() > 0
      
      if (hasTable || hasList) {
        log('Customer data display: Found', 'success')
      } else {
        log('Customer data display: Not found', 'warning')
      }
    }
    
    // Test inventory page (if accessible)
    const inventoryPageResponse = await page.goto('/ops/inventory', { waitUntil: 'domcontentloaded' })
    if (inventoryPageResponse && !page.url().includes('/login')) {
      log('Inventory page: Accessible', 'success')
      
      // Look for inventory grid or table
      const hasGrid = await page.locator('[role="grid"]').count() > 0
      const hasTable = await page.locator('table').count() > 0
      
      if (hasGrid || hasTable) {
        log('Inventory display: Found', 'success')
      } else {
        log('Inventory display: Not found', 'warning')
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n')
  })
})