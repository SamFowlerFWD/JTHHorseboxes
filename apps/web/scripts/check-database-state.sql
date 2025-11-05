-- =====================================================
-- DATABASE STATE CHECK SCRIPT
-- =====================================================
-- Run this to see the current state of your database
-- =====================================================

-- Check what tables exist
SELECT 
    'Existing Tables' as check_type,
    tablename as name,
    CASE 
        WHEN tablename IN ('customers', 'customer_orders', 'customer_communications', 
                          'inventory', 'inventory_changelog', 'profiles', 
                          'auth_audit_log', 'leads', 'quotes')
        THEN '✓ Expected'
        ELSE '? Other'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if auth schema exists and what's in it
SELECT 
    'Auth Schema Functions' as check_type,
    proname as name,
    CASE 
        WHEN proname IN ('is_admin', 'user_role', 'has_permission')
        THEN '✓ Expected'
        ELSE '? Other'
    END as status
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
AND proname IN ('is_admin', 'user_role', 'has_permission', 'uid', 'jwt');

-- Check for key columns in customers table (if it exists)
SELECT 
    'Customers Table Columns' as check_type,
    column_name as name,
    data_type as status
FROM information_schema.columns
WHERE table_name = 'customers'
AND table_schema = 'public'
ORDER BY ordinal_position
LIMIT 10;

-- Check for RLS policies
SELECT 
    'RLS Policies' as check_type,
    tablename || ': ' || policyname as name,
    CASE 
        WHEN polcmd = 'r' THEN 'SELECT'
        WHEN polcmd = 'a' THEN 'INSERT'
        WHEN polcmd = 'w' THEN 'UPDATE'
        WHEN polcmd = 'd' THEN 'DELETE'
        WHEN polcmd = '*' THEN 'ALL'
        ELSE 'UNKNOWN'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('customers', 'customer_orders', 'customer_communications', 
                  'inventory', 'inventory_changelog', 'profiles', 'auth_audit_log')
ORDER BY tablename, policyname
LIMIT 20;

-- Check if RLS is enabled on key tables
SELECT 
    'RLS Enabled Status' as check_type,
    tablename as name,
    CASE 
        WHEN rowsecurity THEN '✓ Enabled'
        ELSE '✗ Disabled'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('customers', 'customer_orders', 'customer_communications', 
                  'inventory', 'inventory_changelog', 'profiles', 'auth_audit_log');

-- Check for triggers
SELECT 
    'Triggers' as check_type,
    tgname || ' on ' || c.relname as name,
    '✓ Active' as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND NOT tgisinternal
ORDER BY c.relname, tgname
LIMIT 20;

-- Count records in key tables
SELECT 
    'Record Counts' as check_type,
    'customers' as name,
    COUNT(*)::text || ' records' as status
FROM customers
UNION ALL
SELECT 
    'Record Counts' as check_type,
    'inventory' as name,
    COUNT(*)::text || ' records' as status
FROM inventory
WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'inventory')
UNION ALL
SELECT 
    'Record Counts' as check_type,
    'profiles' as name,
    COUNT(*)::text || ' records' as status
FROM profiles
WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles');

-- Summary
SELECT 
    '=== SUMMARY ===' as check_type,
    'Database Check Complete' as name,
    'Review results above' as status;