-- Combined JTH Migrations
-- Generated: 2025-08-22T13:19:12.375Z
-- Execute this file in Supabase Dashboard SQL Editor

-- First, create migrations tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

GRANT ALL ON public.schema_migrations TO postgres, anon, authenticated, service_role;


-- ============================================
-- Migration: 001_initial_schema
-- Checksum: f2a4eec0d9ad67e4899ce201b5155ef4b1c49cda26d5f9352ee6ce5ffe89550b
-- ============================================

-- Check if migration already executed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schema_migrations WHERE version = '001_initial_schema'
  ) THEN
    -- Execute migration
-- JTH Comprehensive Operations Database Schema
-- Includes: Sales Pipeline, Production Tracking, Inventory, Customer Portal, Knowledge Base

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Team Members / Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'workshop', 'sales', 'customer')),
    department VARCHAR(100),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('individual', 'business', 'dealer')),
    vat_number VARCHAR(50),
    company_number VARCHAR(50),
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    role VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email)
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('billing', 'delivery', 'both')),
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'GB',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (organization_id IS NOT NULL OR contact_id IS NOT NULL)
);

-- =====================================================
-- PRODUCT CATALOG
-- =====================================================

-- Product Models
CREATE TABLE IF NOT EXISTS product_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('3.5t', '4.5t', '7.2t')),
    series VARCHAR(100), -- e.g., 'Principle', 'Professional', 'Progeny', 'Aeos', 'Zenos'
    base_price DECIMAL(10, 2) NOT NULL,
    weight_kg INTEGER,
    external_length_mm INTEGER,
    external_width_mm INTEGER,
    external_height_mm INTEGER,
    internal_length_mm INTEGER,
    internal_width_mm INTEGER,
    internal_height_mm INTEGER,
    horse_capacity INTEGER DEFAULT 2,
    payload_kg INTEGER,
    build_time_weeks_min INTEGER DEFAULT 8,
    build_time_weeks_max INTEGER DEFAULT 12,
    warranty_years INTEGER DEFAULT 2,
    description TEXT,
    features JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Options/Accessories
CREATE TABLE IF NOT EXISTS product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    supplier VARCHAR(255),
    supplier_link TEXT,
    quantity_per_unit INTEGER DEFAULT 1,
    weight_kg DECIMAL(8, 2),
    lead_time_days INTEGER,
    images JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model-Option Compatibility
CREATE TABLE IF NOT EXISTS model_options (
    model_id UUID REFERENCES product_models(id) ON DELETE CASCADE,
    option_id UUID REFERENCES product_options(id) ON DELETE CASCADE,
    is_standard BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    PRIMARY KEY (model_id, option_id)
);

-- =====================================================
-- SALES PIPELINE
-- =====================================================

-- Leads/Opportunities
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES users(id),
    source VARCHAR(100), -- 'website', 'phone', 'email', 'referral', 'dealer', 'show'
    source_details JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    stage VARCHAR(100) NOT NULL DEFAULT 'inquiry',
    -- Stages: inquiry, qualification, specification, quotation, negotiation, closed_won, closed_lost
    score INTEGER DEFAULT 0,
    tags TEXT[],
    notes TEXT,
    next_action VARCHAR(255),
    next_action_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    lead_id UUID REFERENCES leads(id),
    organization_id UUID REFERENCES organizations(id),
    contact_id UUID REFERENCES contacts(id),
    prepared_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status: draft, sent, viewed, followed_up, accepted, rejected, expired
    model_id UUID REFERENCES product_models(id),
    configuration JSONB NOT NULL DEFAULT '{}',
    base_price DECIMAL(10, 2) NOT NULL,
    options_price DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    vat_rate DECIMAL(5, 2) DEFAULT 20,
    vat_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    finance_options JSONB DEFAULT '{}',
    payment_terms TEXT,
    delivery_date DATE,
    validity_days INTEGER DEFAULT 30,
    expires_at DATE,
    notes TEXT,
    terms_and_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

-- Quote Line Items
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    option_id UUID REFERENCES product_options(id),
    description VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    organization_id UUID REFERENCES organizations(id),
    contact_id UUID REFERENCES contacts(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Status: pending, confirmed, in_production, ready, delivered, completed, cancelled
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_paid DECIMAL(10, 2) DEFAULT 0,
    balance_due DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_address_id UUID REFERENCES addresses(id),
    delivery_date DATE,
    delivery_notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- PRODUCTION TRACKING
-- =====================================================

-- Production Jobs
CREATE TABLE IF NOT EXISTS production_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    model_id UUID REFERENCES product_models(id),
    configuration JSONB NOT NULL,
    chassis_number VARCHAR(100),
    registration VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    -- Status: scheduled, chassis_prep, floor_walls, electrical, plumbing, interior, painting, testing, quality_check, ready
    current_stage VARCHAR(100),
    priority INTEGER DEFAULT 0,
    assigned_team UUID[],
    start_date DATE,
    target_date DATE,
    actual_completion DATE,
    hours_estimated INTEGER,
    hours_actual INTEGER,
    notes TEXT,
    issues JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production Stages
CREATE TABLE IF NOT EXISTS production_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES production_jobs(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    -- Status: pending, in_progress, blocked, completed, skipped
    assigned_to UUID REFERENCES users(id),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    completion_percentage INTEGER DEFAULT 0,
    notes TEXT,
    blockers TEXT,
    sign_off_required BOOLEAN DEFAULT false,
    signed_off_by UUID REFERENCES users(id),
    signed_off_at TIMESTAMPTZ,
    photos JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality Checks
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES production_jobs(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES production_stages(id),
    check_type VARCHAR(100) NOT NULL,
    checklist JSONB NOT NULL,
    performed_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    -- Status: passed, failed, conditional, pending_recheck
    issues_found JSONB DEFAULT '[]',
    corrective_actions JSONB DEFAULT '[]',
    photos JSONB DEFAULT '[]',
    notes TEXT,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit_of_measure VARCHAR(50),
    current_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 0,
    max_stock_level DECIMAL(10, 2),
    reorder_point DECIMAL(10, 2),
    reorder_quantity DECIMAL(10, 2),
    location VARCHAR(100),
    supplier_id UUID,
    supplier_sku VARCHAR(100),
    unit_cost DECIMAL(10, 2),
    lead_time_days INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id),
    movement_type VARCHAR(50) NOT NULL,
    -- Type: receipt, issue, adjustment, return, waste
    quantity DECIMAL(10, 2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER PORTAL
-- =====================================================

-- Customer Portal Access
CREATE TABLE IF NOT EXISTS portal_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build Updates (for customer visibility)
CREATE TABLE IF NOT EXISTS build_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES production_jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    update_type VARCHAR(50),
    -- Type: milestone, progress, delay, completion
    is_customer_visible BOOLEAN DEFAULT true,
    photos JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- KNOWLEDGE BASE & AI CHATBOT
-- =====================================================

-- Knowledge Base Categories
CREATE TABLE IF NOT EXISTS kb_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES kb_categories(id),
    description TEXT,
    icon VARCHAR(50),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base Articles
CREATE TABLE IF NOT EXISTS kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES kb_categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID REFERENCES users(id),
    tags TEXT[],
    meta_description TEXT,
    meta_keywords TEXT[],
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    related_articles UUID[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Article Embeddings for AI Search
CREATE TABLE IF NOT EXISTS kb_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, chunk_index)
);

-- Model Specifications for Knowledge Base
CREATE TABLE IF NOT EXISTS kb_model_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES product_models(id),
    spec_category VARCHAR(100) NOT NULL,
    spec_name VARCHAR(255) NOT NULL,
    spec_value TEXT NOT NULL,
    spec_unit VARCHAR(50),
    is_highlight BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warranty Information
CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    warranty_type VARCHAR(50),
    -- Type: standard, extended, component
    coverage_details JSONB DEFAULT '{}',
    terms_and_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tags TEXT[],
    is_published BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot Conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    messages JSONB NOT NULL DEFAULT '[]',
    context JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    escalated BOOLEAN DEFAULT false,
    escalated_to UUID REFERENCES users(id),
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comment TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- =====================================================
-- ACTIVITY & AUDIT LOGS
-- =====================================================

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES users(id),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users & Auth
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_portal_access_contact ON portal_access(contact_id);

-- Organizations & Contacts
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_addresses_organization ON addresses(organization_id);
CREATE INDEX idx_addresses_contact ON addresses(contact_id);

-- Products
CREATE INDEX idx_product_models_category ON product_models(category);
CREATE INDEX idx_product_models_active ON product_models(is_active);
CREATE INDEX idx_product_options_category ON product_options(category);
CREATE INDEX idx_model_options_model ON model_options(model_id);
CREATE INDEX idx_model_options_option ON model_options(option_id);

-- Sales Pipeline
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_quotes_lead ON quotes(lead_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_number ON quotes(quote_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Production
CREATE INDEX idx_production_jobs_status ON production_jobs(status);
CREATE INDEX idx_production_jobs_order ON production_jobs(order_id);
CREATE INDEX idx_production_stages_job ON production_stages(job_id);
CREATE INDEX idx_production_stages_status ON production_stages(status);
CREATE INDEX idx_quality_checks_job ON quality_checks(job_id);
CREATE INDEX idx_build_updates_job ON build_updates(job_id);

-- Inventory
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);

-- Knowledge Base
CREATE INDEX idx_kb_articles_category ON kb_articles(category_id);
CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX idx_kb_articles_published ON kb_articles(is_published);
CREATE INDEX idx_kb_articles_tags ON kb_articles USING gin(tags);
CREATE INDEX idx_kb_embeddings_article ON kb_embeddings(article_id);
CREATE INDEX idx_kb_embeddings_vector ON kb_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Activity
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(performed_by);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Admin users can see everything
CREATE POLICY admin_all ON users FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Customers can only see their own data
CREATE POLICY customer_own_contacts ON contacts FOR SELECT USING (
    id = auth.uid() OR 
    organization_id IN (
        SELECT organization_id FROM contacts WHERE id = auth.uid()
    )
);

CREATE POLICY customer_own_orders ON orders FOR SELECT USING (
    contact_id = auth.uid() OR
    organization_id IN (
        SELECT organization_id FROM contacts WHERE id = auth.uid()
    )
);

CREATE POLICY customer_own_builds ON build_updates FOR SELECT USING (
    is_customer_visible = true AND
    job_id IN (
        SELECT id FROM production_jobs WHERE order_id IN (
            SELECT id FROM orders WHERE contact_id = auth.uid()
        )
    )
);

-- Workshop staff can see production data
CREATE POLICY workshop_production ON production_jobs FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager', 'workshop'))
);

-- Sales can see pipeline data
CREATE POLICY sales_pipeline ON leads FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager', 'sales'))
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_product_models_updated_at BEFORE UPDATE ON product_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_production_jobs_updated_at BEFORE UPDATE ON production_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_production_stages_updated_at BEFORE UPDATE ON production_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'JTH-' || TO_CHAR(NOW(), 'YYYY-MM-') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to calculate quote totals
CREATE OR REPLACE FUNCTION calculate_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate subtotal
    NEW.subtotal := NEW.base_price + NEW.options_price - NEW.discount_amount;
    
    -- Calculate VAT
    NEW.vat_amount := NEW.subtotal * (NEW.vat_rate / 100);
    
    -- Calculate total
    NEW.total_amount := NEW.subtotal + NEW.vat_amount;
    
    -- Set expiry date
    IF NEW.validity_days IS NOT NULL THEN
        NEW.expires_at := CURRENT_DATE + (NEW.validity_days || ' days')::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_quote_totals_trigger
    BEFORE INSERT OR UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION calculate_quote_totals();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (entity_type, entity_id, action, performed_by, details)
    VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        current_setting('app.current_user_id', true)::UUID,
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Sales Pipeline View
CREATE OR REPLACE VIEW v_sales_pipeline AS
SELECT 
    l.id,
    l.status,
    l.stage,
    o.name as organization_name,
    c.first_name || ' ' || c.last_name as contact_name,
    u.full_name as assigned_to_name,
    l.created_at,
    l.updated_at,
    COUNT(q.id) as quote_count,
    MAX(q.total_amount) as max_quote_value
FROM leads l
LEFT JOIN organizations o ON l.organization_id = o.id
LEFT JOIN contacts c ON l.contact_id = c.id
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN quotes q ON q.lead_id = l.id
GROUP BY l.id, o.name, c.first_name, c.last_name, u.full_name;

-- Production Dashboard View
CREATE OR REPLACE VIEW v_production_dashboard AS
SELECT 
    pj.id,
    pj.job_number,
    pj.status,
    pj.current_stage,
    pm.name as model_name,
    o.order_number,
    org.name as customer_name,
    pj.start_date,
    pj.target_date,
    pj.actual_completion,
    COUNT(DISTINCT ps.id) as total_stages,
    COUNT(DISTINCT CASE WHEN ps.status = 'completed' THEN ps.id END) as completed_stages,
    AVG(ps.completion_percentage) as avg_completion
FROM production_jobs pj
LEFT JOIN product_models pm ON pj.model_id = pm.id
LEFT JOIN orders o ON pj.order_id = o.id
LEFT JOIN organizations org ON o.organization_id = org.id
LEFT JOIN production_stages ps ON ps.job_id = pj.id
GROUP BY pj.id, pm.name, o.order_number, org.name;

-- Inventory Status View
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT 
    ii.id,
    ii.sku,
    ii.name,
    ii.category,
    ii.current_stock,
    ii.min_stock_level,
    ii.reorder_point,
    CASE 
        WHEN ii.current_stock <= ii.min_stock_level THEN 'critical'
        WHEN ii.current_stock <= ii.reorder_point THEN 'low'
        ELSE 'adequate'
    END as stock_status,
    ii.supplier_id,
    ii.lead_time_days
FROM inventory_items ii
WHERE ii.is_active = true;

-- =====================================================
-- INITIAL SEED DATA
-- =====================================================

-- Insert default product models based on JTH specifications
INSERT INTO product_models (model_code, name, category, series, base_price, weight_kg, 
    external_length_mm, external_width_mm, external_height_mm, horse_capacity,
    build_time_weeks_min, build_time_weeks_max, warranty_years, description, is_active)
VALUES 
    -- 3.5t Models
    ('JTH-PRIN-35', 'Principle 3.5t', '3.5t', 'Principle', 35000.00, 1200,
     5500, 2200, 2800, 2, 8, 12, 2, 'Entry-level 3.5t horsebox with essential features', true),
    
    ('JTH-PROF-35', 'Professional 3.5t', '3.5t', 'Professional', 42000.00, 1250,
     5500, 2200, 2800, 2, 10, 14, 2, 'Mid-range 3.5t horsebox with enhanced comfort', true),
    
    ('JTH-PROG-35', 'Progeny 3.5t', '3.5t', 'Progeny', 48000.00, 1300,
     5500, 2200, 2800, 2, 12, 16, 3, 'Premium 3.5t horsebox with luxury features', true),
    
    -- 4.5t Models
    ('JTH-AEOS-45', 'Aeos 4.5t', '4.5t', 'Aeos', 55000.00, 1800,
     6500, 2400, 3000, 2, 10, 14, 2, 'Standard 4.5t horsebox with extra payload', true),
    
    ('JTH-AEOS-45P', 'Aeos Plus 4.5t', '4.5t', 'Aeos', 62000.00, 1850,
     6500, 2400, 3000, 3, 12, 16, 3, 'Enhanced 4.5t horsebox for 3 horses', true),
    
    -- 7.2t Models
    ('JTH-ZENO-72', 'Zenos 7.2t', '7.2t', 'Zenos', 75000.00, 2500,
     7500, 2500, 3200, 3, 12, 16, 3, 'Professional 7.2t horsebox for commercial use', true),
    
    ('JTH-ZENO-72L', 'Zenos Luxury 7.2t', '7.2t', 'Zenos', 95000.00, 2600,
     8000, 2500, 3200, 4, 14, 18, 5, 'Luxury 7.2t horsebox with living quarters', true);

-- Insert sample team members
INSERT INTO users (email, full_name, role, department, phone, is_active)
VALUES 
    ('admin@jthltd.co.uk', 'System Admin', 'admin', 'IT', '01234567890', true),
    ('steven.warner@jthltd.co.uk', 'Steven Warner', 'manager', 'Workshop', '01234567891', true),
    ('sales@jthltd.co.uk', 'Sales Team', 'sales', 'Sales', '01234567892', true),
    ('workshop@jthltd.co.uk', 'Workshop Team', 'workshop', 'Production', '01234567893', true);

-- Insert FAQ categories
INSERT INTO kb_categories (name, slug, description, position, is_active)
VALUES 
    ('General Information', 'general', 'General questions about JTH', 1, true),
    ('Models & Specifications', 'models', 'Information about our horsebox models', 2, true),
    ('Ordering & Delivery', 'ordering', 'How to order and delivery information', 3, true),
    ('Warranty & Service', 'warranty', 'Warranty coverage and servicing', 4, true),
    ('Finance & Payment', 'finance', 'Payment options and finance', 5, true);

-- Insert sample FAQs
INSERT INTO faqs (category, question, answer, tags, position)
VALUES 
    ('General Information', 'What is the typical build time for a horsebox?', 
     'Standard models typically take 8-12 weeks to build, while custom specifications can take 12-16 weeks. We will provide you with a more accurate timeline when you place your order.',
     ARRAY['build time', 'delivery', 'production'], 1),
    
    ('Models & Specifications', 'What is the difference between the 3.5t models?',
     'We offer three 3.5t models: Principle (entry-level with essential features), Professional (mid-range with enhanced comfort), and Progeny (premium with luxury features). Each model can be customized to your requirements.',
     ARRAY['3.5t', 'models', 'comparison'], 2),
    
    ('Warranty & Service', 'What warranty do you offer?',
     'Standard models come with a 2-year warranty, while our premium models include a 3-year warranty. Extended warranties up to 5 years are available for our 7.2t luxury models.',
     ARRAY['warranty', 'coverage', 'service'], 3);

-- Create initial workspace settings
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_settings (key, value)
VALUES 
    ('company_info', '{
        "name": "J Taylor Horseboxes Ltd",
        "vat_number": "GB123456789",
        "company_number": "12345678",
        "address": {
            "line1": "Unit 1, Industrial Estate",
            "city": "York",
            "postcode": "YO1 1AA",
            "country": "GB"
        },
        "phone": "01904 123456",
        "email": "info@jthltd.co.uk",
        "website": "https://www.jtaylorhorseboxes.com"
    }'),
    ('production_stages', '{
        "stages": [
            {"name": "Chassis Preparation", "order": 1, "estimated_hours": 16},
            {"name": "Floor & Walls", "order": 2, "estimated_hours": 24},
            {"name": "Electrical Installation", "order": 3, "estimated_hours": 16},
            {"name": "Plumbing", "order": 4, "estimated_hours": 12},
            {"name": "Interior Fit Out", "order": 5, "estimated_hours": 32},
            {"name": "Painting", "order": 6, "estimated_hours": 20},
            {"name": "Testing & QC", "order": 7, "estimated_hours": 8},
            {"name": "Final Inspection", "order": 8, "estimated_hours": 4}
        ]
    }'),
    ('sales_pipeline_stages', '{
        "stages": [
            {"name": "Inquiry", "order": 1, "probability": 10},
            {"name": "Qualification", "order": 2, "probability": 20},
            {"name": "Specification", "order": 3, "probability": 40},
            {"name": "Quotation", "order": 4, "probability": 60},
            {"name": "Negotiation", "order": 5, "probability": 80},
            {"name": "Closed Won", "order": 6, "probability": 100},
            {"name": "Closed Lost", "order": 7, "probability": 0}
        ]
    }');

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

    -- Record successful execution
    INSERT INTO public.schema_migrations (version, checksum, success)
    VALUES ('001_initial_schema', 'f2a4eec0d9ad67e4899ce201b5155ef4b1c49cda26d5f9352ee6ce5ffe89550b', true);
    
    RAISE NOTICE 'Migration 001_initial_schema executed successfully';
  ELSE
    RAISE NOTICE 'Migration 001_initial_schema already executed, skipping';
  END IF;
END $$;


-- ============================================
-- Migration: 002_monday_data_import
-- Checksum: 05062cfe99fd30c8b75ea7f18368a14270a4b16a4cb156afa47b7dfdb7c5a790
-- ============================================

-- Check if migration already executed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schema_migrations WHERE version = '002_monday_data_import'
  ) THEN
    -- Execute migration
-- Monday.com Data Import
-- Generated: 2025-08-22T13:35:28.966084
-- This migration imports data from Monday.com export


-- Import Additional Team Members

INSERT INTO users (email, full_name, role, department, is_active)
VALUES ('workshop@jthltd.co.uk', 'Steven Warner', 'admin', 'Operations', true)
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Import Workshop Accounts (Suppliers)

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('ea03183c-84ec-4d0f-a56e-0d60df12d5b5', 'Ostermann (Edge banding)', 'business', 'https://www.ostermann.eu/en_GB', 
    '{"customer_number": '2020177', "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('5056b7f8-33f1-4ab8-9762-6d8963a62afb', 'ELESA (spring pins etc)', 'business', 'https://www.elesa.com/en/elesab2bstoreuk', 
    '{"customer_number": 'jthltd', "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('6482a939-6bb2-497f-ba9e-bfd5915ae8f4', 'Metrol Springs', 'business', 'https://www.metrol.com/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO contacts (id, organization_id, first_name, last_name, email, role)
VALUES ('00a2bac2-2064-4be9-b10e-b09acd32414a', '6482a939-6bb2-497f-ba9e-bfd5915ae8f4', 'Jack Bannister', '', 'Jackbannister@metrol.com', 'Sales Representative');

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('c3b39f93-a607-49d6-9396-652d212beb58', 'Solmer (drawer runners)', 'business', 'https://www.solmer.co.uk/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('d8ed2014-4341-4343-9c10-39f3c4acbfaf', 'GSEquestrian', 'business', 'https://gsequestrian.co.uk/?country=GB', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('a55c829d-0ac9-4fd1-8194-e2ae0cde3886', 'Renogy', 'business', 'https://uk.renogy.com/', 
    '{"customer_number": '1450436', "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('f6d36a98-717f-41c6-8109-95991d7123c6', 'Eco Worthy', 'business', 'https://uk.eco-worthy.com/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('326d7ebd-188e-4bef-a92e-77766a26c6ab', 'Blackheath Products (laminate)', 'business', 'https://www.blackheathproducts.co.uk/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('39f7d288-7011-4a42-89ab-53a1b658b85d', 'Item 4', 'business', NULL, 
    '{"customer_number": NULL, "login": NULL}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('aa2a441e-6c31-41e8-8bbb-ef45cd778fb1', 'Item 5', 'business', NULL, 
    '{"customer_number": NULL, "login": NULL}'::jsonb);

-- Import JTH Products (Parts/Accessories)

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('9b2b40b8-f62b-48fe-adaf-e3dcc74adedb', 'OPT-0002', 'Sliding partition Indexing Plunger', 'Horse Area Equipment', 
    33.5, 'https://www.elesa.com/ProductDisplay?storeId=10155&catalogId=10058&langId=-1&urlLangId=-1&parentCatEntryId=198004&productId=61981&categoryId=&top_category=&urlRequestType=Base&pageName=CatalogEntryPage', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('107da3f2-ed21-4a6c-ae3a-d82ef58fbb3f', 'OPT-0003', 'Item 2', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('f1de6f1e-b1ce-41df-8f69-4fa79b6ff12c', 'OPT-0004', 'Item 3', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('68bb4f48-d597-41fb-9d99-598b08a2162c', 'OPT-0006', 'Grooms', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('37c4e721-1d10-4de2-96c8-b41a63f4bc33', 'OPT-0008', 'Saddle Rack', 'Horse Area Equipment', 
    10.68, 'https://gsequestrian.co.uk/products/perry-equestrian-standard-saddle-rack?variant=31328427606064&gad_source=1&gad_campaignid=19899447738&gbraid=0AAAAADuamB-yWjEcx8qOG_nMmUYNic1c4&gclid=Cj0KCQjwndHEBhDVARIsAGh0g3AIt_qkwI3yw3RiHtPhLGM8WZMVM_Fu4qSik_OnGKmLjc3oU75mTvUaAiFGEALw_wcB', 2);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('6992effe-6eca-4bc7-bb78-bb9850fc7872', 'OPT-0009', 'Bridle Hook', 'Horse Area Equipment', 
    4.5, 'https://gsequestrian.co.uk/products/shires-bridle-rack-976', 2);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('58a2b380-d461-48c9-a227-5013bbc2fde6', 'OPT-0010', 'Laminate', 'Horse Area Equipment', 
    0, 'https://www.blackheathproducts.co.uk/', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('c2d74aee-62bc-4f2e-a701-f950306dce0f', 'OPT-0011', 'Stick on veneer', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('c705114f-cf55-42a9-89f9-4ea17ac8d7de', 'OPT-0012', 'Drawer Boxes', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('6a85d411-08dd-43d4-b82e-6f8cd98dd7d2', 'OPT-0014', 'Electrics', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('9bac8a61-cbcf-46b3-ac47-81dd90217558', 'OPT-0016', '100A Lithium Battery', 'Horse Area Equipment', 
    179.99, 'https://uk.eco-worthy.com/collections/12v-lifepo4-lithium-battery/products/lifepo4-12v-100ah-lithium-iron-phosphate-battery', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('18de6f44-d183-4810-bf9d-b3506ec16b61', 'OPT-0017', '40A DC to DC Charger', 'Horse Area Equipment', 
    0, 'https://uk.renogy.com/collections/dc-to-dc-battery-charger/products/12v-40a-dc-to-dc-battery-charger', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('ece32fc4-6438-4d46-995d-b1d8dcac174f', 'OPT-0018', 'AC to AC Charger', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('7b14f599-ee70-4c6f-af85-62143f56a5d5', 'OPT-0019', '12v Fuse box', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('203cb2f2-5387-4f14-84e4-4a9ba7c09eff', 'OPT-0020', '12v Bus Bar', 'Horse Area Equipment', 
    0, NULL, 1);

-- Import Workshop Jobs

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('ac3692f1-1df9-4301-b862-b53799bfb2db', 'JOB-0003', 'scheduled', 'Name', 
    'Date for Paint');

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('f869bfdc-9583-4642-bf27-3defb63bbcf2', 'JOB-0004', 'in_progress', 'LC20 BXK Professional 45 Kathy Webb', 
    '2025-08-25T00:00:00');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('5e8d05ed-c5f0-4089-bbd8-529172e7d172', 'f869bfdc-9583-4642-bf27-3defb63bbcf2', 'Name', 5, 'pending', 
    'Owner');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('fffa0d71-a307-4787-9c87-8d939f62bb03', 'f869bfdc-9583-4642-bf27-3defb63bbcf2', 'Finish off ramp bottom', 6, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('ccedf02d-798f-47e4-9f3f-a26c41beda2a', 'f869bfdc-9583-4642-bf27-3defb63bbcf2', 'Paint', 7, 'pending', 
    NULL);

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('3befe885-4ec2-441d-8a2a-5587ba35d1d4', 'JOB-0008', 'in_progress', 'LR21 WWG Blue professional 35', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('6514f17f-0df5-4695-a672-68c576f8b9e6', '3befe885-4ec2-441d-8a2a-5587ba35d1d4', 'Name', 9, 'pending', 
    'Owner');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('49eedf94-bd60-42ec-b9e0-acdd7f8e48e2', '3befe885-4ec2-441d-8a2a-5587ba35d1d4', 'Fit shelf in living and water pipes', 10, 'in_progress', 
    NULL);

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('0572ac07-f2ac-45fe-9ef1-0713a9057ae3', 'JOB-0013', 'scheduled', 'Name', 
    'Date for Paint');

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('fc710e9f-19a6-4c1e-a50a-52f23690d939', 'JOB-0014', 'scheduled', 'CA69 LVX Professional 35 HIRE BOX', 
    '2025-08-22T00:00:00');

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('f43c9814-864a-47cf-a054-cabdcfe57041', 'JOB-0015', 'scheduled', 'MX57 KFZ MAN Lorry', 
    '2025-08-24T00:00:00');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('fbfbd426-b962-4e36-8494-54aa4cf44de9', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Name', 16, 'pending', 
    'Owner');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('5b94bcf5-8538-4bc2-9a96-966ffbd9aadc', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Remove windscreen and Straighten A pillar', 17, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('479050ca-1827-4634-b36f-afca79abd106', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Source A pillar from scrap yard', 18, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('86a751d4-f625-4bbe-84fb-0af92e364c70', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Weld in A pillar', 19, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('ee8d48df-7d04-4f63-9470-762d30e41b28', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Install pod', 20, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('76212bda-ffd8-47db-996d-ac5ef3633011', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Paint', 21, 'pending', 
    NULL);

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('3783ac73-0337-410e-ae51-f7aa6e2cdcf7', 'JOB-0024', 'scheduled', 'Name', 
    'Date for Paint');

-- Create sample sales pipeline data

-- Sample customer organization
INSERT INTO organizations (id, name, type)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Kathy Webb Equestrian', 'individual');

-- Sample contact
INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 
    'Kathy', 'Webb', 'kathy.webb@example.com', '+447917016406');

-- Sample address
INSERT INTO addresses (organization_id, type, line1, city, postcode)
VALUES ('a0000000-0000-0000-0000-000000000001', 'both', 
    '123 Example Lane', 'York', 'YO1 2AB');

-- Sample lead
INSERT INTO leads (organization_id, contact_id, source, stage, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
    'website', 'quotation', 'active');

-- Sample quote for Pro 4.5
INSERT INTO quotes (quote_number, organization_id, contact_id, model_id, 
    base_price, options_price, subtotal, vat_amount, total_amount, status)
SELECT 'QUO-2025-0001', 'a0000000-0000-0000-0000-000000000001', 
    'b0000000-0000-0000-0000-000000000001', id,
    62000, 5000, 67000, 13400, 80400, 'sent'
FROM product_models WHERE model_code = 'JTH-AEOS-45P';

-- Sample order
INSERT INTO orders (order_number, quote_id, organization_id, contact_id, 
    status, total_amount, deposit_paid, balance_due)
SELECT 'JTH-2025-08-0001', id, 'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', 'in_production', 80400, 16080, 64320
FROM quotes WHERE quote_number = 'QUO-2025-0001';
    

    -- Record successful execution
    INSERT INTO public.schema_migrations (version, checksum, success)
    VALUES ('002_monday_data_import', '05062cfe99fd30c8b75ea7f18368a14270a4b16a4cb156afa47b7dfdb7c5a790', true);
    
    RAISE NOTICE 'Migration 002_monday_data_import executed successfully';
  ELSE
    RAISE NOTICE 'Migration 002_monday_data_import already executed, skipping';
  END IF;
END $$;


-- ============================================
-- Migration: 003_vector_search_and_functions
-- Checksum: 08b6489eee389b6e9c34bc4bf0204953c37c27dcb7ae43f3efe9b42811454c97
-- ============================================

-- Check if migration already executed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schema_migrations WHERE version = '003_vector_search_and_functions'
  ) THEN
    -- Execute migration
-- Vector Search Functions and Additional Components for JTH
-- =====================================================
-- VECTOR SEARCH FUNCTIONS
-- =====================================================

-- Function to search knowledge base articles using vector similarity
CREATE OR REPLACE FUNCTION search_kb_articles(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    content TEXT,
    category_id UUID,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (ka.id)
        ka.id as article_id,
        ka.title,
        ke.content,
        ka.category_id,
        1 - (ke.embedding <=> query_embedding) as similarity
    FROM kb_embeddings ke
    JOIN kb_articles ka ON ke.article_id = ka.id
    WHERE ka.is_published = true
        AND 1 - (ke.embedding <=> query_embedding) > match_threshold
    ORDER BY ka.id, similarity DESC
    LIMIT match_count;
END;
$$;

-- Function to search FAQs using text search
CREATE OR REPLACE FUNCTION search_faqs(
    search_query TEXT,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    question TEXT,
    answer TEXT,
    category VARCHAR(100),
    rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.question,
        f.answer,
        f.category,
        ts_rank(
            to_tsvector('english', f.question || ' ' || f.answer),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM faqs f
    WHERE f.is_published = true
        AND to_tsvector('english', f.question || ' ' || f.answer) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$;

-- =====================================================
-- AUDIT LOGGING TRIGGERS
-- =====================================================

-- Enhanced audit logging function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    user_id UUID;
BEGIN
    -- Get the current user ID from the session
    user_id := COALESCE(
        current_setting('app.current_user_id', true)::UUID,
        auth.uid()
    );

    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    -- Insert audit log
    INSERT INTO activity_logs (
        entity_type,
        entity_id,
        action,
        performed_by,
        details,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        user_id,
        jsonb_build_object(
            'old', old_data,
            'new', new_data,
            'changed_fields', CASE 
                WHEN TG_OP = 'UPDATE' THEN (
                    SELECT jsonb_object_agg(key, new_data->key)
                    FROM jsonb_each(new_data)
                    WHERE old_data->key IS DISTINCT FROM new_data->key
                )
                ELSE NULL
            END
        ),
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_quotes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON quotes
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_production_jobs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON production_jobs
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_leads_trigger
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- =====================================================
-- BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Function to calculate lead score based on activities
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    lead_record RECORD;
    quote_count INTEGER;
    days_since_created INTEGER;
BEGIN
    -- Get lead details
    SELECT * INTO lead_record FROM leads WHERE id = lead_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Base score by stage
    score := CASE lead_record.stage
        WHEN 'inquiry' THEN 10
        WHEN 'qualification' THEN 20
        WHEN 'specification' THEN 40
        WHEN 'quotation' THEN 60
        WHEN 'negotiation' THEN 80
        WHEN 'closed_won' THEN 100
        ELSE 0
    END;
    
    -- Add points for quotes
    SELECT COUNT(*) INTO quote_count FROM quotes WHERE quotes.lead_id = lead_id;
    score := score + (quote_count * 10);
    
    -- Add points for recent activity
    days_since_created := EXTRACT(DAY FROM NOW() - lead_record.created_at);
    IF days_since_created <= 7 THEN
        score := score + 10;
    ELSIF days_since_created <= 30 THEN
        score := score + 5;
    END IF;
    
    -- Cap score at 100
    IF score > 100 THEN
        score := 100;
    END IF;
    
    -- Update lead score
    UPDATE leads SET score = score WHERE id = lead_id;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to get production job timeline
CREATE OR REPLACE FUNCTION get_production_timeline(job_id UUID)
RETURNS TABLE (
    stage_name VARCHAR(100),
    stage_order INTEGER,
    status VARCHAR(50),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    completion_percentage INTEGER,
    assigned_to_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.stage_name,
        ps.stage_order,
        ps.status,
        ps.started_at,
        ps.completed_at,
        ps.estimated_hours,
        ps.actual_hours,
        ps.completion_percentage,
        u.full_name as assigned_to_name
    FROM production_stages ps
    LEFT JOIN users u ON ps.assigned_to = u.id
    WHERE ps.job_id = get_production_timeline.job_id
    ORDER BY ps.stage_order;
END;
$$;

-- Function to check inventory levels and create alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TABLE (
    item_id UUID,
    sku VARCHAR(100),
    name VARCHAR(255),
    current_stock DECIMAL(10, 2),
    min_stock_level DECIMAL(10, 2),
    reorder_point DECIMAL(10, 2),
    alert_type VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.id as item_id,
        ii.sku,
        ii.name,
        ii.current_stock,
        ii.min_stock_level,
        ii.reorder_point,
        CASE 
            WHEN ii.current_stock <= 0 THEN 'out_of_stock'
            WHEN ii.current_stock <= ii.min_stock_level THEN 'critical'
            WHEN ii.current_stock <= ii.reorder_point THEN 'reorder'
            ELSE 'ok'
        END as alert_type
    FROM inventory_items ii
    WHERE ii.is_active = true
        AND (ii.current_stock <= ii.reorder_point OR ii.current_stock <= 0)
    ORDER BY 
        CASE 
            WHEN ii.current_stock <= 0 THEN 1
            WHEN ii.current_stock <= ii.min_stock_level THEN 2
            ELSE 3
        END,
        ii.current_stock ASC;
END;
$$;

-- =====================================================
-- VIEWS FOR DASHBOARDS
-- =====================================================

-- Customer Portal View - My Orders
CREATE OR REPLACE VIEW v_customer_orders AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.deposit_paid,
    o.balance_due,
    o.payment_status,
    o.delivery_date,
    o.created_at,
    q.quote_number,
    pm.name as model_name,
    pm.category as model_category,
    pj.job_number,
    pj.status as production_status,
    pj.current_stage,
    pj.target_date as production_target_date,
    (
        SELECT COUNT(*)
        FROM build_updates bu
        WHERE bu.job_id = pj.id AND bu.is_customer_visible = true
    ) as update_count
FROM orders o
LEFT JOIN quotes q ON o.quote_id = q.id
LEFT JOIN product_models pm ON q.model_id = pm.id
LEFT JOIN production_jobs pj ON pj.order_id = o.id;

-- Sales Dashboard - Pipeline Summary
CREATE OR REPLACE VIEW v_sales_dashboard AS
SELECT 
    stage,
    COUNT(*) as lead_count,
    COUNT(DISTINCT organization_id) as organization_count,
    AVG(score) as avg_score,
    SUM(
        SELECT MAX(total_amount) 
        FROM quotes 
        WHERE quotes.lead_id = leads.id
    ) as total_pipeline_value,
    AVG(
        EXTRACT(DAY FROM NOW() - created_at)
    ) as avg_age_days
FROM leads
WHERE status NOT IN ('closed_won', 'closed_lost')
GROUP BY stage;

-- Production Capacity View
CREATE OR REPLACE VIEW v_production_capacity AS
WITH stage_workload AS (
    SELECT 
        DATE_TRUNC('week', COALESCE(ps.started_at, pj.start_date)) as week_start,
        SUM(ps.estimated_hours) as estimated_hours,
        SUM(ps.actual_hours) as actual_hours,
        COUNT(DISTINCT pj.id) as job_count
    FROM production_jobs pj
    JOIN production_stages ps ON ps.job_id = pj.id
    WHERE pj.status NOT IN ('completed', 'cancelled')
    GROUP BY week_start
)
SELECT 
    week_start,
    estimated_hours,
    actual_hours,
    job_count,
    -- Assuming 40 hour work week, 5 workers
    (estimated_hours / 200.0 * 100) as capacity_utilization_percent
FROM stage_workload
ORDER BY week_start;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to convert lead to order
CREATE OR REPLACE FUNCTION convert_quote_to_order(
    quote_id UUID,
    deposit_amount DECIMAL(10, 2) DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
    order_num TEXT;
    quote_record RECORD;
BEGIN
    -- Get quote details
    SELECT * INTO quote_record FROM quotes WHERE id = quote_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;
    
    IF quote_record.status != 'accepted' THEN
        RAISE EXCEPTION 'Quote must be accepted before converting to order';
    END IF;
    
    -- Generate order number
    order_num := generate_order_number();
    
    -- Create order
    INSERT INTO orders (
        id,
        order_number,
        quote_id,
        organization_id,
        contact_id,
        status,
        total_amount,
        deposit_paid,
        balance_due,
        payment_status,
        created_at
    ) VALUES (
        uuid_generate_v4(),
        order_num,
        quote_id,
        quote_record.organization_id,
        quote_record.contact_id,
        'pending',
        quote_record.total_amount,
        deposit_amount,
        quote_record.total_amount - deposit_amount,
        CASE WHEN deposit_amount > 0 THEN 'partial' ELSE 'pending' END,
        NOW()
    ) RETURNING id INTO new_order_id;
    
    -- Update lead status
    UPDATE leads 
    SET stage = 'closed_won', status = 'won'
    WHERE id = quote_record.lead_id;
    
    -- Create production job
    INSERT INTO production_jobs (
        job_number,
        order_id,
        model_id,
        configuration,
        status,
        priority,
        created_at
    ) VALUES (
        'JOB-' || order_num,
        new_order_id,
        quote_record.model_id,
        quote_record.configuration,
        'scheduled',
        0,
        NOW()
    );
    
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Text search indexes
CREATE INDEX idx_kb_articles_text_search ON kb_articles 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(summary, '')));

CREATE INDEX idx_faqs_text_search ON faqs 
    USING gin(to_tsvector('english', question || ' ' || answer));

-- Additional performance indexes
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_production_jobs_target_date ON production_jobs(target_date);
CREATE INDEX idx_activity_logs_entity_created ON activity_logs(entity_type, entity_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES (Additional)
-- =====================================================

-- Knowledge base is public read
CREATE POLICY kb_public_read ON kb_articles 
    FOR SELECT USING (is_published = true);

CREATE POLICY kb_admin_all ON kb_articles 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager'))
    );

-- FAQs are public read
CREATE POLICY faq_public_read ON faqs 
    FOR SELECT USING (is_published = true);

CREATE POLICY faq_admin_all ON faqs 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager'))
    );

-- Inventory management for workshop staff
CREATE POLICY inventory_workshop ON inventory_items 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager', 'workshop'))
    );

CREATE POLICY stock_movements_workshop ON stock_movements 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager', 'workshop'))
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get next available build slot
CREATE OR REPLACE FUNCTION get_next_build_slot(
    model_id UUID,
    earliest_date DATE DEFAULT CURRENT_DATE
)
RETURNS DATE AS $$
DECLARE
    model_record RECORD;
    current_capacity INTEGER;
    slot_date DATE;
    max_concurrent_builds INTEGER := 5; -- Configurable
BEGIN
    -- Get model build time
    SELECT * INTO model_record FROM product_models WHERE id = model_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Model not found';
    END IF;
    
    slot_date := earliest_date;
    
    -- Find first available slot
    LOOP
        -- Count jobs in progress for this date range
        SELECT COUNT(*) INTO current_capacity
        FROM production_jobs
        WHERE status IN ('scheduled', 'in_progress')
            AND start_date <= slot_date
            AND target_date >= slot_date;
        
        IF current_capacity < max_concurrent_builds THEN
            RETURN slot_date;
        END IF;
        
        slot_date := slot_date + INTERVAL '1 week';
        
        -- Prevent infinite loop
        IF slot_date > earliest_date + INTERVAL '52 weeks' THEN
            RAISE EXCEPTION 'No available build slots in the next year';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification (placeholder for real implementation)
CREATE OR REPLACE FUNCTION send_notification(
    user_id UUID,
    notification_type TEXT,
    title TEXT,
    message TEXT,
    metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    -- This would integrate with your notification system
    -- For now, just log to activity
    INSERT INTO activity_logs (
        entity_type,
        entity_id,
        action,
        performed_by,
        details,
        created_at
    ) VALUES (
        'notification',
        user_id,
        notification_type,
        user_id,
        jsonb_build_object(
            'title', title,
            'message', message,
            'metadata', metadata
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION search_kb_articles TO authenticated;
GRANT EXECUTE ON FUNCTION search_faqs TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_lead_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION check_inventory_levels TO authenticated;
GRANT EXECUTE ON FUNCTION convert_quote_to_order TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_build_slot TO authenticated;

-- Grant select on views
GRANT SELECT ON v_customer_orders TO authenticated;
GRANT SELECT ON v_sales_pipeline TO authenticated;
GRANT SELECT ON v_sales_dashboard TO authenticated;
GRANT SELECT ON v_production_dashboard TO authenticated;
GRANT SELECT ON v_production_capacity TO authenticated;
GRANT SELECT ON v_inventory_status TO authenticated;

    -- Record successful execution
    INSERT INTO public.schema_migrations (version, checksum, success)
    VALUES ('003_vector_search_and_functions', '08b6489eee389b6e9c34bc4bf0204953c37c27dcb7ae43f3efe9b42811454c97', true);
    
    RAISE NOTICE 'Migration 003_vector_search_and_functions executed successfully';
  ELSE
    RAISE NOTICE 'Migration 003_vector_search_and_functions already executed, skipping';
  END IF;
END $$;


-- ============================================
-- Migration: 004_jth_model_data
-- Checksum: c3476d460aafa671e3a76579b41eb7c4d139a100502e7395b42220af147f400d
-- ============================================

-- Check if migration already executed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schema_migrations WHERE version = '004_jth_model_data'
  ) THEN
    -- Execute migration
-- JTH Model Data and Sample Content
-- =====================================================
-- ACCURATE JTH MODEL INFORMATION
-- =====================================================

-- Clear existing model data for clean insert
DELETE FROM product_models WHERE model_code LIKE 'JTH-%';

-- Insert accurate JTH models with correct pricing and specifications
INSERT INTO product_models (
    model_code, name, category, series, 
    base_price, weight_kg,
    external_length_mm, external_width_mm, external_height_mm,
    internal_length_mm, internal_width_mm, internal_height_mm,
    horse_capacity, payload_kg,
    build_time_weeks_min, build_time_weeks_max,
    warranty_years, description, features, is_active
) VALUES 
    -- 3.5t Models
    ('JTH-PRIN-35', 'Principle 35', '3.5t', 'Principle',
     35000.00, 1200,
     5500, 2200, 2800,
     3600, 1800, 2000,
     2, 2300,
     8, 10,
     5, -- 5-year structural warranty
     'Entry-level 3.5t horsebox perfect for weekend riders and first-time buyers. Built with JTH quality and reliability.',
     '["LED lighting throughout", "Anti-slip rubber flooring", "Full height breast bar", "Padded divider", "External tack locker", "Grooms door", "2 horse capacity"]'::jsonb,
     true),
    
    ('JTH-PROF-35', 'Professional 35', '3.5t', 'Professional',
     45000.00, 1250,
     5500, 2200, 2800,
     3600, 1800, 2000,
     2, 2250,
     10, 12,
     5,
     'Mid-range 3.5t horsebox with enhanced comfort features and premium finishes. Popular with competition riders.',
     '["Luxury living area", "Hot water system", "Weekender package", "Solar panel ready", "Bluetooth sound system", "Reversing camera", "Air conditioning prep"]'::jsonb,
     true),
    
    ('JTH-PROG-35', 'Progeny 35', '3.5t', 'Progeny',
     55000.00, 1300,
     5500, 2200, 2800,
     3600, 1800, 2000,
     2, 2200,
     12, 14,
     5,
     'Premium 3.5t horsebox with Pioneer Package. Top-of-the-line features for discerning equestrians.',
     '["Pioneer Package included", "Full bathroom", "Luxury kitchen", "100Ah lithium battery", "1000W inverter", "Satellite TV prep", "Premium leather seating", "Underfloor heating"]'::jsonb,
     true),
    
    -- 4.5t Models
    ('JTH-AEOS-EDGE', 'Aeos Edge', '4.5t', 'Aeos',
     65000.00, 1800,
     6500, 2400, 3000,
     4200, 2000, 2100,
     2, 2700,
     12, 14,
     5,
     'Professional 4.5t horsebox with cutting-edge design and maximum payload capacity.',
     '["Increased payload", "Extended living area", "Professional kitchen", "Separate shower room", "200Ah battery bank", "Heavy duty suspension", "Commercial grade components"]'::jsonb,
     true),
    
    ('JTH-AEOS-FREE', 'Aeos Freedom', '4.5t', 'Aeos',
     70000.00, 1850,
     6500, 2400, 3000,
     4200, 2000, 2100,
     3, 2650,
     12, 14,
     5,
     'Family-oriented 4.5t horsebox with space for 3 horses. Perfect for family equestrian activities.',
     '["3 horse capacity", "Family seating area", "Bunk beds option", "Large wardrobe", "Washing machine prep", "Extra storage", "Child safety features"]'::jsonb,
     true),
    
    ('JTH-AEOS-DISC', 'Aeos Discovery', '4.5t', 'Aeos',
     80000.00, 1900,
     7000, 2400, 3000,
     4500, 2000, 2100,
     2, 2600,
     14, 16,
     5,
     'Luxury living 4.5t horsebox with extended accommodation. Your home away from home.',
     '["Extended luxury living", "Full residential kitchen", "Queen size bed", "Separate toilet and shower", "300Ah battery bank", "3000W inverter", "Satellite TV", "Air conditioning"]'::jsonb,
     true),
    
    -- 7.2t Model
    ('JTH-ZENOS-72', 'Zenos 72', '7.2t', 'Zenos',
     120000.00, 2500,
     8000, 2500, 3200,
     5000, 2200, 2300,
     4, 4700,
     16, 20,
     5,
     'Flagship 7.2t horsebox for professional teams and serious competitors. No compromise on quality or features.',
     '["4 horse capacity", "Luxury apartment living", "Full bathroom with shower", "Professional kitchen with oven", "500Ah battery bank", "5000W inverter", "Full air conditioning", "Hydraulic ramp", "CCTV system", "WiFi router included"]'::jsonb,
     true);

-- Insert product options/accessories with accurate pricing
DELETE FROM product_options WHERE code LIKE 'JTH-%';

INSERT INTO product_options (code, name, category, description, unit_price, lead_time_days, is_active)
VALUES 
    -- Pioneer Package Components
    ('JTH-PKG-PIONEER', 'Pioneer Package', 'Packages', 
     'Complete luxury package including premium finishes and advanced technology', 
     8500.00, 0, true),
    
    -- Power Systems
    ('JTH-PWR-LITH100', '100Ah Lithium Battery', 'Power Systems',
     'High-performance lithium battery for extended off-grid capability',
     850.00, 7, true),
    
    ('JTH-PWR-LITH200', '200Ah Lithium Battery Bank', 'Power Systems',
     'Dual lithium battery system for maximum power storage',
     1650.00, 7, true),
    
    ('JTH-PWR-SOL100', '100W Solar Panel', 'Power Systems',
     'Roof-mounted solar panel with MPPT controller',
     450.00, 7, true),
    
    ('JTH-PWR-INV1000', '1000W Pure Sine Inverter', 'Power Systems',
     'Clean power for sensitive electronics',
     650.00, 7, true),
    
    ('JTH-PWR-INV3000', '3000W Pure Sine Inverter', 'Power Systems',
     'Heavy-duty inverter for full off-grid living',
     1850.00, 7, true),
    
    -- Comfort Features
    ('JTH-COM-AC', 'Air Conditioning System', 'Comfort',
     'Roof-mounted AC unit with heating function',
     2850.00, 14, true),
    
    ('JTH-COM-HEAT', 'Diesel Heating System', 'Comfort',
     'Webasto diesel heater with programmable timer',
     1950.00, 14, true),
    
    ('JTH-COM-HW', 'Hot Water System', 'Comfort',
     'Gas/electric hot water system with 10L tank',
     850.00, 7, true),
    
    -- Horse Area Equipment
    ('JTH-HRS-CAM', 'Horse Area Camera System', 'Horse Area',
     'Wireless camera system for monitoring horses',
     650.00, 7, true),
    
    ('JTH-HRS-PADDED', 'Full Padding Package', 'Horse Area',
     'Premium padding for walls and dividers',
     1850.00, 7, true),
    
    ('JTH-HRS-HYDRO', 'Hydraulic Ramp', 'Horse Area',
     'Electric hydraulic ramp for easy loading',
     4500.00, 21, true),
    
    -- Technology
    ('JTH-TEC-WIFI', 'WiFi Router System', 'Technology',
     '4G WiFi router with external antenna',
     450.00, 7, true),
    
    ('JTH-TEC-SAT', 'Satellite TV System', 'Technology',
     'Auto-seeking satellite dish with receiver',
     1850.00, 14, true),
    
    ('JTH-TEC-REV', 'Reversing Camera & Monitor', 'Technology',
     'High-definition reversing camera with 7" monitor',
     450.00, 7, true);

-- Link popular options to models
INSERT INTO model_options (model_id, option_id, is_standard, is_popular)
SELECT 
    pm.id as model_id,
    po.id as option_id,
    false as is_standard,
    true as is_popular
FROM product_models pm
CROSS JOIN product_options po
WHERE 
    (pm.series = 'Progeny' AND po.code = 'JTH-PKG-PIONEER') OR
    (pm.category IN ('3.5t', '4.5t') AND po.code IN ('JTH-PWR-LITH100', 'JTH-COM-HW', 'JTH-TEC-REV')) OR
    (pm.category = '4.5t' AND po.code IN ('JTH-PWR-LITH200', 'JTH-COM-AC')) OR
    (pm.category = '7.2t' AND po.code IN ('JTH-HRS-HYDRO', 'JTH-TEC-WIFI', 'JTH-TEC-SAT'));

-- =====================================================
-- KNOWLEDGE BASE CONTENT
-- =====================================================

-- Insert knowledge base articles for each model
INSERT INTO kb_articles (
    category_id, title, slug, content, summary, 
    author_id, tags, meta_description, is_published, is_featured
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'models'),
    'JTH Principle 35 - Entry Level Excellence',
    'jth-principle-35-guide',
    E'# JTH Principle 35 - Entry Level Excellence\n\n## Overview\nThe Principle 35 is our entry-level 3.5t horsebox, perfect for weekend riders and first-time horsebox buyers. Built with the same JTH quality and attention to detail as our premium models.\n\n## Key Features\n- 2 horse capacity with full-height breast bar\n- LED lighting throughout\n- Anti-slip rubber flooring\n- External tack locker\n- Grooms door for easy access\n\n## Specifications\n- **Base Price**: £35,000 - £40,000\n- **Build Time**: 8-10 weeks\n- **Payload**: 2,300kg\n- **Warranty**: 5-year structural, 2-year components\n\n## Why Choose the Principle 35?\nPerfect for riders who need reliable, safe transport without breaking the bank. Every Principle 35 is built to the same exacting standards as our luxury models.',
    'Entry-level 3.5t horsebox with essential features and JTH build quality',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['3.5t', 'principle', 'entry-level', 'horsebox'],
    'Discover the JTH Principle 35 - affordable 3.5t horsebox with 8-10 week build time',
    true,
    true;

INSERT INTO kb_articles (
    category_id, title, slug, content, summary, 
    author_id, tags, meta_description, is_published, is_featured
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'models'),
    'JTH Professional 35 - The Competition Choice',
    'jth-professional-35-guide',
    E'# JTH Professional 35 - The Competition Choice\n\n## Overview\nThe Professional 35 is our mid-range 3.5t horsebox, featuring enhanced comfort and premium finishes. The choice of competition riders across the UK.\n\n## Key Features\n- Luxury living area with weekender package\n- Hot water system\n- Solar panel ready\n- Bluetooth sound system\n- Reversing camera\n- Air conditioning preparation\n\n## Specifications\n- **Base Price**: £45,000 - £55,000\n- **Build Time**: 10-12 weeks\n- **Payload**: 2,250kg\n- **Warranty**: 5-year structural, 2-year components\n\n## Perfect For\nCompetition riders who spend weekends at shows and need comfort alongside functionality.',
    'Mid-range 3.5t horsebox with luxury living and competition features',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['3.5t', 'professional', 'competition', 'weekender'],
    'JTH Professional 35 - luxury 3.5t horsebox for competition riders',
    true,
    true;

INSERT INTO kb_articles (
    category_id, title, slug, content, summary, 
    author_id, tags, meta_description, is_published, is_featured
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'models'),
    'JTH Progeny 35 with Pioneer Package',
    'jth-progeny-35-pioneer',
    E'# JTH Progeny 35 with Pioneer Package\n\n## Overview\nThe pinnacle of 3.5t horsebox design. The Progeny 35 with Pioneer Package offers luxury car-like features in a horsebox.\n\n## Pioneer Package Includes\n- Full bathroom with toilet and shower\n- Luxury kitchen with all appliances\n- 100Ah lithium battery system\n- 1000W pure sine wave inverter\n- Satellite TV preparation\n- Premium leather seating\n- Underfloor heating\n\n## Specifications\n- **Base Price**: £55,000 - £65,000\n- **Build Time**: 12-14 weeks\n- **Payload**: 2,200kg\n- **Warranty**: 5-year structural, 3-year components with Pioneer Package\n\n## The Ultimate 3.5t\nNo compromise on luxury or functionality. The Progeny 35 is for those who demand the best.',
    'Premium 3.5t horsebox with Pioneer Package luxury features',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['3.5t', 'progeny', 'pioneer-package', 'luxury'],
    'JTH Progeny 35 - premium 3.5t horsebox with Pioneer Package',
    true,
    true;

-- Insert warranty information article
INSERT INTO kb_articles (
    category_id, title, slug, content, summary,
    author_id, tags, meta_description, is_published
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'warranty'),
    'JTH Warranty Coverage Explained',
    'warranty-coverage-explained',
    E'# JTH Warranty Coverage Explained\n\n## Standard Warranty\nAll JTH horseboxes come with comprehensive warranty coverage:\n\n### Structural Warranty - 5 Years\n- Chassis and frame\n- Body shell\n- Floor structure\n- Roof integrity\n\n### Component Warranty - 2 Years\n- Electrical systems\n- Plumbing\n- Windows and doors\n- Interior fittings\n- Horse area equipment\n\n### Cosmetic Warranty - 1 Year\n- Paint finish\n- Interior surfaces\n- Upholstery\n- External graphics\n\n## Extended Warranty Options\n- Additional 2-year component warranty available\n- Additional 3-year structural warranty available\n- Annual service packages to maintain warranty\n\n## What''s Not Covered\n- Normal wear and tear\n- Damage from accidents or misuse\n- Modifications not approved by JTH\n- Consumable items (bulbs, fuses, etc.)',
    'Comprehensive guide to JTH warranty coverage and options',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['warranty', 'coverage', 'service', 'support'],
    'Understanding your JTH horsebox warranty - 5 year structural warranty included',
    true;

-- =====================================================
-- FREQUENTLY ASKED QUESTIONS
-- =====================================================

INSERT INTO faqs (category, question, answer, tags, position, is_published)
VALUES 
    ('General Information', 
     'What is the typical build time for a JTH horsebox?',
     'Build times vary by model: Principle 35 (8-10 weeks), Professional 35 (10-12 weeks), Progeny 35 (12-14 weeks), Aeos models (12-14 weeks), Zenos 72 (16-20 weeks). These are estimates from deposit date and can vary based on specification and current workload.',
     ARRAY['build-time', 'delivery', 'production'],
     1, true),
    
    ('Models & Specifications',
     'What''s the difference between the 3.5t models?',
     'We offer three 3.5t models: Principle 35 (£35-40k, essential features), Professional 35 (£45-55k, enhanced comfort and weekender package), and Progeny 35 (£55-65k, includes Pioneer Package with luxury features). All have the same 2-horse capacity but differ in living accommodation and features.',
     ARRAY['3.5t', 'models', 'comparison', 'pricing'],
     2, true),
    
    ('Models & Specifications',
     'Can I tow a 3.5t horsebox on a car license?',
     'Yes, if you passed your test before 1997, you can tow up to 3.5t on a standard license. If you passed after 1997, you may need to take an additional B+E test depending on your vehicle and trailer combination weight. We recommend checking with DVLA for your specific situation.',
     ARRAY['license', '3.5t', 'towing', 'legal'],
     3, true),
    
    ('Warranty & Service',
     'What warranty comes with a JTH horsebox?',
     'All JTH horseboxes include: 5-year structural warranty (chassis, body, floor, roof), 2-year component warranty (electrical, plumbing, fittings), and 1-year cosmetic warranty. Extended warranties are available, and the Pioneer Package includes an additional year on components.',
     ARRAY['warranty', 'coverage', 'service'],
     4, true),
    
    ('Finance & Payment',
     'What deposit do I need to order?',
     'We typically require a 20% deposit to secure your build slot, with the balance due on completion. We can arrange flexible payment schedules and work with various finance providers to help spread the cost. Contact our sales team for personalized options.',
     ARRAY['deposit', 'payment', 'finance', 'ordering'],
     5, true),
    
    ('Ordering & Delivery',
     'Can I visit during the build?',
     'Absolutely! We encourage customers to visit our York workshop during the build process. We''ll provide regular photo updates through our customer portal, and you''re welcome to book visits to see your horsebox taking shape. Final inspection before collection is standard.',
     ARRAY['visit', 'workshop', 'build-updates', 'collection'],
     6, true),
    
    ('Models & Specifications',
     'What''s included in the Pioneer Package?',
     'The Pioneer Package (standard on Progeny 35) includes: full bathroom, luxury kitchen, 100Ah lithium battery, 1000W inverter, satellite TV prep, premium leather seating, underfloor heating, and enhanced warranty. It adds approximately £8,500 to the base price.',
     ARRAY['pioneer-package', 'progeny', 'features', 'luxury'],
     7, true),
    
    ('General Information',
     'Where are JTH horseboxes built?',
     'All JTH horseboxes are hand-built in our workshop in York, North Yorkshire. We''ve been building quality horseboxes since 2010, with over 500 satisfied customers across the UK and Ireland.',
     ARRAY['location', 'workshop', 'york', 'manufacturing'],
     8, true),
    
    ('Ordering & Delivery',
     'Do you deliver nationwide?',
     'Yes, we deliver throughout the UK and Ireland. Delivery within 100 miles of York is included in the price. For longer distances, we charge a nominal fee. We can also arrange collection from our York workshop if you prefer.',
     ARRAY['delivery', 'nationwide', 'collection'],
     9, true),
    
    ('Finance & Payment',
     'Do you offer finance options?',
     'Yes, we work with several specialist horsebox finance providers offering competitive rates. Options include hire purchase, lease purchase, and personal loans. Terms from 1-7 years available subject to status. Our sales team can provide a personalized quote.',
     ARRAY['finance', 'payment-options', 'hire-purchase'],
     10, true);

-- =====================================================
-- SAMPLE CUSTOMER DATA FOR TESTING
-- =====================================================

-- Sample leads in different stages
INSERT INTO leads (organization_id, contact_id, source, stage, status, score, notes)
VALUES
    -- New inquiry
    ((SELECT id FROM organizations WHERE name = 'Kathy Webb Equestrian'),
     (SELECT id FROM contacts WHERE email = 'kathy.webb@example.com'),
     'website', 'inquiry', 'new', 10,
     'Interested in Professional 35, wants weekender package'),
    
    -- Qualification stage
    ('a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000002',
     'phone', 'qualification', 'active', 30,
     'Budget confirmed, looking at Principle 35 or Professional 35'),
    
    -- Specification stage
    ('a0000000-0000-0000-0000-000000000003',
     'b0000000-0000-0000-0000-000000000003',
     'referral', 'specification', 'active', 50,
     'Progeny 35 with Pioneer Package, custom color scheme requested'),
    
    -- Quotation stage
    ('a0000000-0000-0000-0000-000000000004',
     'b0000000-0000-0000-0000-000000000004',
     'show', 'quotation', 'active', 70,
     'Aeos Freedom for family use, quote sent last week');

-- Insert sample organization and contacts for the leads above
INSERT INTO organizations (id, name, type) VALUES
    ('a0000000-0000-0000-0000-000000000002', 'Smith Equestrian', 'individual'),
    ('a0000000-0000-0000-0000-000000000003', 'Johnson Stables', 'business'),
    ('a0000000-0000-0000-0000-000000000004', 'Williams Family', 'individual');

INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone) VALUES
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
     'John', 'Smith', 'john.smith@example.com', '07700900001'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
     'Sarah', 'Johnson', 'sarah@johnsonstables.com', '07700900002'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
     'David', 'Williams', 'david.williams@example.com', '07700900003');

-- Sample production job with stages
INSERT INTO production_jobs (
    job_number, order_id, model_id, status, current_stage,
    start_date, target_date, hours_estimated, notes
)
SELECT 
    'JOB-2025-001',
    (SELECT id FROM orders LIMIT 1),
    (SELECT id FROM product_models WHERE model_code = 'JTH-PROF-35'),
    'in_progress',
    'Interior Fit Out',
    CURRENT_DATE - INTERVAL '2 weeks',
    CURRENT_DATE + INTERVAL '4 weeks',
    160,
    'Professional 35 for Kathy Webb - Blue exterior, cream interior';

-- Add production stages for the job
INSERT INTO production_stages (
    job_id, stage_name, stage_order, status, 
    estimated_hours, completion_percentage
)
SELECT 
    (SELECT id FROM production_jobs WHERE job_number = 'JOB-2025-001'),
    stage_name,
    stage_order,
    status,
    estimated_hours,
    completion_percentage
FROM (VALUES
    ('Chassis Preparation', 1, 'completed', 16, 100),
    ('Floor & Walls', 2, 'completed', 24, 100),
    ('Electrical Installation', 3, 'completed', 16, 100),
    ('Plumbing', 4, 'completed', 12, 100),
    ('Interior Fit Out', 5, 'in_progress', 32, 60),
    ('Painting', 6, 'pending', 20, 0),
    ('Testing & QC', 7, 'pending', 8, 0),
    ('Final Inspection', 8, 'pending', 4, 0)
) AS stages(stage_name, stage_order, status, estimated_hours, completion_percentage);

-- Sample build updates for customer portal
INSERT INTO build_updates (
    job_id, title, description, update_type, is_customer_visible
)
SELECT 
    (SELECT id FROM production_jobs WHERE job_number = 'JOB-2025-001'),
    title,
    description,
    update_type,
    true
FROM (VALUES
    ('Chassis Complete', 'Chassis preparation completed and moved to body shop', 'milestone'),
    ('Walls and Floor Installed', 'Insulated floor and walls are now in place', 'milestone'),
    ('Electrical System Installed', 'All wiring complete, LED lights fitted throughout', 'milestone'),
    ('Interior Work Started', 'Cabinet installation has begun in the living area', 'progress')
) AS updates(title, description, update_type);

-- =====================================================
-- MODEL SPECIFICATIONS FOR KNOWLEDGE BASE
-- =====================================================

INSERT INTO kb_model_specs (
    model_id, spec_category, spec_name, spec_value, spec_unit, is_highlight, position
)
SELECT 
    pm.id,
    spec.category,
    spec.name,
    spec.value,
    spec.unit,
    spec.highlight,
    spec.position
FROM product_models pm
CROSS JOIN (VALUES
    -- Weight & Dimensions
    ('Dimensions', 'Gross Vehicle Weight', '3500', 'kg', true, 1),
    ('Dimensions', 'Unladen Weight', '1200-1300', 'kg', false, 2),
    ('Dimensions', 'Payload Capacity', '2200-2300', 'kg', true, 3),
    ('Dimensions', 'External Length', '5.5', 'm', false, 4),
    ('Dimensions', 'External Width', '2.2', 'm', false, 5),
    ('Dimensions', 'External Height', '2.8', 'm', false, 6),
    
    -- Horse Area
    ('Horse Area', 'Horse Capacity', '2', 'horses', true, 10),
    ('Horse Area', 'Stall Length', '1.8', 'm', false, 11),
    ('Horse Area', 'Stall Width', '0.9', 'm', false, 12),
    ('Horse Area', 'Internal Height', '2.0', 'm', false, 13),
    ('Horse Area', 'Floor Type', 'Anti-slip rubber', '', false, 14),
    
    -- Living Area
    ('Living Area', 'Seating Capacity', '4', 'persons', false, 20),
    ('Living Area', 'Bed Configuration', 'Luton overcab', '', false, 21),
    ('Living Area', 'Kitchen Type', 'Varies by model', '', false, 22),
    ('Living Area', 'Water Tank', '80', 'litres', false, 23),
    
    -- Power & Technology
    ('Power', 'Leisure Battery', '100-200', 'Ah', false, 30),
    ('Power', 'Solar Panel Option', 'Yes', '', false, 31),
    ('Power', 'Inverter Option', '1000-3000', 'W', false, 32),
    ('Power', 'USB Outlets', '4-8', 'ports', false, 33)
) AS spec(category, name, value, unit, highlight, position)
WHERE pm.category = '3.5t';

-- =====================================================
-- INITIALIZE COUNTERS AND SETTINGS
-- =====================================================

-- Reset order number sequence
ALTER SEQUENCE IF EXISTS order_number_seq RESTART WITH 1001;

-- Update system settings for production
UPDATE system_settings 
SET value = jsonb_set(value, '{max_concurrent_builds}', '5')
WHERE key = 'production_stages';

-- Create notification for admin about database setup
INSERT INTO activity_logs (
    entity_type, entity_id, action, performed_by, details
) VALUES (
    'system', uuid_generate_v4(), 'database_initialized',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    jsonb_build_object(
        'message', 'JTH database initialized with models, knowledge base, and sample data',
        'timestamp', NOW(),
        'version', '1.0.0'
    )
);

    -- Record successful execution
    INSERT INTO public.schema_migrations (version, checksum, success)
    VALUES ('004_jth_model_data', 'c3476d460aafa671e3a76579b41eb7c4d139a100502e7395b42220af147f400d', true);
    
    RAISE NOTICE 'Migration 004_jth_model_data executed successfully';
  ELSE
    RAISE NOTICE 'Migration 004_jth_model_data already executed, skipping';
  END IF;
END $$;

