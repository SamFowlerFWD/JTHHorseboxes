#!/usr/bin/env node

/**
 * Database Validation Script
 * 
 * This script validates the current state of the Supabase database
 * and provides detailed information about missing tables and migrations.
 * 
 * Usage: node scripts/validate-database.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`${colors.red}❌ Missing Supabase environment variables${colors.reset}`)
  console.log(`${colors.gray}Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local${colors.reset}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function for detailed logging
const logDetail = (message, indent = 0) => {
  const spaces = ' '.repeat(indent)
  console.log(`${spaces}${colors.gray}${message}${colors.reset}`)
}

// Tables to check with enhanced validation
const tablesToCheck = [
  {
    name: 'customers',
    required: true,
    columns: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'customer_type'],
    description: 'Customer management table',
    validateData: async (data) => {
      if (!data || data.length === 0) return { valid: true, message: 'No data to validate' }
      
      const issues = []
      // Check for required fields
      const sample = data[0]
      if (!sample.email || !sample.email.includes('@')) {
        issues.push('Invalid email format detected')
      }
      if (sample.status && !['active', 'inactive', 'prospect', 'lead'].includes(sample.status)) {
        issues.push('Invalid status value detected')
      }
      
      return {
        valid: issues.length === 0,
        message: issues.length > 0 ? issues.join(', ') : 'Data validation passed'
      }
    }
  },
  {
    name: 'inventory',
    required: true,
    columns: ['id', 'part_number', 'name', 'current_stock', 'min_stock', 'max_stock', 'status'],
    description: 'Inventory management table',
    validateData: async (data) => {
      if (!data || data.length === 0) return { valid: true, message: 'No data to validate' }
      
      const issues = []
      let lowStockCount = 0
      let criticalStockCount = 0
      
      data.forEach(item => {
        if (item.current_stock < item.min_stock) {
          lowStockCount++
          if (item.current_stock <= 0) {
            criticalStockCount++
          }
        }
      })
      
      if (criticalStockCount > 0) {
        issues.push(`${criticalStockCount} items with zero stock`)
      }
      if (lowStockCount > 0) {
        issues.push(`${lowStockCount} items below minimum stock`)
      }
      
      return {
        valid: true, // Stock issues are warnings, not errors
        message: issues.length > 0 ? `Warnings: ${issues.join(', ')}` : 'Stock levels healthy'
      }
    }
  },
  {
    name: 'profiles',
    required: true,
    columns: ['id', 'email', 'full_name', 'role', 'department', 'is_active'],
    description: 'User profiles for authentication',
    validateData: async (data) => {
      if (!data || data.length === 0) return { valid: true, message: 'No profiles found' }
      
      const activeUsers = data.filter(u => u.is_active).length
      const adminUsers = data.filter(u => u.role === 'admin').length
      
      return {
        valid: adminUsers > 0,
        message: `${activeUsers} active users, ${adminUsers} admins`
      }
    }
  },
  {
    name: 'auth_audit_log',
    required: false,
    columns: ['id', 'event_type', 'user_id', 'created_at'],
    description: 'Authentication audit logging'
  },
  {
    name: 'customer_communications',
    required: false,
    columns: ['id', 'customer_id', 'communication_type', 'content'],
    description: 'Customer communication tracking'
  },
  {
    name: 'customer_orders',
    required: false,
    columns: ['id', 'customer_id', 'order_number', 'total_amount'],
    description: 'Customer order tracking'
  },
  {
    name: 'inventory_movements',
    required: false,
    columns: ['id', 'inventory_id', 'movement_type', 'quantity'],
    description: 'Inventory stock movement tracking'
  },
  {
    name: 'leads',
    required: false,
    columns: ['id', 'first_name', 'last_name', 'email', 'status'],
    description: 'Lead management'
  },
  {
    name: 'quotes',
    required: false,
    columns: ['id', 'lead_id', 'customer_id', 'total_price', 'status'],
    description: 'Quote management'
  }
]

// Functions to check
const functionsToCheck = [
  {
    name: 'convert_lead_to_customer',
    description: 'Converts a lead to a customer'
  },
  {
    name: 'search_customers',
    description: 'Full-text search for customers'
  },
  {
    name: 'adjust_inventory_stock',
    description: 'Safely adjusts inventory stock levels'
  },
  {
    name: 'handle_failed_login',
    description: 'Handles failed login attempts'
  },
  {
    name: 'handle_user_login',
    description: 'Handles successful login'
  },
  {
    name: 'is_account_locked',
    description: 'Checks if account is locked'
  }
]

async function checkTable(tableConfig) {
  const { name: tableName, validateData } = tableConfig
  
  try {
    // Try to select from the table (get more rows for validation)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(100)

    if (error) {
      if (error.message.includes('does not exist')) {
        return { exists: false, error: 'Table does not exist' }
      }
      return { exists: false, error: error.message }
    }

    // Get table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: tableName })
      .catch(() => ({ data: null, error: 'Function not available' }))

    // Count total rows
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    // Validate data if validator provided
    let validation = null
    if (validateData && data) {
      validation = await validateData(data)
    }
    
    return { 
      exists: true, 
      rowCount: count || data?.length || 0,
      columns: columns || [],
      validation
    }
  } catch (error) {
    return { exists: false, error: error.message }
  }
}

async function checkFunction(functionName) {
  try {
    // Try to get function info (this might fail if the function doesn't exist)
    const { error } = await supabase
      .rpc(functionName, {})
      .catch(err => ({ error: err }))

    // If error includes "does not exist" or similar, function doesn't exist
    if (error && (error.message.includes('does not exist') || error.message.includes('could not find'))) {
      return { exists: false }
    }

    // Function exists (even if it returned an error due to missing parameters)
    return { exists: true }
  } catch (error) {
    return { exists: false, error: error.message }
  }
}

async function validateDatabase() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`)
  console.log(`${colors.cyan}       DATABASE VALIDATION REPORT${colors.reset}`)
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`)

  console.log(`${colors.blue}Supabase URL:${colors.reset} ${supabaseUrl}`)
  console.log(`${colors.blue}Timestamp:${colors.reset} ${new Date().toISOString()}\n`)

  // Check tables
  console.log(`${colors.yellow}▶ Checking Tables${colors.reset}`)
  console.log(`${colors.gray}${'─'.repeat(55)}${colors.reset}`)

  let missingRequired = []
  let missingOptional = []

  for (const table of tablesToCheck) {
    const result = await checkTable(table)
    
    if (result.exists) {
      console.log(`${colors.green}✅ ${table.name.padEnd(25)}${colors.reset} ${colors.gray}${table.description}${colors.reset}`)
      if (result.rowCount !== undefined) {
        console.log(`   ${colors.gray}└─ ${result.rowCount} row(s)${colors.reset}`)
      }
      if (result.validation) {
        const validIcon = result.validation.valid ? '✔️' : '⚠️'
        const validColor = result.validation.valid ? colors.green : colors.yellow
        console.log(`   ${colors.gray}└─ ${validColor}${validIcon} ${result.validation.message}${colors.reset}`)
      }
    } else {
      const icon = table.required ? '❌' : '⚠️'
      const color = table.required ? colors.red : colors.yellow
      console.log(`${color}${icon} ${table.name.padEnd(25)}${colors.reset} ${colors.gray}${table.description}${colors.reset}`)
      console.log(`   ${colors.gray}└─ ${result.error}${colors.reset}`)
      
      if (table.required) {
        missingRequired.push(table.name)
      } else {
        missingOptional.push(table.name)
      }
    }
  }

  // Check functions
  console.log(`\n${colors.yellow}▶ Checking Functions${colors.reset}`)
  console.log(`${colors.gray}${'─'.repeat(55)}${colors.reset}`)

  let missingFunctions = []

  for (const func of functionsToCheck) {
    const result = await checkFunction(func.name)
    
    if (result.exists) {
      console.log(`${colors.green}✅ ${func.name.padEnd(30)}${colors.reset} ${colors.gray}${func.description}${colors.reset}`)
    } else {
      console.log(`${colors.yellow}⚠️ ${func.name.padEnd(30)}${colors.reset} ${colors.gray}${func.description}${colors.reset}`)
      missingFunctions.push(func.name)
    }
  }

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`)
  console.log(`${colors.cyan}       SUMMARY${colors.reset}`)
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`)

  if (missingRequired.length === 0) {
    console.log(`${colors.green}✅ All required tables are present${colors.reset}`)
  } else {
    console.log(`${colors.red}❌ Missing required tables: ${missingRequired.join(', ')}${colors.reset}`)
  }

  if (missingOptional.length > 0) {
    console.log(`${colors.yellow}⚠️  Missing optional tables: ${missingOptional.join(', ')}${colors.reset}`)
  }

  if (missingFunctions.length > 0) {
    console.log(`${colors.yellow}⚠️  Missing functions: ${missingFunctions.join(', ')}${colors.reset}`)
  }

  // Migration instructions
  if (missingRequired.length > 0 || missingOptional.length > 0) {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`)
    console.log(`${colors.cyan}       MIGRATION INSTRUCTIONS${colors.reset}`)
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`)

    console.log(`${colors.yellow}To apply missing migrations:${colors.reset}\n`)
    console.log(`1. Open the Supabase SQL Editor:`)
    console.log(`   ${colors.blue}${supabaseUrl}/project/${supabaseUrl.split('.')[0]}/sql/new${colors.reset}\n`)
    
    console.log(`2. Copy and paste the migration script:`)
    console.log(`   ${colors.blue}apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql${colors.reset}\n`)
    
    console.log(`3. Execute the script in the SQL Editor\n`)
    
    console.log(`4. Verify the migration:`)
    console.log(`   ${colors.gray}npm run validate:db${colors.reset}\n`)

    console.log(`${colors.yellow}Alternative: Use fallback mode${colors.reset}`)
    console.log(`The application will automatically use mock data for missing tables.`)
    console.log(`This allows the operations platform to function without the database.\n`)
  } else {
    console.log(`\n${colors.green}🎉 Database is fully configured and ready!${colors.reset}\n`)
  }

  // Return status code
  if (missingRequired.length > 0) {
    process.exit(1) // Exit with error if required tables are missing
  }
  process.exit(0) // Success
}

// Add performance monitoring
const startTime = Date.now()

// Run validation with timing
validateDatabase()
  .then(() => {
    const elapsed = Date.now() - startTime
    console.log(`\n${colors.gray}Validation completed in ${elapsed}ms${colors.reset}`)
  })
  .catch(error => {
    console.error(`${colors.red}Fatal error during validation:${colors.reset}`, error)
    process.exit(1)
  })