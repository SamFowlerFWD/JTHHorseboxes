
-- VERIFY JTH OPERATIONS MIGRATION
-- Run this after applying the migration to verify success

-- Check tables exist
SELECT table_name, 
       CASE WHEN table_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'leads', 'contracts', 'deal_activities', 'pipeline_automations',
    'builds', 'build_stages', 'build_tasks', 'build_media',
    'inventory', 'suppliers', 'purchase_orders',
    'customer_updates', 'quality_checks'
  )
ORDER BY table_name;

-- Check critical columns on leads table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name IN ('stage', 'deal_value', 'configurator_snapshot', 'user_id')
ORDER BY column_name;

-- Count rows in key tables
SELECT 'leads' as table_name, COUNT(*) as row_count FROM leads
UNION ALL
SELECT 'builds', COUNT(*) FROM builds
UNION ALL  
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'stage_templates', COUNT(*) FROM stage_templates;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('leads', 'builds', 'contracts', 'inventory')
ORDER BY tablename;
