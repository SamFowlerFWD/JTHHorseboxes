#!/usr/bin/env node

// Apply ops tables migration to Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyOpsMigration() {
  console.log('🚀 Applying Ops Tables Migration...\n')
  
  try {
    // Read the ops-tables.sql file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'ops-tables.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Migration file loaded:', sqlPath)
    console.log('Size:', sqlContent.length, 'characters\n')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      // Extract a description from the statement
      let description = 'SQL statement'
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)
        if (match) description = `Create table: ${match[1]}`
      } else if (statement.includes('ALTER TABLE')) {
        const match = statement.match(/ALTER TABLE (\w+)/i)
        if (match) description = `Alter table: ${match[1]}`
      } else if (statement.includes('CREATE INDEX')) {
        const match = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i)
        if (match) description = `Create index: ${match[1]}`
      } else if (statement.includes('CREATE POLICY')) {
        const match = statement.match(/CREATE POLICY "([^"]+)"/i)
        if (match) description = `Create policy: ${match[1]}`
      } else if (statement.includes('INSERT INTO')) {
        const match = statement.match(/INSERT INTO (\w+)/i)
        if (match) description = `Insert data into: ${match[1]}`
      } else if (statement.includes('CREATE TRIGGER')) {
        const match = statement.match(/CREATE TRIGGER (\w+)/i)
        if (match) description = `Create trigger: ${match[1]}`
      }
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${description}... `)
      
      try {
        // Use the SQL editor endpoint
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        }).single()
        
        if (error) {
          // Try a different approach - direct query
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ query: statement })
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
        }
        
        console.log('✅')
        successCount++
      } catch (err) {
        console.log(`❌ ${err.message}`)
        errorCount++
      }
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log(`Migration Results: ${successCount} succeeded, ${errorCount} failed`)
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. This might be normal if:')
      console.log('   - Tables/columns already exist')
      console.log('   - Policies are already created')
      console.log('   - Sample data already exists')
      console.log('\n📝 Manual Action Required:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the contents of: supabase/ops-tables.sql')
      console.log('   4. Run the SQL manually')
      console.log('\n🔗 Direct link to SQL Editor:')
      console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/_/sql`)
    } else {
      console.log('\n✅ All migrations applied successfully!')
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.log('\n📝 Manual Action Required:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy and paste the contents of: supabase/ops-tables.sql')
    console.log('   4. Run the SQL manually')
    console.log('\n🔗 Direct link to SQL Editor:')
    console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/_/sql`)
    process.exit(1)
  }
}

applyOpsMigration()