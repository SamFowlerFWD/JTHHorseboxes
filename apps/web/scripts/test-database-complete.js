#!/usr/bin/env node

/**
 * Complete Database Testing Suite
 * 
 * This script runs all database validation tests in sequence:
 * 1. Quick connectivity check
 * 2. Detailed table validation
 * 3. Playwright E2E tests
 * 
 * Usage: node scripts/test-database-complete.js
 */

const { spawn } = require('child_process')
const path = require('path')

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

// Run a command and return promise
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.cyan}▶ Running: ${command} ${args.join(' ')}${colors.reset}\n`)
    
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
    
    proc.on('error', (err) => {
      reject(err)
    })
  })
}

async function runAllTests() {
  console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.magenta}     COMPLETE DATABASE TESTING SUITE${colors.reset}`)
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
  console.log(`\n${colors.blue}Starting comprehensive database validation...${colors.reset}`)
  
  const startTime = Date.now()
  const results = {
    quickCheck: false,
    validation: false,
    playwright: false
  }
  
  try {
    // Step 1: Quick connectivity check
    console.log(`\n${colors.yellow}[1/3] Quick Database Connectivity Check${colors.reset}`)
    console.log('-'.repeat(40))
    
    try {
      await runCommand('node', ['scripts/quick-db-check.js'])
      results.quickCheck = true
      console.log(`${colors.green}✅ Quick check passed${colors.reset}`)
    } catch (error) {
      console.log(`${colors.yellow}⚠️ Quick check failed - continuing with other tests${colors.reset}`)
    }
    
    // Step 2: Detailed validation
    console.log(`\n${colors.yellow}[2/3] Detailed Table Validation${colors.reset}`)
    console.log('-'.repeat(40))
    
    try {
      await runCommand('node', ['scripts/validate-database.js'])
      results.validation = true
      console.log(`${colors.green}✅ Detailed validation passed${colors.reset}`)
    } catch (error) {
      console.log(`${colors.yellow}⚠️ Detailed validation encountered issues${colors.reset}`)
    }
    
    // Step 3: Playwright tests
    console.log(`\n${colors.yellow}[3/3] Playwright E2E Tests${colors.reset}`)
    console.log('-'.repeat(40))
    
    try {
      await runCommand('npx', ['playwright', 'test', 'tests/ops-database-validation.spec.ts', '--reporter=list'])
      results.playwright = true
      console.log(`${colors.green}✅ Playwright tests passed${colors.reset}`)
    } catch (error) {
      console.log(`${colors.yellow}⚠️ Some Playwright tests failed${colors.reset}`)
    }
    
  } catch (error) {
    console.error(`\n${colors.red}Error during testing:${colors.reset}`, error.message)
  }
  
  // Final summary
  const elapsed = Math.round((Date.now() - startTime) / 1000)
  
  console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.magenta}     TEST SUMMARY${colors.reset}`)
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`)
  
  console.log(`${results.quickCheck ? '✅' : '❌'} Quick connectivity check`)
  console.log(`${results.validation ? '✅' : '❌'} Detailed table validation`)
  console.log(`${results.playwright ? '✅' : '❌'} Playwright E2E tests`)
  
  console.log(`\n${colors.blue}Total time: ${elapsed} seconds${colors.reset}`)
  
  const allPassed = Object.values(results).every(v => v)
  
  if (allPassed) {
    console.log(`\n${colors.green}🎉 All tests passed! Database is fully operational.${colors.reset}`)
  } else if (results.quickCheck || results.validation) {
    console.log(`\n${colors.yellow}⚠️ Partial success. Database is available but some tests failed.${colors.reset}`)
    console.log(`${colors.yellow}The application will work but may have limited functionality.${colors.reset}`)
  } else {
    console.log(`\n${colors.red}❌ Database is not properly configured.${colors.reset}`)
    console.log(`\n${colors.cyan}To fix this:${colors.reset}`)
    console.log('1. Ensure Supabase environment variables are set in .env.local')
    console.log('2. Run the migration script: apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql')
    console.log('3. Run this test again: npm run test:db:complete')
    console.log(`\n${colors.yellow}Note: The application will still work using mock data.${colors.reset}`)
  }
  
  process.exit(allPassed ? 0 : 1)
}

// Run the complete test suite
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error)
  process.exit(1)
})