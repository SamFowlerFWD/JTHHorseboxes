#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function applyMigrations() {
  console.log('🚀 Applying JTH Operations Platform Migrations')
  console.log('==============================================\n')
  
  // Read the quick fix migration
  const quickFixPath = path.join(__dirname, '../supabase/migrations/QUICK_FIX.sql')
  const quickFixSql = fs.readFileSync(quickFixPath, 'utf8')
  
  // Parse SQL statements
  const statements = quickFixSql
    .split(/;(?=\s*(?:--|ALTER|CREATE|INSERT|UPDATE|DELETE|DROP|$))/gi)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^--.*$/gm))
  
  console.log(`📝 Processing ${statements.length} SQL statements...\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim()
    if (!statement || statement.startsWith('--')) continue
    
    // Extract a short description
    const desc = statement.substring(0, 50).replace(/\n/g, ' ') + '...'
    process.stdout.write(`[${i + 1}/${statements.length}] ${desc}`)
    
    try {
      // For ALTER TABLE statements
      if (statement.toUpperCase().includes('ALTER TABLE')) {
        // We can't execute raw SQL directly, but we can check if columns exist
        // and skip if they do
        process.stdout.write(' ⏭️  (ALTER statement - manual execution required)\n')
        errorCount++
        continue
      }
      
      // For CREATE TABLE statements, we can try to create via Supabase
      if (statement.toUpperCase().includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1]
        if (tableName) {
          // Check if table exists
          const { error } = await supabase.from(tableName).select('*').limit(0)
          if (!error) {
            process.stdout.write(` ✅ (table '${tableName}' already exists)\n`)
            successCount++
          } else {
            process.stdout.write(` ⏭️  (needs manual creation)\n`)
            errorCount++
          }
        }
        continue
      }
      
      process.stdout.write(' ⏭️  (requires manual execution)\n')
      errorCount++
      
    } catch (error: any) {
      process.stdout.write(` ❌ ${error.message}\n`)
      errorCount++
    }
  }
  
  console.log('\n==============================================')
  console.log(`✅ Checked: ${successCount}`)
  console.log(`⏭️  Requires manual execution: ${errorCount}`)
  
  if (errorCount > 0) {
    console.log('\n⚠️  MANUAL ACTION REQUIRED:')
    console.log('============================\n')
    console.log('Some statements require manual execution in Supabase SQL Editor.')
    console.log('\n1. Open the SQL Editor:')
    console.log('   https://app.supabase.com/project/nsbybnsmhvviofzfgphb/sql/new\n')
    console.log('2. Copy and paste the contents of:')
    console.log(`   ${quickFixPath}\n`)
    console.log('3. Click "Run" to execute\n')
    console.log('4. Test the Operations Platform:')
    console.log('   http://localhost:3000/ops\n')
    
    // Create a consolidated migration file
    const consolidatedPath = path.join(__dirname, '../RUN_THIS_MIGRATION_NOW.sql')
    
    // Combine quick fix with additional setup
    const fullMigration = `-- JTH OPERATIONS PLATFORM - ESSENTIAL MIGRATION
-- Run this in Supabase SQL Editor
-- ==============================================

${quickFixSql}

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (allow authenticated users to read)
CREATE POLICY "Allow authenticated read" ON contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON builds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON build_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON inventory FOR SELECT TO authenticated USING (true);

-- Insert some test data
INSERT INTO inventory (part_code, description, quantity_on_hand, reorder_point, unit_price)
VALUES 
  ('CHASSIS-35T', '3.5 Tonne Chassis', 5, 2, 15000.00),
  ('DOOR-STD', 'Standard Door Unit', 12, 5, 850.00),
  ('WINDOW-SIDE', 'Side Window', 8, 4, 320.00)
ON CONFLICT (part_code) DO NOTHING;

-- Create a test build
INSERT INTO builds (build_number, model, status, scheduled_start, scheduled_end)
VALUES ('JTH-2025-TEST', 'Professional 35', 'in_progress', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT (build_number) DO NOTHING;

-- Success message
SELECT 'Migration completed successfully!' as status;
`
    
    fs.writeFileSync(consolidatedPath, fullMigration)
    console.log(`💾 Complete migration saved to:`)
    console.log(`   ${consolidatedPath}`)
    console.log(`\n✨ Copy the contents of this file and run in Supabase!`)
  } else {
    console.log('\n✅ All checks passed! Testing application...')
    
    // Test the application
    const { data: leads } = await supabase.from('leads').select('stage').limit(1)
    if (leads) {
      console.log('\n🎉 SUCCESS! The Operations Platform is ready!')
      console.log('\n🌐 Open: http://localhost:3000/ops')
    }
  }
}

applyMigrations().catch(console.error)