-- =====================================================
-- CHECK CURRENT DATABASE TABLES
-- =====================================================
-- Run this first to see what tables already exist
-- This helps avoid conflicts and plan the migration
-- =====================================================

-- List all tables in public schema
SELECT
    'Existing Tables' AS category,
    tablename AS name,
    schemaname AS schema
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for specific required tables
SELECT
    'Table Check' AS category,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles')
        THEN '✅ profiles exists'
        ELSE '❌ profiles missing'
    END AS profiles_status,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads')
        THEN '✅ leads exists'
        ELSE '❌ leads missing'
    END AS leads_status,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes')
        THEN '✅ quotes exists'
        ELSE '❌ quotes missing'
    END AS quotes_status,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers')
        THEN '✅ customers exists'
        ELSE '❌ customers missing'
    END AS customers_status,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts')
        THEN '✅ blog_posts exists'
        ELSE '❌ blog_posts missing'
    END AS blog_posts_status,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory')
        THEN '✅ inventory exists'
        ELSE '❌ inventory missing'
    END AS inventory_status;
