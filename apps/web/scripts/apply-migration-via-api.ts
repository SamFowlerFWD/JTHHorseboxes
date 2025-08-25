#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigration() {
  console.log('🚀 Applying JTH Operations Migration via API...\n')
  
  // Read the QUICK_FIX migration
  const quickFixPath = path.join(__dirname, '../supabase/migrations/QUICK_FIX.sql')
  const combinedPath = path.join(__dirname, '../supabase/migrations/COMBINED_OPERATIONS_MIGRATION.sql')
  
  // Try the quick fix first
  const sqlToApply = fs.readFileSync(quickFixPath, 'utf8')
  
  console.log('📤 Applying migration to Supabase...')
  console.log('   URL:', SUPABASE_URL)
  console.log('   Using service role key\n')
  
  // Split SQL into individual statements
  const statements = sqlToApply
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`📝 Found ${statements.length} SQL statements to execute\n`)
  
  // Unfortunately, Supabase doesn't expose a direct SQL execution endpoint
  // We need to use the Dashboard or a database connection
  
  console.log('⚠️  MANUAL STEP REQUIRED:')
  console.log('========================\n')
  console.log('Supabase does not allow direct SQL execution via REST API.')
  console.log('Please follow these steps:\n')
  console.log('1. Click this link to open the SQL Editor:')
  console.log(`   https://app.supabase.com/project/nsbybnsmhvviofzfgphb/sql/new\n`)
  console.log('2. Copy the SQL below and paste it into the editor:\n')
  console.log('```sql')
  console.log(sqlToApply)
  console.log('```\n')
  console.log('3. Click "Run" to execute the migration\n')
  console.log('4. After completion, the Operations Platform will be ready!\n')
  
  // Also save a web-ready version
  const webReadyPath = path.join(__dirname, '../APPLY_THIS_MIGRATION.sql')
  fs.writeFileSync(webReadyPath, sqlToApply)
  console.log(`💾 Migration saved to: ${webReadyPath}`)
  
  // Create an HTML file that can be opened directly
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>JTH Operations Migration</title>
  <style>
    body { font-family: system-ui; padding: 20px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    .sql { background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto; }
    pre { margin: 0; white-space: pre-wrap; }
    .button { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .step { margin: 20px 0; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; }
  </style>
</head>
<body>
  <h1>🚀 JTH Operations Platform - Database Migration</h1>
  
  <div class="step">
    <h2>Step 1: Open Supabase SQL Editor</h2>
    <a href="https://app.supabase.com/project/nsbybnsmhvviofzfgphb/sql/new" target="_blank" class="button">
      Open SQL Editor →
    </a>
  </div>
  
  <div class="step">
    <h2>Step 2: Copy this SQL</h2>
    <div class="sql">
      <pre>${sqlToApply.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  </div>
  
  <div class="step">
    <h2>Step 3: Paste and Run</h2>
    <p>Paste the SQL above into the Supabase SQL Editor and click "Run"</p>
  </div>
  
  <div class="step">
    <h2>Step 4: Test</h2>
    <p>After running the migration, test the Operations Platform:</p>
    <a href="http://localhost:3000/ops" target="_blank" class="button">
      Open Operations Dashboard →
    </a>
  </div>
</body>
</html>`
  
  const htmlPath = path.join(__dirname, '../MIGRATION_GUIDE.html')
  fs.writeFileSync(htmlPath, htmlContent)
  console.log(`\n🌐 Migration guide saved to: ${htmlPath}`)
  console.log('   Open this file in your browser for a better experience!')
}

applyMigration().catch(console.error)