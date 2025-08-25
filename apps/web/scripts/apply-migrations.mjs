#!/usr/bin/env node

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
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const migrations = [
  '005a_fix_leads_and_contracts.sql',
  '005b_builds_and_stages.sql', 
  '005c_inventory_and_materials.sql',
  '005d_rls_policies.sql',
  '005e_triggers_and_data.sql'
];

async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1)
      .single();
    
    if (error && !error.message.includes('Row not found')) {
      throw error;
    }
    
    console.log('✅ Database connection successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function applyMigration(filename) {
  console.log(`\n📄 Applying migration: ${filename}`);
  console.log('─'.repeat(50));
  
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    return false;
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // For now, just log what would be done
  console.log('📋 Migration contains:');
  
  // Extract main operations from SQL
  const operations = [];
  if (sql.includes('CREATE TABLE')) {
    const tables = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/g);
    if (tables) {
      tables.forEach(t => {
        const tableName = t.replace('CREATE TABLE IF NOT EXISTS ', '');
        operations.push(`  • Create table: ${tableName}`);
      });
    }
  }
  
  if (sql.includes('ALTER TABLE')) {
    const alters = sql.match(/ALTER TABLE (\w+)/g);
    if (alters) {
      const unique = [...new Set(alters)];
      unique.forEach(a => {
        const tableName = a.replace('ALTER TABLE ', '');
        operations.push(`  • Alter table: ${tableName}`);
      });
    }
  }
  
  if (sql.includes('CREATE POLICY')) {
    const policies = sql.match(/CREATE POLICY/g);
    if (policies) {
      operations.push(`  • Create ${policies.length} RLS policies`);
    }
  }
  
  if (sql.includes('CREATE INDEX')) {
    const indexes = sql.match(/CREATE INDEX/g);
    if (indexes) {
      operations.push(`  • Create ${indexes.length} indexes`);
    }
  }
  
  if (sql.includes('INSERT INTO')) {
    const inserts = sql.match(/INSERT INTO (\w+)/g);
    if (inserts) {
      const unique = [...new Set(inserts)];
      unique.forEach(i => {
        const tableName = i.replace('INSERT INTO ', '');
        operations.push(`  • Insert data into: ${tableName}`);
      });
    }
  }
  
  console.log(operations.join('\n'));
  
  console.log('\n⚠️  Migration not applied automatically.');
  console.log('📝 Please apply through Supabase Dashboard SQL Editor:');
  console.log(`   https://app.supabase.com/project/nsbybnsmhvviofzfgphb/sql`);
  
  return true;
}

async function main() {
  console.log('🚀 JTH Database Migration Tool');
  console.log('='.repeat(50));
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection.');
    process.exit(1);
  }
  
  // Show migration plan
  console.log('📋 Migration Plan:');
  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m}`);
  });
  
  // Process each migration
  for (const migration of migrations) {
    await applyMigration(migration);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Migration analysis complete!');
  console.log('\n📌 Next Steps:');
  console.log('1. Open Supabase Dashboard SQL Editor');
  console.log('2. Apply each migration file in order (005a through 005e)');
  console.log('3. Verify tables are created correctly');
  console.log('4. Test the Operations Dashboard at /ops');
  console.log('\n📖 Full instructions in: MIGRATION_INSTRUCTIONS.md');
}

// Run the script
main().catch(console.error);