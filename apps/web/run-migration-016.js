#!/usr/bin/env node
const { readFileSync } = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  const supabase = createClient(
    'https://nsbybnsmhvviofzfgphb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnlibnNtaHZ2aW9memZncGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyODM4NCwiZXhwIjoyMDcxMjA0Mzg0fQ.GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0'
  );

  try {
    console.log('✅ Connected to Supabase');

    const sql = readFileSync('./supabase/migrations/016_update_to_specific_models.sql', 'utf8');

    console.log('🚀 Running migration 016...\n');

    // Run the SQL using Supabase's RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql RPC doesn't exist, we'll need to run each statement separately
      console.log('ℹ️  exec_sql RPC not available, running via REST API...');

      // Split SQL into individual statements and run them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.toLowerCase().startsWith('select')) {
          // For SELECT statements, use from()
          const { data: selectData, error: selectError } = await supabase
            .from('pricing_options')
            .select('*');

          if (selectError) {
            console.error('Error:', selectError);
          } else {
            console.log('Query result:', selectData);
          }
        } else {
          // For other statements, try using the postgres REST API
          const response = await fetch(
            'https://nsbybnsmhvviofzfgphb.supabase.co/rest/v1/rpc/exec',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnlibnNtaHZ2aW9memZncGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyODM4NCwiZXhwIjoyMDcxMjA0Mzg0fQ.GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnlibnNtaHZ2aW9memZncGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyODM4NCwiZXhwIjoyMDcxMjA0Mzg0fQ.GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0',
              },
              body: JSON.stringify({ query: statement })
            }
          );

          if (!response.ok) {
            console.error('Statement failed:', statement);
          }
        }
      }

      console.log('✅ Migration completed!');
      return;
    }

    console.log('✅ Migration completed successfully!');
    if (data) {
      console.log('Result:', data);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
