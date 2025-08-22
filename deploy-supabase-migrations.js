#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SUPABASE_URL = 'https://nsbybnsmhvviofzfgphb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnlibnNtaHZ2aW9memZncGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyODM4NCwiZXhwIjoyMDcxMjA0Mzg0fQ.GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0';

// Function to execute SQL via Supabase REST API
async function executeSQLViaAPI(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/query`);
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

// Alternative: Use direct PostgreSQL protocol with pg package
async function deployWithPG() {
  try {
    // Check if pg is installed
    const { Client } = require('pg');
    
    const client = new Client({
      host: 'aws-0-us-west-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.nsbybnsmhvviofzfgphb',
      password: 'GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0',
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Connected to Supabase database');

    const migrations = [
      {
        file: 'apps/web/supabase/deploy-migration.sql',
        description: 'Main deployment migration'
      },
      {
        file: 'supabase/migrations/001_initial_schema.sql',
        description: 'Initial comprehensive schema'
      },
      {
        file: 'supabase/migrations/002_monday_data_import.sql',
        description: 'Monday.com data import'
      },
      {
        file: 'supabase/migrations/003_vector_search_and_functions.sql',
        description: 'Vector search and functions'
      },
      {
        file: 'supabase/migrations/004_jth_model_data.sql',
        description: 'JTH model specifications'
      }
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${migration.description}: file not found`);
        continue;
      }

      console.log(`\n📝 Executing: ${migration.description}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements (basic split, may need refinement)
      const statements = sql
        .split(/;\s*\n/)
        .filter(s => s.trim() && !s.trim().startsWith('--'))
        .map(s => s.trim() + ';');

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          await client.query(statement);
          successCount++;
        } catch (error) {
          console.error(`   ❌ Error: ${error.message.substring(0, 100)}`);
          errorCount++;
        }
      }

      console.log(`   ✅ Completed: ${successCount} successful, ${errorCount} errors`);
    }

    await client.end();
    console.log('\n🎉 Migration deployment complete!');

  } catch (error) {
    console.error('Failed to deploy:', error.message);
    console.log('\nPlease install pg package: npm install pg');
  }
}

// Check if pg is available and use it, otherwise provide instructions
deployWithPG().catch(error => {
  console.error('Error:', error.message);
  console.log('\nTo deploy migrations, you need to:');
  console.log('1. Install pg package: npm install pg');
  console.log('2. Run this script again: node deploy-supabase-migrations.js');
  console.log('\nAlternatively, copy the SQL files to Supabase Dashboard SQL Editor');
});