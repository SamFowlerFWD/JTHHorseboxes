-- ======================================================
-- Core tables, RLS policies, and indexes
-- File: 01_core_tables_and_rls
-- Original: apps/web/supabase/deploy-migration.sql
-- Generated: 2025-08-22T15:17:20.943Z
-- ======================================================

-- ===================================================================
-- JTH Operations Platform - Complete Database Setup
-- ===================================================================
-- This file contains all migrations needed for production deployment
-- Run this in your Supabase SQL Editor or via psql
-- ===================================================================

-- ===== STEP 1: ENABLE EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ===== STEP 2: CORE TABLES =====

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Lead Details
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    
    -- Configuration if from configurator
    configuration JSONB,
    quote_amount DECIMAL(10, 2),
    
    -- Marketing
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- GDPR
    consent_marketing BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    
    CONSTRAINT unique_email_per_day UNIQUE (email, DATE(created_at))
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    
    -- SEO
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    keywords TEXT[],
    
    -- Author (reference to auth.users)
    author_id UUID REFERENCES auth.users(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    
    -- Categories
    category VARCHAR(100),
    tags TEXT[]
);

-- Configurator Pricing Options
CREATE TABLE IF NOT EXISTS pricing_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Model Information
    model VARCHAR(50) NOT NULL, -- '3.5t', '4.5t', '7.2t'
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Option Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    vat_rate DECIMAL(4, 2) DEFAULT 20.00,
    
    -- Configuration
    is_default BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    dependencies JSONB,
    incompatible_with JSONB,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    
    CONSTRAINT unique_model_category_name UNIQUE (model, category, name)
);

-- Knowledge Base for RAG
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    
    -- Metadata
    source VARCHAR(100), -- 'manual', 'faq', 'documentation', 'product'
    source_url VARCHAR(500),
    
    -- Vector embedding for similarity search
    embedding vector(1536), -- OpenAI ada-002 embeddings
    
    -- Status
    is_published BOOLEAN DEFAULT true,
    
    -- Search optimization
    search_keywords TEXT,
    relevance_score DECIMAL(3, 2) DEFAULT 1.00
);

-- Saved Configurations
CREATE TABLE IF NOT EXISTS saved_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Owner (nullable for anonymous saves)
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    
    -- Configuration
    name VARCHAR(255),
    model VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    total_price DECIMAL(10, 2),
    
    -- Sharing
    share_token VARCHAR(100) UNIQUE,
    is_public BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    
    -- Expiry for anonymous configs
    expires_at TIMESTAMPTZ
);

-- Lead Activities/Interactions
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    
    -- User who performed the action
    performed_by UUID REFERENCES auth.users(id)
);

-- ===== STEP 3: OPERATIONS TABLES =====

-- Production Builds Tracking
CREATE TABLE IF NOT EXISTS production_builds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Build Details
    build_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(100),
    customer_name VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'planned',
    stage VARCHAR(100),
    priority INTEGER DEFAULT 0,
    
    -- Dates
    start_date DATE,
    target_completion DATE,
    actual_completion DATE,
    
    -- Configuration
    configuration JSONB,
    special_requirements TEXT,
    
    -- Assignment
    assigned_team VARCHAR(100),
    project_manager VARCHAR(255)
);

-- Production Pipeline Stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    build_id UUID REFERENCES production_builds(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    notes TEXT,
    completed_by VARCHAR(255),
    
    -- Quality checks
    quality_check_passed BOOLEAN,
    quality_notes TEXT
);

-- ===== STEP 4: CREATE INDEXES =====

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Blog indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Pricing indexes
CREATE INDEX IF NOT EXISTS idx_pricing_options_model ON pricing_options(model);
CREATE INDEX IF NOT EXISTS idx_pricing_options_category ON pricing_options(model, category);

-- Knowledge base indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- Saved configurations indexes
CREATE INDEX IF NOT EXISTS idx_saved_configurations_user ON saved_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_configurations_token ON saved_configurations(share_token);

-- Production indexes
CREATE INDEX IF NOT EXISTS idx_production_builds_status ON production_builds(status);
CREATE INDEX IF NOT EXISTS idx_production_builds_number ON production_builds(build_number);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_build ON pipeline_stages(build_id);

-- ===== STEP 5: ROW LEVEL SECURITY =====

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage leads" ON leads;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage pricing" ON pricing_options;
DROP POLICY IF EXISTS "Admins can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can read available pricing" ON pricing_options;
DROP POLICY IF EXISTS "Public can read published knowledge" ON knowledge_base;
DROP POLICY IF EXISTS "Public can create leads" ON leads;
DROP POLICY IF EXISTS "Users can manage own configurations" ON saved_configurations;
DROP POLICY IF EXISTS "Admins can manage production" ON production_builds;
DROP POLICY IF EXISTS "Admins can manage pipeline" ON pipeline_stages;

-- Admin policies
CREATE POLICY "Admins can manage leads" ON leads
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage blog posts" ON blog_posts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage pricing" ON pricing_options
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage knowledge base" ON knowledge_base
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage production" ON production_builds
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'ops');

CREATE POLICY "Admins can manage pipeline" ON pipeline_stages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'ops');

-- Public policies
CREATE POLICY "Public can read published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read available pricing" ON pricing_options
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public can read published knowledge" ON knowledge_base
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can create leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage own configurations" ON saved_configurations
    FOR ALL USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- ===== STEP 6: FUNCTIONS AND TRIGGERS =====

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_options_updated_at BEFORE UPDATE ON pricing_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_configurations_updated_at BEFORE UPDATE ON saved_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_builds_updated_at BEFORE UPDATE ON production_builds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== STEP 7: STORAGE BUCKETS =====

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('gallery', 'gallery', true),
    ('documents', 'documents', false),
    ('configurator', 'configurator', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view gallery images" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update gallery images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'gallery' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete gallery images" ON storage.objects
    FOR DELETE USING (bucket_id = 'gallery' AND auth.jwt() ->> 'role' = 'admin');

-- ===== STEP 8: INSERT DEMO DATA =====

-- Insert sample knowledge base entries for JTH models
INSERT INTO knowledge_base (title, content, category, tags, source, is_published) VALUES
('JTH Principle 3.5t Overview', 'The JTH Principle 3.5t is our entry-level professional horsebox, designed for single or dual horse transport. Features include aluminum construction, full tack locker, and integrated living space. Perfect for weekend competitors and professional transporters.', 'products', ARRAY['3.5t', 'principle', 'horsebox'], 'product', true),
('JTH Professional 3.5t Features', 'The Professional 3.5t model offers premium features including hydraulic ramp, extended living area with kitchen facilities, solar panels, and advanced horse monitoring systems. Ideal for serious competitors requiring comfort and reliability.', 'products', ARRAY['3.5t', 'professional', 'features'], 'product', true),
('JTH Progeny 3.5t Specifications', 'The Progeny 3.5t represents the pinnacle of 3.5-tonne horsebox design. Luxury living quarters, state-of-the-art horse area with CCTV, full bathroom facilities, and bespoke customization options. The ultimate choice for elite equestrian professionals.', 'products', ARRAY['3.5t', 'progeny', 'luxury'], 'product', true),
('Maintenance Schedule', 'Regular maintenance is crucial for horsebox longevity. Check tyre pressure weekly, service ramp hydraulics every 3 months, annual habitation check recommended. Full service intervals: 10,000 miles or 12 months.', 'maintenance', ARRAY['maintenance', 'service', 'safety'], 'documentation', true),
('Warranty Information', 'All JTH horseboxes come with comprehensive warranty: 5 years structural, 3 years mechanical, 2 years habitation. Extended warranty options available. Regular servicing at approved centers required to maintain warranty.', 'warranty', ARRAY['warranty', 'guarantee', 'support'], 'documentation', true)
ON CONFLICT DO NOTHING;

-- Insert sample pricing options
INSERT INTO pricing_options (model, category, name, description, price, is_default, is_available, display_order) VALUES
('3.5t', 'base', 'Principle Base Model', 'Entry-level 3.5t horsebox with essential features', 45000.00, true, true, 1),
('3.5t', 'base', 'Professional Base Model', 'Mid-range 3.5t with enhanced features', 55000.00, false, true, 2),
('3.5t', 'base', 'Progeny Base Model', 'Premium 3.5t with luxury specifications', 65000.00, false, true, 3),
('3.5t', 'exterior', 'Metallic Paint', 'Premium metallic paint finish', 1500.00, false, true, 1),
('3.5t', 'exterior', 'Graphics Package', 'Custom vinyl graphics and branding', 800.00, false, true, 2),
('3.5t', 'interior', 'Leather Upholstery', 'Premium leather seating surfaces', 2000.00, false, true, 1),
('3.5t', 'interior', 'Extended Kitchen', 'Full kitchen with oven and larger fridge', 3500.00, false, true, 2),
('3.5t', 'technology', 'Solar Panel System', '200W solar panel with leisure battery', 1800.00, false, true, 1),
('3.5t', 'technology', 'Horse Camera System', 'CCTV monitoring for horse area', 1200.00, false, true, 2),
('3.5t', 'safety', 'Emergency Kit', 'Complete first aid and breakdown kit', 350.00, false, true, 1)
ON CONFLICT (model, category, name) DO NOTHING;

-- Create an admin user for testing (password: JTHAdmin2025!)
-- Note: This should be done through Supabase Auth UI in production
-- This is just for reference

-- ===== VERIFICATION QUERIES =====
-- Run these to verify setup:

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- ===== END OF MIGRATION =====
-- Database is now ready for production use!