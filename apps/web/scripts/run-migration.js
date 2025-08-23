#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/ops-tables.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running ops-tables migration...');
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      // Skip pure comment lines
      if (statement.startsWith('--')) continue;
      
      console.log(`\nExecuting: ${statement.substring(0, 50)}...`);
      
      // Use raw SQL execution via REST API
      const { data, error } = await supabase.rpc('exec_sql', {
        query: statement + ';'
      }).single();

      if (error) {
        // Try direct execution as fallback
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement + ';' })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }
      
      console.log('✓ Success');
      successCount++;
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      errorCount++;
      // Continue with other statements
    }
  }

  console.log(`\nMigration complete: ${successCount} successful, ${errorCount} errors`);
  
  // Test if the tables were created
  console.log('\nVerifying tables...');
  
  const { data: jobs, error: jobsError } = await supabase
    .from('production_jobs')
    .select('count')
    .limit(1);
    
  if (!jobsError) {
    console.log('✓ production_jobs table exists');
  } else {
    console.log('✗ production_jobs table not found:', jobsError.message);
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('count')
    .limit(1);
    
  if (!ordersError) {
    console.log('✓ orders table exists');
  } else {
    console.log('✗ orders table not found:', ordersError.message);
  }
}

runMigration().catch(console.error);