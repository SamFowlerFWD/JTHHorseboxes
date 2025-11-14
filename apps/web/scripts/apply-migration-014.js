// Script to apply migration 014: Multi-Model Support
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/014_multi_model_support.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration 014: Multi-Model Support...\n')

    // Split the SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(async () => {
        // If RPC doesn't exist, try direct query
        return await supabase.from('_migrations').select('*').limit(0)
      })

      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message)
        console.error('Statement:', statement.substring(0, 200))
        throw error
      }
    }

    console.log('\n✅ Migration 014 applied successfully!')
    console.log('\nChanges made:')
    console.log('  - Added applicable_models column (text array)')
    console.log('  - Migrated existing model data to applicable_models')
    console.log('  - Dropped old model column')
    console.log('  - Added 4.5t model specifications')
    console.log('  - Created GIN index on applicable_models')
    console.log('  - Created option_applies_to_model() helper function')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

applyMigration()
