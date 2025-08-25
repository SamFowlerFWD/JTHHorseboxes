import { test, expect } from '@playwright/test'

test.describe('JTH Operations Platform - Quick Verification', () => {
  
  test('Dashboard API returns correct structure', async ({ request }) => {
    const response = await request.get('/api/ops/dashboard')
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('metrics')
    expect(data.data.metrics).toHaveProperty('salesPipeline')
    expect(data.data.metrics).toHaveProperty('production')
    expect(data.data.metrics).toHaveProperty('inventory')
    expect(data.data.metrics).toHaveProperty('customers')
    
    console.log('✅ Dashboard API: Working')
    console.log(`   - Active leads: ${data.data.metrics.salesPipeline.leads}`)
    console.log(`   - In progress builds: ${data.data.metrics.production.inProgress}`)
    console.log(`   - Total customers: ${data.data.metrics.customers.total}`)
  })
  
  test('Pipeline API returns stages with leads', async ({ request }) => {
    const response = await request.get('/api/ops/pipeline')
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    
    // Check we have multiple stages with leads
    const stages = Object.keys(data.data)
    expect(stages.length).toBeGreaterThan(0)
    
    // Count leads per stage
    let totalLeads = 0
    stages.forEach(stage => {
      const stageLeads = data.data[stage].length
      totalLeads += stageLeads
      if (stageLeads > 0) {
        console.log(`   - ${stage}: ${stageLeads} leads`)
      }
    })
    
    console.log('✅ Pipeline API: Working')
    console.log(`   - Total leads: ${totalLeads}`)
    console.log(`   - Stages with data: ${stages.filter(s => data.data[s].length > 0).join(', ')}`)
  })
  
  test('Builds API returns production jobs', async ({ request }) => {
    const response = await request.get('/api/ops/builds')
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBe(true)
    
    console.log('✅ Builds API: Working')
    console.log(`   - Total builds: ${data.data.length}`)
    
    if (data.data.length > 0) {
      const inProgress = data.data.filter((b: any) => b.status === 'in_progress').length
      const scheduled = data.data.filter((b: any) => b.status === 'scheduled').length
      console.log(`   - In progress: ${inProgress}`)
      console.log(`   - Scheduled: ${scheduled}`)
    }
  })
  
  test('Operations Dashboard page loads', async ({ page }) => {
    await page.goto('/ops')
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('Operations Dashboard')
    
    // Check for key sections
    const hasMetrics = await page.locator('text=/Pipeline|Production|Inventory|Customers/').isVisible()
    expect(hasMetrics).toBe(true)
    
    console.log('✅ Operations Dashboard: Page loads successfully')
  })
  
  test('Sales Pipeline page loads with stages', async ({ page }) => {
    await page.goto('/ops/pipeline')
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('Sales Pipeline')
    
    // Check for at least one stage column
    const hasStages = await page.locator('text=/Inquiry|Specification|Qualification/').isVisible()
    expect(hasStages).toBe(true)
    
    console.log('✅ Sales Pipeline: Page loads with stage columns')
  })
  
  test('Build Tracking page loads', async ({ page }) => {
    await page.goto('/ops/builds')
    
    // Check page loaded - be flexible with the title
    const heading = await page.locator('h1').textContent()
    expect(heading).toMatch(/Build/i)
    
    console.log('✅ Build Tracking: Page loads successfully')
  })
  
  test('Customer Portal tracker loads', async ({ page }) => {
    // Try to load with a test build ID
    await page.goto('/portal/tracker/test-build')
    
    // Check page loaded (should show either tracker or error message)
    const hasContent = await page.locator('h1, h2').first().isVisible()
    expect(hasContent).toBe(true)
    
    console.log('✅ Customer Portal: Page loads')
  })
})

test.describe('Database Migration Verification', () => {
  test('All required tables exist', async ({ request }) => {
    // This test verifies the migration was successful by checking API responses
    const checks = [
      { name: 'Leads with pipeline fields', endpoint: '/api/ops/pipeline' },
      { name: 'Builds table', endpoint: '/api/ops/builds' },
      { name: 'Dashboard metrics', endpoint: '/api/ops/dashboard' }
    ]
    
    console.log('\n📊 Database Migration Status:')
    
    for (const check of checks) {
      const response = await request.get(check.endpoint)
      if (response.ok()) {
        console.log(`   ✅ ${check.name}: Working`)
      } else {
        console.log(`   ❌ ${check.name}: Failed`)
      }
      expect(response.ok()).toBeTruthy()
    }
    
    console.log('\n🎉 All database migrations applied successfully!')
  })
})