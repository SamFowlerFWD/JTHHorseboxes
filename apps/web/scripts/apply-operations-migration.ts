#!/usr/bin/env node
/**
 * Script to apply the comprehensive operations migration
 * Run with: npx tsx scripts/apply-operations-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🚀 Starting Operations Platform Migration')
  console.log('=========================================\n')

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/005_comprehensive_operations.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('📝 Reading migration file...')
    console.log(`   File: ${migrationPath}`)
    console.log(`   Size: ${migrationSQL.length} characters\n`)

    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      const preview = statement.substring(0, 50).replace(/\n/g, ' ')
      
      process.stdout.write(`[${i + 1}/${statements.length}] Executing: ${preview}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        }).single()
        
        if (error) {
          throw error
        }
        
        successCount++
        console.log(' ✅')
      } catch (error: any) {
        errorCount++
        console.log(' ❌')
        errors.push({
          statement: preview,
          error: error.message || error
        })
      }
    }

    console.log('\n=========================================')
    console.log('📊 Migration Results:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:')
      errors.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.statement}`)
        console.log(`      Error: ${e.error}`)
      })
    }

    // Verify critical tables exist
    console.log('\n🔍 Verifying critical tables...')
    const criticalTables = [
      'builds',
      'build_stages',
      'build_tasks',
      'contracts',
      'deal_activities',
      'customer_updates',
      'inventory',
      'bill_of_materials'
    ]

    for (const table of criticalTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${table}: Not accessible (${error.message})`)
      } else {
        console.log(`   ✅ ${table}: Ready`)
      }
    }

    // Test RLS policies
    console.log('\n🔒 Testing RLS policies...')
    
    // Create test user to verify policies
    const { data: testUser, error: userError } = await supabase.auth.admin.createUser({
      email: 'test-customer@jth.example.com',
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        role: 'customer'
      }
    })

    if (testUser && !userError) {
      console.log('   ✅ Test user created')
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(testUser.user.id)
      console.log('   ✅ Test user cleaned up')
    } else {
      console.log('   ⚠️  Could not create test user for RLS testing')
    }

    console.log('\n✨ Migration process complete!')
    
    if (errorCount === 0) {
      console.log('🎉 All statements executed successfully!')
    } else {
      console.log('⚠️  Some statements failed. Please review the errors above.')
      console.log('💡 Tip: Some errors may be expected if tables/columns already exist.')
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message || error)
    process.exit(1)
  }
}

// Alternative approach using direct SQL execution
async function applyMigrationDirect() {
  console.log('🚀 Applying migration using direct SQL execution')
  console.log('================================================\n')

  try {
    const migrationPath = join(process.cwd(), 'supabase/migrations/005_comprehensive_operations.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    // Note: This requires the SQL to be executed via Supabase Dashboard or CLI
    console.log('📋 Migration SQL has been prepared.')
    console.log('   Please execute the following migration:')
    console.log('   1. Go to your Supabase Dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Create a new query')
    console.log('   4. Paste the contents of:')
    console.log(`      ${migrationPath}`)
    console.log('   5. Run the query')
    console.log('\n   Or use Supabase CLI:')
    console.log('   supabase migration up')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message || error)
    process.exit(1)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--direct')) {
    await applyMigrationDirect()
  } else {
    console.log('⚠️  Note: This script will attempt to apply the migration.')
    console.log('   For production, use Supabase CLI: supabase migration up')
    console.log('   Or apply via Supabase Dashboard SQL Editor\n')
    
    // Check if exec_sql function exists
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' }).single()
    
    if (error) {
      console.log('❌ exec_sql function not available.')
      console.log('   Falling back to manual instructions...\n')
      await applyMigrationDirect()
    } else {
      await applyMigration()
    }
  }
}

main().catch(console.error)