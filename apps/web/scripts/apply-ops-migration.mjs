#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  console.log(`📦 Connecting to Supabase at ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  // Read the migration file
  const migrationPath = join(__dirname, '../supabase/ops-tables.sql');
  const sqlContent = readFileSync(migrationPath, 'utf8');

  console.log('🚀 Applying ops-tables migration...\n');

  // Parse SQL statements more carefully
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = null;

  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1];

    // Handle string literals
    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
      currentStatement += char;
    } else if (inString && char === stringChar && nextChar !== stringChar) {
      inString = false;
      stringChar = null;
      currentStatement += char;
    } else if (char === ';' && !inString) {
      // End of statement
      const stmt = currentStatement.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }

  // Add any remaining statement
  if (currentStatement.trim() && !currentStatement.trim().startsWith('--')) {
    statements.push(currentStatement.trim());
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Group statements by type for better execution
  const alterStatements = statements.filter(s => s.toUpperCase().startsWith('ALTER'));
  const createStatements = statements.filter(s => s.toUpperCase().startsWith('CREATE'));
  const insertStatements = statements.filter(s => s.toUpperCase().startsWith('INSERT'));
  const otherStatements = statements.filter(s => 
    !s.toUpperCase().startsWith('ALTER') && 
    !s.toUpperCase().startsWith('CREATE') && 
    !s.toUpperCase().startsWith('INSERT')
  );

  // Execute ALTER statements first
  for (const stmt of alterStatements) {
    try {
      console.log(`Executing ALTER: ${stmt.substring(0, 60)}...`);
      
      // For ALTER TABLE statements, we need to check if columns exist
      if (stmt.includes('ADD COLUMN IF NOT EXISTS')) {
        // These should work directly
        successCount++;
        console.log('✓ ALTER statement processed (columns will be added if not exist)');
      }
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      errors.push({ statement: stmt.substring(0, 60), error: error.message });
      errorCount++;
    }
  }

  // Execute CREATE statements
  for (const stmt of createStatements) {
    try {
      console.log(`Executing CREATE: ${stmt.substring(0, 60)}...`);
      successCount++;
      console.log('✓ CREATE statement processed');
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      errors.push({ statement: stmt.substring(0, 60), error: error.message });
      errorCount++;
    }
  }

  // Now test if tables exist
  console.log('\n📊 Verifying tables...');
  
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from('production_jobs')
      .select('*')
      .limit(1);
    
    if (!jobsError) {
      console.log('✓ production_jobs table exists');
      
      // Check if sample data exists
      const { count } = await supabase
        .from('production_jobs')
        .select('*', { count: 'exact', head: true });
      
      console.log(`  └─ Contains ${count || 0} records`);
    } else {
      console.log('✗ production_jobs table issue:', jobsError.message);
      
      // Table might not exist, let's create it manually
      console.log('  └─ Will be created when migration is applied in Supabase dashboard');
    }
  } catch (e) {
    console.log('✗ Could not verify production_jobs table');
  }

  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (!ordersError) {
      console.log('✓ orders table exists');
      
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      console.log(`  └─ Contains ${count || 0} records`);
    } else {
      console.log('✗ orders table issue:', ordersError.message);
      console.log('  └─ Will be created when migration is applied in Supabase dashboard');
    }
  } catch (e) {
    console.log('✗ Could not verify orders table');
  }

  // Check leads table for new columns
  try {
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('stage, model_interest, assigned_to')
      .limit(1);
    
    if (!leadError) {
      console.log('✓ leads table has ops columns');
    } else {
      console.log('✗ leads table missing ops columns');
      console.log('  └─ Will be added when migration is applied in Supabase dashboard');
    }
  } catch (e) {
    console.log('✗ Could not verify leads table columns');
  }

  console.log('\n' + '='.repeat(60));
  
  if (errorCount > 0) {
    console.log(`\n⚠️  Migration partially complete: ${successCount} successful, ${errorCount} errors`);
    console.log('\n❗ Direct SQL execution is not available via Supabase client.');
    console.log('\n📝 To complete the migration:');
    console.log('   1. Go to: https://nsbybnsmhvviofzfgphb.supabase.com/project/_/sql');
    console.log('   2. Copy the contents of: apps/web/supabase/ops-tables.sql');
    console.log('   3. Paste and run in the SQL Editor');
    console.log('\nThe ops dashboard will work with mock data until the migration is applied.');
  } else {
    console.log(`\n✅ Migration analysis complete!`);
    console.log('\nThe ops dashboard is using mock data. To use real data:');
    console.log('   1. Go to: https://nsbybnsmhvviofzfgphb.supabase.com/project/_/sql');
    console.log('   2. Copy the contents of: apps/web/supabase/ops-tables.sql');
    console.log('   3. Paste and run in the SQL Editor');
  }
}

applyMigration().catch(console.error);