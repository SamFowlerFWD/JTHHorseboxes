# Database Migration Instructions - J Taylor Horseboxes

## Current Status & Overview

This document provides comprehensive instructions for setting up the database for the J Taylor Horseboxes operations platform. The system is designed to work both with a fully configured database and in fallback mode with mock data.

## Migration Files

1. **005a_fix_leads_and_contracts.sql** - Updates leads table and adds contracts
2. **005b_builds_and_stages.sql** - Creates comprehensive build tracking system
3. **005c_inventory_and_materials.sql** - Adds inventory and materials management
4. **005d_rls_policies.sql** - Sets up Row Level Security policies
5. **005e_triggers_and_data.sql** - Adds triggers and default data

## How to Apply the Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com/project/nsbybnsmhvviofzfgphb
2. Navigate to the SQL Editor (left sidebar)
3. Apply each migration file in order:
   - Copy the contents of `005a_fix_leads_and_contracts.sql`
   - Paste into SQL Editor and click "Run"
   - Verify success (should show green checkmark)
   - Repeat for files 005b through 005e in order

### Option 2: Using Supabase CLI

First, ensure you're logged in:
```bash
npx supabase login
npx supabase link --project-ref nsbybnsmhvviofzfgphb
```

Then apply migrations:
```bash
npx supabase db push
```

### Option 3: Direct PostgreSQL Connection

If you have psql installed:
```bash
# Set connection string
DB_URL="postgresql://postgres.nsbybnsmhvviofzfgphb:[SERVICE_ROLE_KEY]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Apply each migration
psql $DB_URL -f supabase/migrations/005a_fix_leads_and_contracts.sql
psql $DB_URL -f supabase/migrations/005b_builds_and_stages.sql
psql $DB_URL -f supabase/migrations/005c_inventory_and_materials.sql
psql $DB_URL -f supabase/migrations/005d_rls_policies.sql
psql $DB_URL -f supabase/migrations/005e_triggers_and_data.sql
```

## Verification Steps

After applying all migrations, verify the following:

### 1. Check Tables Created
Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these new tables:
- builds
- build_stages
- build_tasks
- build_media
- contracts
- customer_approvals
- customer_updates
- deal_activities
- inventory
- material_requirements
- pipeline_automations
- purchase_orders
- quality_checks
- stage_templates
- suppliers
- bill_of_materials

### 2. Check RLS Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Test Basic Queries
```sql
-- Check stage templates were inserted
SELECT model, COUNT(*) as stage_count 
FROM stage_templates 
GROUP BY model;

-- Check pipeline automations
SELECT * FROM pipeline_automations;
```

## Rollback Instructions

If you need to rollback, use this script:
```sql
-- Drop new tables in reverse order
DROP TABLE IF EXISTS customer_approvals CASCADE;
DROP TABLE IF EXISTS customer_updates CASCADE;
DROP TABLE IF EXISTS quality_checks CASCADE;
DROP TABLE IF EXISTS build_media CASCADE;
DROP TABLE IF EXISTS build_tasks CASCADE;
DROP TABLE IF EXISTS build_stages CASCADE;
DROP TABLE IF EXISTS builds CASCADE;
DROP TABLE IF EXISTS stage_templates CASCADE;
DROP TABLE IF EXISTS material_requirements CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS bill_of_materials CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS pipeline_automations CASCADE;
DROP TABLE IF EXISTS deal_activities CASCADE;

-- Remove added columns from leads
ALTER TABLE leads 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS deal_value,
DROP COLUMN IF EXISTS probability,
DROP COLUMN IF EXISTS expected_close_date,
DROP COLUMN IF EXISTS configurator_snapshot,
DROP COLUMN IF EXISTS contract_id,
DROP COLUMN IF EXISTS build_id,
DROP COLUMN IF EXISTS lost_reason,
DROP COLUMN IF EXISTS competitor,
DROP COLUMN IF EXISTS deposit_status,
DROP COLUMN IF EXISTS contract_status;

-- Remove columns from orders
ALTER TABLE orders
DROP COLUMN IF EXISTS customer_id,
DROP COLUMN IF EXISTS build_id;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS is_staff_member(UUID);

-- Recreate production_jobs table if needed
CREATE TABLE IF NOT EXISTS production_jobs (
    -- ... original schema
);
```

## Troubleshooting

### Common Issues

1. **"relation already exists" error**
   - This is fine if the table was already created
   - Continue with the next migration

2. **"column already exists" error**
   - This means the column was already added
   - Safe to ignore and continue

3. **RLS policy conflicts**
   - Drop the existing policy first:
   ```sql
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   ```

4. **Foreign key violations**
   - Ensure auth.users and profiles tables are properly set up
   - Check that referenced tables exist

## Next Steps

After successful migration:

1. Test the Operations Dashboard at `/ops`
2. Create test builds and verify workflow
3. Test customer portal access
4. Verify RLS policies are working correctly

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the error messages carefully
3. Try applying migrations one at a time
4. Use the rollback script if needed