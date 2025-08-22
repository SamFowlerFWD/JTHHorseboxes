-- Safe Setup for JTH Admin Backend (Handles Existing Objects)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nsbybnsmhvviofzfgphb/sql/new

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create or update profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table if not exists
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    configuration JSONB,
    quote_amount DECIMAL(10, 2),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    consent_marketing BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMPTZ
);

-- Create lead activities table if not exists
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    performed_by UUID REFERENCES auth.users(id)
);

-- Create blog posts table if not exists
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    keywords TEXT[],
    author_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    category VARCHAR(100),
    tags TEXT[]
);

-- Create pricing options table if not exists
CREATE TABLE IF NOT EXISTS pricing_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    model VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    vat_rate DECIMAL(4, 2) DEFAULT 20.00,
    is_default BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    dependencies JSONB,
    incompatible_with JSONB,
    display_order INTEGER DEFAULT 0,
    image_url VARCHAR(500)
);

-- Create knowledge base table if not exists
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    source VARCHAR(100),
    source_url VARCHAR(500),
    embedding vector(1536),
    is_published BOOLEAN DEFAULT true,
    search_keywords TEXT,
    relevance_score DECIMAL(3, 2) DEFAULT 1.00
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    
    -- Leads policies
    DROP POLICY IF EXISTS "Public can create leads" ON leads;
    DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
    DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
    DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;
    
    -- Lead activities policies
    DROP POLICY IF EXISTS "Authenticated users can manage activities" ON lead_activities;
    
    -- Blog posts policies
    DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
    DROP POLICY IF EXISTS "Authenticated users can manage posts" ON blog_posts;
    
    -- Pricing policies
    DROP POLICY IF EXISTS "Public can view available pricing" ON pricing_options;
    DROP POLICY IF EXISTS "Authenticated users can manage pricing" ON pricing_options;
    
    -- Knowledge base policies
    DROP POLICY IF EXISTS "Public can view published knowledge" ON knowledge_base;
    DROP POLICY IF EXISTS "Authenticated users can manage knowledge" ON knowledge_base;
END $$;

-- Create new policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Leads (simplified for testing)
CREATE POLICY "Public can create leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads" ON leads
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update leads" ON leads
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete leads" ON leads
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Lead activities
CREATE POLICY "Authenticated users can manage activities" ON lead_activities
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Blog posts
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage posts" ON blog_posts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Pricing
CREATE POLICY "Public can view available pricing" ON pricing_options
    FOR SELECT USING (is_available = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage pricing" ON pricing_options
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Knowledge base
CREATE POLICY "Public can view published knowledge" ON knowledge_base
    FOR SELECT USING (is_published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage knowledge" ON knowledge_base
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create or replace functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'user'))
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_options_updated_at ON pricing_options;
CREATE TRIGGER update_pricing_options_updated_at BEFORE UPDATE ON pricing_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_pricing_options_model ON pricing_options(model);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- Vector search function for knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    category text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        1 - (kb.embedding <=> query_embedding) AS similarity
    FROM knowledge_base kb
    WHERE kb.is_published = true
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > similarity_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Insert sample pricing data (only if table is empty)
INSERT INTO pricing_options (model, category, name, price, description, display_order)
SELECT * FROM (VALUES
    ('3.5t', 'Base Model', 'JTH Professional 3.5t', 25000, 'Base 3.5 tonne horsebox', 1),
    ('3.5t', 'Exterior', 'Metallic Paint', 1500, 'Premium metallic paint finish', 2),
    ('4.5t', 'Base Model', 'JTH Elite 4.5t', 35000, 'Base 4.5 tonne horsebox', 1),
    ('7.2t', 'Base Model', 'JTH Supreme 7.2t', 48000, 'Base 7.2 tonne horsebox', 1)
) AS v(model, category, name, price, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM pricing_options LIMIT 1);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Setup completed successfully! Tables created: leads, blog_posts, pricing_options, knowledge_base';
END $$;