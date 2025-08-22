#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath, description) {
  console.log(`\n📝 Executing: ${description}`);
  console.log(`   File: ${filePath}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolons but be careful with functions/triggers
    const statements = sql
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length === 0) {
        continue;
      }
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.error(`   ❌ Error in statement ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Error in statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Completed: ${successCount} successful, ${errorCount} errors`);
    return { success: errorCount === 0, successCount, errorCount };
    
  } catch (error) {
    console.error(`   ❌ Failed to read/execute file: ${error.message}`);
    return { success: false, successCount: 0, errorCount: 1 };
  }
}

async function deployMigrations() {
  console.log('🚀 Starting JTH Database Migration Deployment');
  console.log('============================================');
  console.log(`Target: ${supabaseUrl}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const migrations = [
    {
      file: path.join(__dirname, 'apps/web/supabase/deploy-migration.sql'),
      description: 'Main deployment migration (tables, RLS, indexes)'
    },
    {
      file: path.join(__dirname, 'supabase/migrations/001_initial_schema.sql'),
      description: 'Initial comprehensive schema'
    },
    {
      file: path.join(__dirname, 'supabase/migrations/002_monday_data_import.sql'),
      description: 'Monday.com data import'
    },
    {
      file: path.join(__dirname, 'supabase/migrations/003_vector_search_and_functions.sql'),
      description: 'Vector search and functions'
    },
    {
      file: path.join(__dirname, 'supabase/migrations/004_jth_model_data.sql'),
      description: 'JTH model specifications and data'
    }
  ];
  
  let totalSuccess = 0;
  let totalErrors = 0;
  const results = [];
  
  for (const migration of migrations) {
    if (fs.existsSync(migration.file)) {
      const result = await executeSQLFile(migration.file, migration.description);
      results.push({ ...migration, ...result });
      totalSuccess += result.successCount;
      totalErrors += result.errorCount;
    } else {
      console.log(`   ⚠️  Skipping: ${migration.description} (file not found)`);
      results.push({ ...migration, success: false, skipped: true });
    }
  }
  
  console.log('\n============================================');
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('============================================');
  console.log(`Total Successful Statements: ${totalSuccess}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Overall Status: ${totalErrors === 0 ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  console.log('\n📋 Migration Details:');
  results.forEach(r => {
    if (r.skipped) {
      console.log(`   ⚠️  ${r.description}: SKIPPED`);
    } else {
      console.log(`   ${r.success ? '✅' : '❌'} ${r.description}: ${r.successCount} successful, ${r.errorCount} errors`);
    }
  });
  
  if (totalErrors === 0) {
    console.log('\n🎉 Database migration completed successfully!');
    console.log('✨ All tables, functions, indexes, and RLS policies have been deployed.');
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review and fix.');
  }
}

// Run deployment
deployMigrations().catch(console.error);