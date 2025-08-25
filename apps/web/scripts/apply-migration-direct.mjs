import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function executeSQLBatch(sqlStatements) {
  const results = [];
  
  for (const sql of sqlStatements) {
    try {
      // Use fetch to call Supabase's SQL execution endpoint directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL execution failed: ${errorText}`);
      }
      
      results.push({ success: true, sql: sql.substring(0, 50) + '...' });
    } catch (error) {
      results.push({ success: false, sql: sql.substring(0, 50) + '...', error: error.message });
    }
  }
  
  return results;
}

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_comprehensive_operations.sql');
    let migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Remove comments
    migrationSQL = migrationSQL.replace(/--.*$/gm, '');
    
    // Split into logical chunks based on major sections
    const chunks = [
      // Chunk 1: Extensions and Profiles table
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
       
       CREATE TABLE IF NOT EXISTS profiles (
         id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
         created_at TIMESTAMPTZ DEFAULT NOW(),
         updated_at TIMESTAMPTZ DEFAULT NOW(),
         first_name VARCHAR(100),
         last_name VARCHAR(100),
         display_name VARCHAR(200),
         avatar_url TEXT,
         role VARCHAR(50) DEFAULT 'customer' CHECK (role IN (
           'customer', 'sales', 'production', 'workshop', 'admin', 'manager'
         )),
         permissions JSONB DEFAULT '{}',
         phone VARCHAR(50),
         company VARCHAR(255),
         department VARCHAR(100),
         preferences JSONB DEFAULT '{}',
         notification_settings JSONB DEFAULT '{
           "email": true,
           "sms": false,
           "build_updates": true,
           "marketing": false
         }',
         active BOOLEAN DEFAULT true,
         last_login TIMESTAMPTZ
       );`,
      
      // Chunk 2: Alter leads table
      `ALTER TABLE leads 
       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
       ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 10,
       ADD COLUMN IF NOT EXISTS expected_close_date DATE,
       ADD COLUMN IF NOT EXISTS configurator_snapshot JSONB,
       ADD COLUMN IF NOT EXISTS contract_id UUID,
       ADD COLUMN IF NOT EXISTS build_id UUID,
       ADD COLUMN IF NOT EXISTS lost_reason TEXT,
       ADD COLUMN IF NOT EXISTS competitor TEXT,
       ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'pending',
       ADD COLUMN IF NOT EXISTS contract_status VARCHAR(50) DEFAULT 'not_sent';`
    ];
    
    console.log(`🚀 Applying migration in ${chunks.length} chunks...`);
    
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`\n📦 Processing chunk ${i + 1}/${chunks.length}...`);
      
      const results = await executeSQLBatch([chunks[i]]);
      
      results.forEach(result => {
        if (result.success) {
          totalSuccess++;
          console.log(`✅ Success: ${result.sql}`);
        } else {
          totalErrors++;
          console.log(`❌ Error: ${result.sql}`);
          console.log(`   ${result.error}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successful operations: ${totalSuccess}`);
    console.log(`❌ Failed operations: ${totalErrors}`);
    
    if (totalErrors > 0) {
      console.log('\n⚠️  Some operations failed. Please check the errors above.');
      console.log('You may need to apply the remaining parts of the migration manually.');
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
console.log('🏁 Starting migration...\n');
applyMigration();