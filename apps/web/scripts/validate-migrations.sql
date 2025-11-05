-- =====================================================
-- MIGRATION VALIDATION SCRIPT
-- =====================================================
-- Run this script after deploying migrations to validate
-- that everything is working correctly
-- =====================================================

-- =====================================================
-- SECTION 1: TABLE STRUCTURE VALIDATION
-- =====================================================
\echo '========================================';
\echo 'VALIDATING TABLE STRUCTURES';
\echo '========================================';

-- Check customers table columns
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Check inventory table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'inventory'
ORDER BY ordinal_position;

-- Check profiles table enhanced columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('department', 'is_active', 'locked_until', 'failed_login_attempts', 'last_login_at', 'last_activity_at')
ORDER BY column_name;

-- =====================================================
-- SECTION 2: FUNCTION TESTING
-- =====================================================
\echo '';
\echo '========================================';
\echo 'TESTING FUNCTIONS';
\echo '========================================';

-- Test handle_failed_login function
DO $$
DECLARE
    v_test_email VARCHAR := 'test.failed@example.com';
BEGIN
    -- First create a test user and profile
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000001', v_test_email)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO profiles (id, email, full_name, role) 
    VALUES ('00000000-0000-0000-0000-000000000001', v_test_email, 'Test User', 'viewer')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    
    -- Test the function
    PERFORM handle_failed_login(v_test_email, '192.168.1.1'::INET, 'Test User Agent');
    
    -- Check if it worked
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '00000000-0000-0000-0000-000000000001' 
        AND failed_login_attempts = 1
    ) THEN
        RAISE NOTICE '✓ handle_failed_login function works correctly';
    ELSE
        RAISE WARNING '✗ handle_failed_login function failed';
    END IF;
    
    -- Clean up
    DELETE FROM auth_audit_log WHERE email = v_test_email;
    DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';
    DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing handle_failed_login: %', SQLERRM;
END $$;

-- Test handle_user_login function
DO $$
BEGIN
    -- Create test user
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000002', 'test.success@example.com')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO profiles (id, email, full_name, role, failed_login_attempts) 
    VALUES ('00000000-0000-0000-0000-000000000002', 'test.success@example.com', 'Test User', 'viewer', 3)
    ON CONFLICT (id) DO UPDATE SET failed_login_attempts = 3;
    
    -- Test the function
    PERFORM handle_user_login('00000000-0000-0000-0000-000000000002', '192.168.1.1'::INET, 'Test User Agent');
    
    -- Check if it worked
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '00000000-0000-0000-0000-000000000002' 
        AND failed_login_attempts = 0
        AND last_login_at IS NOT NULL
    ) THEN
        RAISE NOTICE '✓ handle_user_login function works correctly';
    ELSE
        RAISE WARNING '✗ handle_user_login function failed';
    END IF;
    
    -- Clean up
    DELETE FROM auth_audit_log WHERE user_id = '00000000-0000-0000-0000-000000000002';
    DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000002';
    DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing handle_user_login: %', SQLERRM;
END $$;

-- Test adjust_inventory_stock function
DO $$
DECLARE
    v_test_id UUID;
    v_original_stock DECIMAL;
    v_new_stock DECIMAL;
BEGIN
    -- Get an inventory item to test with
    SELECT id, current_stock INTO v_test_id, v_original_stock
    FROM inventory
    LIMIT 1;
    
    IF v_test_id IS NOT NULL THEN
        -- Adjust stock by +5
        PERFORM adjust_inventory_stock(v_test_id, 5, 'Test adjustment', auth.uid());
        
        -- Check new stock level
        SELECT current_stock INTO v_new_stock
        FROM inventory
        WHERE id = v_test_id;
        
        IF v_new_stock = v_original_stock + 5 THEN
            RAISE NOTICE '✓ adjust_inventory_stock function works correctly';
            
            -- Restore original stock
            PERFORM adjust_inventory_stock(v_test_id, -5, 'Restore original', auth.uid());
            
            -- Clean up test movements
            DELETE FROM inventory_movements 
            WHERE inventory_id = v_test_id 
            AND reason IN ('Test adjustment', 'Restore original');
        ELSE
            RAISE WARNING '✗ adjust_inventory_stock function failed';
        END IF;
    ELSE
        RAISE WARNING '✗ No inventory items to test with';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing adjust_inventory_stock: %', SQLERRM;
END $$;

-- Test search_customers function
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM search_customers('Thompson');
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ search_customers function works correctly (found % results)', v_count;
    ELSE
        -- Try another search
        SELECT COUNT(*) INTO v_count
        FROM search_customers('example.com');
        
        IF v_count > 0 THEN
            RAISE NOTICE '✓ search_customers function works correctly (found % results)', v_count;
        ELSE
            RAISE WARNING '✗ search_customers function returned no results';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing search_customers: %', SQLERRM;
END $$;

-- =====================================================
-- SECTION 3: TRIGGER TESTING
-- =====================================================
\echo '';
\echo '========================================';
\echo 'TESTING TRIGGERS';
\echo '========================================';

-- Test inventory status trigger
DO $$
DECLARE
    v_test_id UUID;
    v_status VARCHAR;
BEGIN
    -- Create a test inventory item
    INSERT INTO inventory (
        part_number, name, current_stock, min_stock, max_stock, reorder_point
    ) VALUES (
        'TEST-001', 'Test Item', 0, 5, 100, 10
    ) RETURNING id INTO v_test_id;
    
    -- Check status for out of stock
    SELECT status INTO v_status FROM inventory WHERE id = v_test_id;
    IF v_status = 'out_of_stock' THEN
        RAISE NOTICE '✓ Inventory status trigger works for out_of_stock';
    ELSE
        RAISE WARNING '✗ Inventory status trigger failed for out_of_stock (got: %)', v_status;
    END IF;
    
    -- Update to critical level
    UPDATE inventory SET current_stock = 3 WHERE id = v_test_id;
    SELECT status INTO v_status FROM inventory WHERE id = v_test_id;
    IF v_status = 'critical' THEN
        RAISE NOTICE '✓ Inventory status trigger works for critical';
    ELSE
        RAISE WARNING '✗ Inventory status trigger failed for critical (got: %)', v_status;
    END IF;
    
    -- Clean up
    DELETE FROM inventory WHERE id = v_test_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing inventory status trigger: %', SQLERRM;
END $$;

-- Test updated_at trigger
DO $$
DECLARE
    v_test_id UUID;
    v_original_updated TIMESTAMPTZ;
    v_new_updated TIMESTAMPTZ;
BEGIN
    -- Get a customer to test with
    SELECT id, updated_at INTO v_test_id, v_original_updated
    FROM customers
    LIMIT 1;
    
    IF v_test_id IS NOT NULL THEN
        -- Wait a moment to ensure timestamp difference
        PERFORM pg_sleep(0.1);
        
        -- Update the customer
        UPDATE customers SET notes = 'Updated for trigger test' WHERE id = v_test_id;
        
        -- Check if updated_at changed
        SELECT updated_at INTO v_new_updated FROM customers WHERE id = v_test_id;
        
        IF v_new_updated > v_original_updated THEN
            RAISE NOTICE '✓ updated_at trigger works correctly';
        ELSE
            RAISE WARNING '✗ updated_at trigger failed';
        END IF;
    ELSE
        RAISE WARNING '✗ No customers to test trigger with';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing updated_at trigger: %', SQLERRM;
END $$;

-- =====================================================
-- SECTION 4: RLS POLICY TESTING
-- =====================================================
\echo '';
\echo '========================================';
\echo 'CHECKING RLS POLICIES';
\echo '========================================';

-- List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory', 'inventory_movements', 'profiles')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory', 'inventory_movements', 'profiles')
ORDER BY tablename;

-- =====================================================
-- SECTION 5: DATA INTEGRITY CHECKS
-- =====================================================
\echo '';
\echo '========================================';
\echo 'DATA INTEGRITY CHECKS';
\echo '========================================';

-- Check for orphaned customer communications
SELECT COUNT(*) as orphaned_communications
FROM customer_communications cc
LEFT JOIN customers c ON cc.customer_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned customer orders
SELECT COUNT(*) as orphaned_orders
FROM customer_orders co
LEFT JOIN customers c ON co.customer_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned inventory movements
SELECT COUNT(*) as orphaned_movements
FROM inventory_movements im
LEFT JOIN inventory i ON im.inventory_id = i.id
WHERE i.id IS NULL;

-- Check for invalid customer statuses
SELECT COUNT(*) as invalid_customer_statuses
FROM customers
WHERE status NOT IN ('active', 'inactive', 'prospect');

-- Check for invalid inventory statuses
SELECT COUNT(*) as invalid_inventory_statuses
FROM inventory
WHERE status NOT IN ('in_stock', 'critical', 'reorder', 'out_of_stock', 'overstocked');

-- =====================================================
-- SECTION 6: PERFORMANCE CHECKS
-- =====================================================
\echo '';
\echo '========================================';
\echo 'PERFORMANCE CHECKS';
\echo '========================================';

-- List all indexes and their sizes
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory', 'inventory_movements', 'profiles')
ORDER BY tablename, indexname;

-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory', 'inventory_movements', 'profiles')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- SECTION 7: SUMMARY REPORT
-- =====================================================
\echo '';
\echo '========================================';
\echo 'SUMMARY REPORT';
\echo '========================================';

-- Count records in each table
SELECT 
    'customers' as table_name, 
    COUNT(*) as record_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM customers
UNION ALL
SELECT 
    'inventory', 
    COUNT(*),
    COUNT(CASE WHEN status = 'in_stock' THEN 1 END)
FROM inventory
UNION ALL
SELECT 
    'customer_communications', 
    COUNT(*),
    NULL
FROM customer_communications
UNION ALL
SELECT 
    'customer_orders', 
    COUNT(*),
    COUNT(CASE WHEN status = 'completed' THEN 1 END)
FROM customer_orders
UNION ALL
SELECT 
    'inventory_movements', 
    COUNT(*),
    NULL
FROM inventory_movements
UNION ALL
SELECT 
    'auth_audit_log', 
    COUNT(*),
    COUNT(CASE WHEN success = true THEN 1 END)
FROM auth_audit_log
ORDER BY table_name;

-- Check customer statistics
SELECT 
    COUNT(DISTINCT customer_type) as customer_types,
    COUNT(DISTINCT status) as statuses,
    AVG(total_value) as avg_customer_value,
    MAX(total_value) as max_customer_value,
    SUM(total_orders) as total_orders_all_customers
FROM customers;

-- Check inventory statistics
SELECT 
    COUNT(DISTINCT category) as categories,
    COUNT(CASE WHEN current_stock <= min_stock THEN 1 END) as items_below_min,
    COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_items,
    COUNT(CASE WHEN current_stock >= max_stock THEN 1 END) as overstocked_items
FROM inventory;

\echo '';
\echo '========================================';
\echo 'VALIDATION COMPLETE';
\echo '========================================';
\echo 'Review the output above for any warnings or errors.';
\echo 'All functions marked with ✓ are working correctly.';
\echo 'Items marked with ✗ require attention.';