#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📝 Preparing Combined Migration for Supabase Dashboard');
console.log('====================================================\n');

const migrations = [
  {
    file: 'apps/web/supabase/deploy-migration.sql',
    description: 'Main deployment migration (Core tables, RLS, indexes)'
  },
  {
    file: 'supabase/migrations/001_initial_schema.sql',
    description: 'Comprehensive schema (Operations, Sales, Production)'
  },
  {
    file: 'supabase/migrations/002_monday_data_import.sql',
    description: 'Monday.com data import'
  },
  {
    file: 'supabase/migrations/003_vector_search_and_functions.sql',
    description: 'Vector search and utility functions'
  },
  {
    file: 'supabase/migrations/004_jth_model_data.sql',
    description: 'JTH model specifications and sample data'
  }
];

let combinedSQL = `-- ======================================================
-- JTH Complete Database Migration
-- Generated: ${new Date().toISOString()}
-- ======================================================
-- 
-- This file contains all migrations for the JTH platform.
-- Execute this in Supabase Dashboard SQL Editor.
-- ======================================================

`;

let includedFiles = [];
let missingFiles = [];

for (const migration of migrations) {
  const filePath = path.join(__dirname, migration.file);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ Including: ${migration.description}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    combinedSQL += `
-- ======================================================
-- ${migration.description}
-- Source: ${migration.file}
-- ======================================================

${content}

`;
    includedFiles.push(migration.description);
  } else {
    console.log(`⚠️  Missing: ${migration.file}`);
    missingFiles.push(migration.file);
  }
}

// Write combined file
const outputPath = path.join(__dirname, 'COMPLETE_MIGRATION.sql');
fs.writeFileSync(outputPath, combinedSQL);

console.log('\n====================================================');
console.log('📊 Summary:');
console.log(`   ✅ Files included: ${includedFiles.length}`);
console.log(`   ⚠️  Files missing: ${missingFiles.length}`);
console.log(`\n📁 Output file: ${outputPath}`);
console.log('\n🚀 Next Steps:');
console.log('   1. Open Supabase Dashboard: https://nsbybnsmhvviofzfgphb.supabase.co');
console.log('   2. Navigate to SQL Editor');
console.log('   3. Create a new query');
console.log('   4. Copy and paste the contents of COMPLETE_MIGRATION.sql');
console.log('   5. Click "Run" to execute');
console.log('\n⚠️  Important: The migration is large. You may need to:');
console.log('   - Split it into smaller chunks if it times out');
console.log('   - Run each migration file separately');
console.log('====================================================\n');