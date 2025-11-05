-- =====================================================
-- PERFORMANCE INDEXES MIGRATION
-- =====================================================
-- This migration adds critical indexes for query performance
-- Based on analysis from DATABASE_OPTIMIZATION_REPORT.md
--
-- Expected Performance Impact:
-- - 10-100x faster filtered queries
-- - 30-40% reduction in query execution time
-- - Significant improvement for dashboard and pipeline queries
-- =====================================================

-- =====================================================
-- CORE OPERATIONAL INDEXES (HIGHEST PRIORITY)
-- =====================================================
-- These indexes support the most common query patterns in the ops platform

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_status
ON leads(status);

CREATE INDEX IF NOT EXISTS idx_leads_stage
ON leads(stage);

CREATE INDEX IF NOT EXISTS idx_leads_created_at
ON leads(created_at DESC);

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_status_created
ON leads(status, created_at DESC);

-- Email lookup for lead deduplication
CREATE INDEX IF NOT EXISTS idx_leads_email
ON leads(email);

-- Company lookup for customer search
CREATE INDEX IF NOT EXISTS idx_leads_company
ON leads(company) WHERE company IS NOT NULL;

-- Assigned user filtering
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to
ON leads(assigned_to) WHERE assigned_to IS NOT NULL;

-- =====================================================
-- LEAD ACTIVITIES INDEXES
-- =====================================================
-- Support efficient activity queries and timeline views

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id
ON lead_activities(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_activities_type
ON lead_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at
ON lead_activities(created_at DESC);

-- =====================================================
-- QUOTES AND CONTRACTS INDEXES
-- =====================================================
-- Support quote history and contract tracking

CREATE INDEX IF NOT EXISTS idx_quotes_lead_id
ON quotes(lead_id);

CREATE INDEX IF NOT EXISTS idx_quotes_created_at
ON quotes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_deal_id
ON contracts(deal_id) WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contracts_status
ON contracts(status);

-- =====================================================
-- PRODUCTION AND BUILDS INDEXES
-- =====================================================
-- Support production tracking and scheduling

CREATE INDEX IF NOT EXISTS idx_builds_status
ON builds(status);

CREATE INDEX IF NOT EXISTS idx_builds_scheduled_start
ON builds(scheduled_start);

CREATE INDEX IF NOT EXISTS idx_builds_deal_id
ON builds(deal_id) WHERE deal_id IS NOT NULL;

-- Composite index for production dashboard
CREATE INDEX IF NOT EXISTS idx_builds_status_date
ON builds(status, scheduled_start);

CREATE INDEX IF NOT EXISTS idx_production_jobs_status
ON production_jobs(status) WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_production_jobs_target_date
ON production_jobs(target_date);

CREATE INDEX IF NOT EXISTS idx_production_jobs_status_date
ON production_jobs(status, target_date);

-- =====================================================
-- INVENTORY INDEXES
-- =====================================================
-- Support inventory management and stock lookups

CREATE INDEX IF NOT EXISTS idx_inventory_sku
ON inventory(sku);

CREATE INDEX IF NOT EXISTS idx_inventory_category
ON inventory(category);

CREATE INDEX IF NOT EXISTS idx_inventory_status
ON inventory(status);

-- Low stock alerts
CREATE INDEX IF NOT EXISTS idx_inventory_quantity
ON inventory(quantity) WHERE quantity < 10;

-- =====================================================
-- CUSTOMERS INDEXES
-- =====================================================
-- Support customer search and management

CREATE INDEX IF NOT EXISTS idx_customers_email
ON customers(email);

CREATE INDEX IF NOT EXISTS idx_customers_company
ON customers(company) WHERE company IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_status
ON customers(status);

CREATE INDEX IF NOT EXISTS idx_customers_last_contact
ON customers(last_contact_date DESC NULLS LAST);

-- Full name search optimization
CREATE INDEX IF NOT EXISTS idx_customers_name
ON customers(last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_customers_created_at
ON customers(created_at DESC);

-- =====================================================
-- BLOG AND CONTENT INDEXES
-- =====================================================
-- Support blog listing and content search

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
ON blog_posts(slug);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published
ON blog_posts(status, published_at DESC)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
ON blog_posts(category) WHERE category IS NOT NULL;

-- =====================================================
-- KNOWLEDGE BASE INDEXES
-- =====================================================
-- Support knowledge base search and filtering

CREATE INDEX IF NOT EXISTS idx_knowledge_base_slug
ON knowledge_base(slug);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category
ON knowledge_base(category);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_published
ON knowledge_base(published, created_at DESC);

-- Views for popular content
CREATE INDEX IF NOT EXISTS idx_knowledge_base_views
ON knowledge_base(views DESC) WHERE published = true;

-- =====================================================
-- PRICING OPTIONS INDEXES
-- =====================================================
-- Support configurator pricing lookups

CREATE INDEX IF NOT EXISTS idx_pricing_options_model
ON pricing_options(model);

CREATE INDEX IF NOT EXISTS idx_pricing_options_category
ON pricing_options(category);

-- Composite index for efficient model + category filtering
CREATE INDEX IF NOT EXISTS idx_pricing_options_model_cat
ON pricing_options(model, category);

-- =====================================================
-- ORDERS INDEXES
-- =====================================================
-- Support order history and tracking

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_production_job
ON orders(production_job_id) WHERE production_job_id IS NOT NULL;

-- =====================================================
-- AUTHENTICATION AND PROFILES INDEXES
-- =====================================================
-- Support user management and session tracking

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_active
ON profiles(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_profiles_last_login
ON profiles(last_login DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id
ON auth_audit_log(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_auth_audit_log_event_type
ON auth_audit_log(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_auth_audit_log_success
ON auth_audit_log(success, timestamp DESC);

-- =====================================================
-- PIPELINE AUTOMATIONS INDEXES
-- =====================================================
-- Support automation rules and stage transitions

CREATE INDEX IF NOT EXISTS idx_pipeline_automations_stages
ON pipeline_automations(from_stage, to_stage) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_pipeline_automations_active
ON pipeline_automations(active);

-- =====================================================
-- BILL OF MATERIALS INDEXES
-- =====================================================
-- Support BOM lookups for production

CREATE INDEX IF NOT EXISTS idx_bom_model
ON bill_of_materials(model_name);

CREATE INDEX IF NOT EXISTS idx_bom_build_id
ON bill_of_materials(build_id) WHERE build_id IS NOT NULL;

-- =====================================================
-- SUPPLIERS INDEXES
-- =====================================================
-- Support supplier management

CREATE INDEX IF NOT EXISTS idx_suppliers_name
ON suppliers(name);

CREATE INDEX IF NOT EXISTS idx_suppliers_status
ON suppliers(status);

-- =====================================================
-- VERIFICATION AND STATISTICS
-- =====================================================
-- Run ANALYZE to update statistics for query planner

ANALYZE leads;
ANALYZE lead_activities;
ANALYZE customers;
ANALYZE production_jobs;
ANALYZE builds;
ANALYZE inventory;
ANALYZE quotes;
ANALYZE contracts;
ANALYZE blog_posts;
ANALYZE knowledge_base;
ANALYZE pricing_options;

-- =====================================================
-- INDEX USAGE MONITORING VIEW
-- =====================================================
-- Create a view to monitor index usage (PostgreSQL 9.4+)

CREATE OR REPLACE VIEW index_usage_stats AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM
    pg_stat_user_indexes
WHERE
    schemaname = 'public'
ORDER BY
    idx_scan DESC;

-- Grant access to the view
GRANT SELECT ON index_usage_stats TO authenticated;
GRANT SELECT ON index_usage_stats TO service_role;

-- =====================================================
-- NOTES
-- =====================================================
--
-- Index Maintenance:
-- - PostgreSQL automatically maintains B-tree indexes
-- - VACUUM and ANALYZE run automatically (autovacuum)
-- - Monitor index usage with: SELECT * FROM index_usage_stats;
-- - Drop unused indexes after 30 days if idx_scan = 0
--
-- Performance Expectations:
-- - Simple equality filters: 10-100x faster
-- - Date range queries: 5-20x faster
-- - JOIN operations: 2-10x faster
-- - Dashboard queries: 50-70% faster overall
--
-- Disk Space Impact:
-- - Indexes typically add 20-30% to table size
-- - For 10,000 leads: ~2-5MB additional storage
-- - Monitor with: SELECT pg_size_pretty(pg_database_size(current_database()));
--
-- =====================================================
