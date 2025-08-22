-- JTH Database Deployment Verification Script
-- ============================================
-- Run this script after deployment to verify everything is working

-- 1. CHECK EXTENSIONS
-- ===================
SELECT 
    extname as extension,
    CASE 
        WHEN extname IN ('uuid-ossp', 'vector', 'pg_trgm') THEN '✅ Required'
        ELSE '📦 Optional'
    END as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'vector', 'pg_trgm', 'pgcrypto')
ORDER BY extname;

-- 2. CHECK CORE TABLES
-- ====================
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'users', 'organizations', 'contacts', 'addresses',
        'product_models', 'product_options', 'model_options',
        'leads', 'quotes', 'quote_items', 'orders',
        'production_jobs', 'production_stages', 'quality_checks',
        'inventory_items', 'stock_movements',
        'portal_access', 'build_updates',
        'kb_categories', 'kb_articles', 'kb_embeddings', 'faqs',
        'warranties', 'chatbot_conversations', 'activity_logs',
        'system_settings'
    ]) as table_name
)
SELECT 
    et.table_name,
    CASE 
        WHEN t.tablename IS NOT NULL THEN '✅ Created'
        ELSE '❌ Missing'
    END as status,
    COALESCE(
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = et.table_name), 0
    ) as column_count
FROM expected_tables et
LEFT JOIN pg_tables t ON t.tablename = et.table_name AND t.schemaname = 'public'
ORDER BY 
    CASE WHEN t.tablename IS NULL THEN 0 ELSE 1 END DESC,
    et.table_name;

-- 3. CHECK PRODUCT MODELS
-- =======================
SELECT 
    category,
    COUNT(*) as model_count,
    MIN(base_price) as min_price,
    MAX(base_price) as max_price,
    STRING_AGG(name, ', ' ORDER BY base_price) as models
FROM product_models
WHERE is_active = true
GROUP BY category
ORDER BY 
    CASE category 
        WHEN '3.5t' THEN 1 
        WHEN '4.5t' THEN 2 
        WHEN '7.2t' THEN 3 
    END;

-- 4. CHECK ROW LEVEL SECURITY
-- ===========================
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '⚠️ Disabled'
    END as rls_status,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'organizations', 'contacts', 'leads', 'quotes', 
        'orders', 'production_jobs', 'portal_access', 'build_updates'
    )
ORDER BY 
    CASE WHEN rowsecurity THEN 1 ELSE 0 END DESC,
    tablename;

-- 5. CHECK FUNCTIONS
-- ==================
SELECT 
    routine_name as function_name,
    CASE 
        WHEN routine_name IN (
            'search_kb_articles', 'search_faqs', 'calculate_lead_score',
            'get_production_timeline', 'check_inventory_levels',
            'convert_quote_to_order', 'get_next_build_slot'
        ) THEN '✅ Core Function'
        ELSE '📦 Helper Function'
    END as type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pgp_%'
    AND routine_name NOT LIKE 'armor%'
    AND routine_name NOT LIKE 'crypt%'
    AND routine_name NOT LIKE 'gen_%'
ORDER BY 
    CASE 
        WHEN routine_name LIKE 'search_%' THEN 1
        WHEN routine_name LIKE 'calculate_%' THEN 2
        WHEN routine_name LIKE 'get_%' THEN 3
        ELSE 4
    END,
    routine_name;

-- 6. CHECK VIEWS
-- =============
SELECT 
    table_name as view_name,
    CASE 
        WHEN table_name LIKE 'v_sales_%' THEN '💰 Sales'
        WHEN table_name LIKE 'v_production_%' THEN '🏭 Production'
        WHEN table_name LIKE 'v_customer_%' THEN '👤 Customer'
        WHEN table_name LIKE 'v_inventory_%' THEN '📦 Inventory'
        ELSE '📊 Other'
    END as category
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY category, view_name;

-- 7. CHECK INDEXES
-- ================
SELECT 
    schemaname,
    tablename,
    COUNT(*) as index_count,
    STRING_AGG(indexname, ', ' ORDER BY indexname) as indexes
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('leads', 'quotes', 'orders', 'production_jobs', 'kb_articles')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 8. CHECK KNOWLEDGE BASE CONTENT
-- ===============================
SELECT 
    'Knowledge Base Articles' as content_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published_count,
    SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as featured_count
FROM kb_articles
UNION ALL
SELECT 
    'FAQs' as content_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published_count,
    0 as featured_count
FROM faqs
UNION ALL
SELECT 
    'KB Categories' as content_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as published_count,
    0 as featured_count
FROM kb_categories;

-- 9. CHECK SAMPLE DATA
-- ===================
WITH data_summary AS (
    SELECT 'Users' as entity, COUNT(*) as count FROM users
    UNION ALL
    SELECT 'Organizations', COUNT(*) FROM organizations
    UNION ALL
    SELECT 'Contacts', COUNT(*) FROM contacts
    UNION ALL
    SELECT 'Product Models', COUNT(*) FROM product_models WHERE is_active = true
    UNION ALL
    SELECT 'Product Options', COUNT(*) FROM product_options WHERE is_active = true
    UNION ALL
    SELECT 'Leads', COUNT(*) FROM leads
    UNION ALL
    SELECT 'Quotes', COUNT(*) FROM quotes
    UNION ALL
    SELECT 'Orders', COUNT(*) FROM orders
    UNION ALL
    SELECT 'Production Jobs', COUNT(*) FROM production_jobs
    UNION ALL
    SELECT 'KB Articles', COUNT(*) FROM kb_articles WHERE is_published = true
    UNION ALL
    SELECT 'FAQs', COUNT(*) FROM faqs WHERE is_published = true
)
SELECT 
    entity,
    count,
    CASE 
        WHEN count > 0 THEN '✅ Has Data'
        ELSE '⚠️ Empty'
    END as status
FROM data_summary
ORDER BY 
    CASE WHEN count > 0 THEN 0 ELSE 1 END,
    entity;

-- 10. TEST CORE FUNCTIONS
-- =======================
DO $$
DECLARE
    test_result RECORD;
    test_count INTEGER := 0;
    success_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== FUNCTION TESTS ===';
    
    -- Test 1: FAQ Search
    BEGIN
        SELECT COUNT(*) INTO test_count 
        FROM search_faqs('warranty', 5);
        
        IF test_count > 0 THEN
            RAISE NOTICE '✅ FAQ search working (% results)', test_count;
            success_count := success_count + 1;
        ELSE
            RAISE NOTICE '⚠️ FAQ search returned no results';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ FAQ search failed: %', SQLERRM;
    END;
    
    -- Test 2: Lead Scoring
    BEGIN
        SELECT calculate_lead_score(id) INTO test_count
        FROM leads
        LIMIT 1;
        
        IF test_count IS NOT NULL THEN
            RAISE NOTICE '✅ Lead scoring working (score: %)', test_count;
            success_count := success_count + 1;
        ELSE
            RAISE NOTICE '⚠️ Lead scoring returned null';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Lead scoring failed: %', SQLERRM;
    END;
    
    -- Test 3: Inventory Check
    BEGIN
        SELECT COUNT(*) INTO test_count
        FROM check_inventory_levels();
        
        RAISE NOTICE '✅ Inventory check working (% alerts)', test_count;
        success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Inventory check failed: %', SQLERRM;
    END;
    
    -- Test 4: Order Number Generation
    BEGIN
        SELECT generate_order_number() INTO test_result;
        
        IF test_result IS NOT NULL THEN
            RAISE NOTICE '✅ Order number generation working';
            success_count := success_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Order number generation failed: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Function Tests: %/4 passed', success_count;
END $$;

-- 11. CHECK TRIGGERS
-- ==================
SELECT 
    trigger_name,
    event_object_table as table_name,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN '🕐 Timestamp'
        WHEN trigger_name LIKE '%audit%' THEN '📝 Audit'
        WHEN trigger_name LIKE '%calculate%' THEN '🧮 Calculation'
        ELSE '⚙️ Other'
    END as trigger_type,
    event_manipulation as events
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_type, table_name, trigger_name;

-- 12. SUMMARY REPORT
-- ==================
SELECT 
    '=' as "=",
    'DEPLOYMENT VERIFICATION COMPLETE' as status,
    '=' as "=="
UNION ALL
SELECT 
    '',
    'Check the results above for any ❌ or ⚠️ indicators',
    ''
UNION ALL
SELECT 
    '',
    'All ✅ items are working correctly',
    ''
UNION ALL
SELECT 
    '',
    'Database is ready for: ' || CURRENT_DATABASE(),
    ''
UNION ALL
SELECT 
    '',
    'Timestamp: ' || NOW()::TEXT,
    '';