#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting JTH Operations Platform Migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'APPLY_NOW_COMPLETE_MIGRATION.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split migration into parts to handle potential policy conflicts
    const migrationParts = migrationSQL.split('-- =====================================================');
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < migrationParts.length; i++) {
      const part = migrationParts[i].trim();
      if (!part || part.startsWith('--')) continue;
      
      // Extract part name from comment if available
      const partNameMatch = part.match(/-- PART \d+: (.+)/);
      const partName = partNameMatch ? partNameMatch[1] : `Section ${i}`;
      
      console.log(`\n📦 Executing: ${partName}`);
      
      try {
        // Execute each SQL statement separately to better handle errors
        const statements = part.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
          const cleanStatement = statement.trim();
          if (!cleanStatement || cleanStatement.startsWith('--')) continue;
          
          const { error } = await supabase.rpc('exec_sql', {
            sql: cleanStatement + ';'
          }).single();
          
          if (error) {
            // Check if it's a "already exists" error which we can ignore
            if (error.message?.includes('already exists') || 
                error.message?.includes('duplicate key') ||
                error.code === '42P07' || // relation already exists
                error.code === '42701' || // column already exists  
                error.code === '42P04' || // database already exists
                error.code === '42710') { // duplicate policy
              console.log(`  ⚠️  Skipped (already exists): ${cleanStatement.substring(0, 50)}...`);
            } else {
              throw error;
            }
          } else {
            successCount++;
            console.log(`  ✅ Success: ${cleanStatement.substring(0, 50)}...`);
          }
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `  ❌ Error in ${partName}: ${error.message || error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`  ✅ Successful operations: ${successCount}`);
    console.log(`  ❌ Failed operations: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => console.log(err));
    }
    
    // Verify key tables exist
    console.log('\n🔍 Verifying database structure...');
    
    const tablesToCheck = [
      'leads', 'contracts', 'builds', 'build_stages', 'build_tasks',
      'build_media', 'inventory', 'suppliers', 'profiles'
    ];
    
    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && !error.message?.includes('no rows')) {
        console.log(`  ❌ Table '${table}': Not accessible - ${error.message}`);
      } else {
        console.log(`  ✅ Table '${table}': OK`);
      }
    }
    
    console.log('\n✨ Migration process completed!');
    
  } catch (error) {
    console.error('\n💥 Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();