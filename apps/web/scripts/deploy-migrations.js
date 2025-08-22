#!/usr/bin/env node

/**
 * Deploy Supabase migrations to remote database
 * This script executes migration SQL files in order and tracks their execution
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '../../../supabase/migrations');

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

/**
 * Calculate checksum for a file content
 */
function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Parse SQL file and prepare it for execution
 */
function prepareSQLStatements(sql) {
  // Remove comments and normalize whitespace
  const cleanSQL = sql
    .split('\n')
    .map(line => {
      // Remove line comments
      const commentIndex = line.indexOf('--');
      if (commentIndex >= 0) {
        return line.substring(0, commentIndex);
      }
      return line;
    })
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .trim();

  return cleanSQL;
}

/**
 * Create and populate migrations tracking table
 */
async function initializeMigrationsTable() {
  console.log('📋 Initializing migrations tracking...');
  
  // First, check if the table exists by trying to query it
  const { data: existingData, error: checkError } = await supabase
    .from('schema_migrations')
    .select('version')
    .limit(1);

  if (!checkError) {
    console.log('  ✓ Migrations table already exists');
    return true;
  }

  // Table doesn't exist, we need to create it
  // Since we can't execute arbitrary SQL via REST API, we'll track migrations differently
  console.log('  ℹ️  Migrations table not found');
  console.log('  ⚠️  Manual step required: Create migrations tracking table');
  
  const createTableSQL = `
-- Run this in Supabase SQL Editor to create migrations tracking table
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Grant appropriate permissions
GRANT ALL ON public.schema_migrations TO postgres, anon, authenticated, service_role;`;

  const sqlFilePath = path.join(__dirname, 'create_migrations_table.sql');
  await fs.writeFile(sqlFilePath, createTableSQL);
  
  console.log(`  📝 SQL saved to: ${sqlFilePath}`);
  console.log('  Please execute this in Supabase Dashboard SQL Editor first');
  
  return false;
}

/**
 * Check if a migration has already been executed
 */
async function isMigrationExecuted(version) {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version, checksum')
    .eq('version', version)
    .single();

  if (error && error.code === 'PGRST116') {
    // No rows returned
    return { executed: false, checksum: null };
  }

  if (error) {
    console.warn(`  ⚠️  Could not check migration status: ${error.message}`);
    return { executed: false, checksum: null };
  }

  return { executed: true, checksum: data?.checksum };
}

/**
 * Record a migration as executed
 */
async function recordMigration(version, checksum, success = true, errorMessage = null) {
  const { error } = await supabase
    .from('schema_migrations')
    .insert({
      version,
      checksum,
      success,
      error_message: errorMessage,
      executed_at: new Date().toISOString()
    });

  if (error) {
    console.warn(`  ⚠️  Could not record migration ${version}: ${error.message}`);
    return false;
  }
  
  return true;
}

/**
 * Generate combined SQL file for manual execution
 */
async function generateCombinedMigrationFile(migrations) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(__dirname, `combined_migrations_${timestamp}.sql`);
  
  let combinedSQL = `-- Combined JTH Migrations
-- Generated: ${new Date().toISOString()}
-- Execute this file in Supabase Dashboard SQL Editor

-- First, create migrations tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

GRANT ALL ON public.schema_migrations TO postgres, anon, authenticated, service_role;

`;

  for (const migration of migrations) {
    const { version, filePath, checksum } = migration;
    const sql = await fs.readFile(filePath, 'utf-8');
    
    combinedSQL += `
-- ============================================
-- Migration: ${version}
-- Checksum: ${checksum}
-- ============================================

-- Check if migration already executed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schema_migrations WHERE version = '${version}'
  ) THEN
    -- Execute migration
${sql}

    -- Record successful execution
    INSERT INTO public.schema_migrations (version, checksum, success)
    VALUES ('${version}', '${checksum}', true);
    
    RAISE NOTICE 'Migration ${version} executed successfully';
  ELSE
    RAISE NOTICE 'Migration ${version} already executed, skipping';
  END IF;
END $$;

`;
  }

  await fs.writeFile(outputPath, combinedSQL);
  return outputPath;
}

/**
 * Main function to deploy all migrations
 */
async function deployMigrations() {
  console.log('🚀 JTH Database Migration Deployment');
  console.log(`📍 Target: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Initialize migrations table
    const tableReady = await initializeMigrationsTable();
    
    if (!tableReady) {
      console.log('');
      console.log('⚠️  Prerequisites not met');
      console.log('');
      console.log('Please follow these steps:');
      console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/nsbybnsmhvviofzfgphb');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Execute the SQL from: create_migrations_table.sql');
      console.log('4. Run this script again');
      console.log('');
      
      // Still generate the combined file for convenience
      const files = await fs.readdir(MIGRATIONS_DIR);
      const migrationFiles = files
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      const migrations = [];
      for (const file of migrationFiles) {
        const version = file.replace('.sql', '');
        const filePath = path.join(MIGRATIONS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const checksum = calculateChecksum(content);
        
        migrations.push({ version, filePath, checksum });
      }
      
      const combinedFile = await generateCombinedMigrationFile(migrations);
      console.log('📦 Alternative: Execute all migrations at once');
      console.log(`   Combined SQL file: ${combinedFile}`);
      console.log('   Copy and paste this file content into SQL Editor');
      
      return;
    }

    // Read all migration files
    const files = await fs.readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);
    console.log('');

    const pendingMigrations = [];
    let skipCount = 0;

    // Check migration status
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      const filePath = path.join(MIGRATIONS_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const checksum = calculateChecksum(content);

      console.log(`📄 ${version}`);

      const { executed, checksum: existingChecksum } = await isMigrationExecuted(version);
      
      if (executed) {
        if (existingChecksum === checksum) {
          console.log(`  ✓ Already executed (checksum match)`);
          skipCount++;
        } else {
          console.log(`  ⚠️  Already executed but checksum differs`);
          console.log(`     Existing: ${existingChecksum}`);
          console.log(`     Current:  ${checksum}`);
          skipCount++;
        }
      } else {
        console.log(`  ⏳ Pending execution`);
        pendingMigrations.push({ version, filePath, checksum });
      }
    }

    console.log('');
    console.log('📊 Migration Status:');
    console.log(`  ✓ Already executed: ${skipCount}`);
    console.log(`  ⏳ Pending: ${pendingMigrations.length}`);
    console.log('');

    if (pendingMigrations.length === 0) {
      console.log('✨ All migrations are up to date!');
      return;
    }

    // Generate SQL file for pending migrations
    console.log('📝 Generating SQL for pending migrations...');
    const sqlFile = await generateCombinedMigrationFile(pendingMigrations);
    
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/nsbybnsmhvviofzfgphb/sql/new');
    console.log(`2. Copy the contents of: ${sqlFile}`);
    console.log('3. Paste into SQL Editor');
    console.log('4. Click "Run" to execute migrations');
    console.log('');
    console.log('The SQL file includes:');
    for (const migration of pendingMigrations) {
      console.log(`  - ${migration.version}`);
    }
    console.log('');
    console.log('Each migration will be automatically tracked and skipped if already executed.');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the deployment
deployMigrations().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});