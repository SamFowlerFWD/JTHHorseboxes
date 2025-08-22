#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📝 Splitting Migrations for Supabase Dashboard');
console.log('==============================================\n');

const migrations = [
  {
    file: 'apps/web/supabase/deploy-migration.sql',
    name: '01_core_tables_and_rls',
    description: 'Core tables, RLS policies, and indexes'
  },
  {
    file: 'supabase/migrations/001_initial_schema.sql',
    name: '02_comprehensive_schema',
    description: 'Sales, Production, and Operations schema'
  },
  {
    file: 'supabase/migrations/002_monday_data_import.sql',
    name: '03_monday_data',
    description: 'Monday.com data import'
  },
  {
    file: 'supabase/migrations/003_vector_search_and_functions.sql',
    name: '04_functions_and_search',
    description: 'Vector search and utility functions'
  },
  {
    file: 'supabase/migrations/004_jth_model_data.sql',
    name: '05_jth_model_data',
    description: 'JTH model specifications and pricing'
  }
];

// Create output directory
const outputDir = path.join(__dirname, 'supabase-migrations-split');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create README with instructions
let readmeContent = `# JTH Supabase Migration Files

## 🚀 Deployment Instructions

### Quick Deploy (All at Once)
1. Open [Supabase SQL Editor](https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql)
2. Copy contents of \`00_COMPLETE_MIGRATION.sql\`
3. Paste and click "Run"

### Sequential Deploy (Recommended if timeout occurs)
Execute each file in order:

`;

let allSQL = '';
const createdFiles = [];

for (const migration of migrations) {
  const filePath = path.join(__dirname, migration.file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const outputFile = `${migration.name}.sql`;
    const outputPath = path.join(outputDir, outputFile);
    
    // Add header to individual file
    const fileContent = `-- ======================================================
-- ${migration.description}
-- File: ${migration.name}
-- Original: ${migration.file}
-- Generated: ${new Date().toISOString()}
-- ======================================================

${content}`;
    
    fs.writeFileSync(outputPath, fileContent);
    createdFiles.push(outputFile);
    
    console.log(`✅ Created: ${outputFile} (${migration.description})`);
    
    // Add to README
    readmeContent += `
### ${migration.name}
- **Description**: ${migration.description}
- **File**: \`${outputFile}\`
- **Original**: \`${migration.file}\`
`;

    // Add to complete SQL
    allSQL += fileContent + '\n\n';
  } else {
    console.log(`⚠️  Skipped: ${migration.file} (not found)`);
  }
}

// Write complete migration
const completePath = path.join(outputDir, '00_COMPLETE_MIGRATION.sql');
fs.writeFileSync(completePath, allSQL);
console.log(`\n✅ Created: 00_COMPLETE_MIGRATION.sql (All migrations combined)`);

// Add execution checklist to README
readmeContent += `
## ✅ Execution Checklist

After running each migration, verify:

- [ ] **01_core_tables_and_rls.sql**
  - Tables: leads, blog_posts, pricing_options, knowledge_base, saved_configurations
  - RLS policies are enabled
  - Indexes are created

- [ ] **02_comprehensive_schema.sql**
  - Tables: users, organizations, contacts, addresses, deals, activities
  - Production tracking tables
  - Inventory management tables

- [ ] **03_monday_data.sql**
  - Sample Monday.com data imported
  - Leads and deals populated

- [ ] **04_functions_and_search.sql**
  - Vector search functions created
  - Utility functions available
  - Triggers active

- [ ] **05_jth_model_data.sql**
  - JTH model specifications (3.5t, 4.5t, 7.2t)
  - Pricing data populated
  - Sample configurations

## 🔍 Verification Queries

After deployment, run these queries to verify:

\`\`\`sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check sample data
SELECT COUNT(*) as lead_count FROM leads;
SELECT COUNT(*) as model_count FROM jth_models;
SELECT COUNT(*) as pricing_count FROM pricing_options;
\`\`\`

## ⚠️ Troubleshooting

If you encounter errors:

1. **"relation already exists"** - Table already created, safe to ignore
2. **"permission denied"** - Ensure using service role key
3. **Timeout** - Split the file and run in smaller chunks
4. **Vector extension error** - Enable in Supabase Dashboard > Database > Extensions

## 📊 Expected Results

After successful deployment:
- **30+ tables** created
- **RLS policies** active on all tables
- **Sample data** for testing
- **Vector search** enabled for knowledge base
- **JTH models** with accurate specifications
`;

// Write README
const readmePath = path.join(outputDir, 'README.md');
fs.writeFileSync(readmePath, readmeContent);

console.log('\n==============================================');
console.log('📊 Migration Split Complete!');
console.log('==============================================');
console.log(`📁 Output directory: ${outputDir}`);
console.log(`📄 Files created: ${createdFiles.length + 2}`);
console.log('\n📋 Files:');
console.log('   - README.md (Instructions and checklist)');
console.log('   - 00_COMPLETE_MIGRATION.sql (All in one)');
createdFiles.forEach(f => console.log(`   - ${f}`));
console.log('\n🚀 Next Steps:');
console.log('   1. Open the README.md for detailed instructions');
console.log('   2. Navigate to Supabase SQL Editor');
console.log('   3. Execute migrations in order or all at once');
console.log('==============================================\n');