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