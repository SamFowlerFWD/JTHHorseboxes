# JTH Supabase Migration Files

## 🚀 Deployment Instructions

### Quick Deploy (All at Once)
1. Open [Supabase SQL Editor](https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql)
2. Copy contents of `00_COMPLETE_MIGRATION.sql`
3. Paste and click "Run"

### Sequential Deploy (Recommended if timeout occurs)
Execute each file in order:


### 01_core_tables_and_rls
- **Description**: Core tables, RLS policies, and indexes
- **File**: `01_core_tables_and_rls.sql`
- **Original**: `apps/web/supabase/deploy-migration.sql`

### 02_comprehensive_schema
- **Description**: Sales, Production, and Operations schema
- **File**: `02_comprehensive_schema.sql`
- **Original**: `supabase/migrations/001_initial_schema.sql`

### 03_monday_data
- **Description**: Monday.com data import
- **File**: `03_monday_data.sql`
- **Original**: `supabase/migrations/002_monday_data_import.sql`

### 04_functions_and_search
- **Description**: Vector search and utility functions
- **File**: `04_functions_and_search.sql`
- **Original**: `supabase/migrations/003_vector_search_and_functions.sql`

### 05_jth_model_data
- **Description**: JTH model specifications and pricing
- **File**: `05_jth_model_data.sql`
- **Original**: `supabase/migrations/004_jth_model_data.sql`

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

```sql
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
```

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
