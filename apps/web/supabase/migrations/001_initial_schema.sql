-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Admin Users Table (using Supabase Auth)
-- Admin users will be managed through Supabase Auth with metadata

-- Leads Table
CREATE TABLE leads (
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
CREATE TABLE blog_posts (
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
CREATE TABLE pricing_options (
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
    dependencies JSONB, -- Other options this depends on
    incompatible_with JSONB, -- Options that can't be selected with this
    
    -- Display
    display_order INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    
    CONSTRAINT unique_model_category_name UNIQUE (model, category, name)
);

-- Knowledge Base for RAG
CREATE TABLE knowledge_base (
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
CREATE TABLE saved_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Owner (nullable for anonymous saves)
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255), -- For anonymous users
    
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
CREATE TABLE lead_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'email_sent', 'quote_viewed', 'call_made', etc.
    description TEXT,
    metadata JSONB,
    
    -- User who performed the action
    performed_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE INDEX idx_pricing_options_model ON pricing_options(model);
CREATE INDEX idx_pricing_options_category ON pricing_options(model, category);

CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);

CREATE INDEX idx_saved_configurations_user ON saved_configurations(user_id);
CREATE INDEX idx_saved_configurations_token ON saved_configurations(share_token);

-- Row Level Security Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Admin users can do everything
CREATE POLICY "Admins can manage leads" ON leads
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage blog posts" ON blog_posts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage pricing" ON pricing_options
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage knowledge base" ON knowledge_base
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

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

-- Functions for updated_at trigger
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