-- Complete database setup for JTH Admin Backend
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create profiles table for admin users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
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

-- Blog Posts Table
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

-- Pricing Options Table
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

-- Knowledge Base Table
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

-- Lead Activities Table
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    performed_by UUID REFERENCES auth.users(id)
);

-- Saved Configurations Table
CREATE TABLE IF NOT EXISTS saved_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    name VARCHAR(255),
    model VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    total_price DECIMAL(10, 2),
    share_token VARCHAR(100) UNIQUE,
    is_public BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_options_model ON pricing_options(model);
CREATE INDEX IF NOT EXISTS idx_pricing_options_category ON pricing_options(model, category);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- Create vector index for knowledge base
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for leads (admin only for management, public for creation)
CREATE POLICY "Public can create leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all leads" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update leads" ON leads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete leads" ON leads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for blog posts
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT USING (status = 'published' OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for pricing options
CREATE POLICY "Public can view available pricing" ON pricing_options
    FOR SELECT USING (is_available = true OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage pricing" ON pricing_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for knowledge base
CREATE POLICY "Public can view published knowledge" ON knowledge_base
    FOR SELECT USING (is_published = true OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage knowledge base" ON knowledge_base
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for lead activities
CREATE POLICY "Admins can manage lead activities" ON lead_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for saved configurations
CREATE POLICY "Users can manage own configurations" ON saved_configurations
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Function for vector similarity search
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
    AND 1 - (kb.embedding <=> query_embedding) > similarity_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to update updated_at timestamp
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

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'user'));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample pricing data
INSERT INTO pricing_options (model, category, name, price, description, display_order) VALUES
-- 3.5t Model
('3.5t', 'Base Model', 'JTH Professional 3.5t', 25000, 'Base 3.5 tonne horsebox', 1),
('3.5t', 'Exterior', 'Metallic Paint', 1500, 'Premium metallic paint finish', 2),
('3.5t', 'Exterior', 'Alloy Wheels', 800, 'Lightweight alloy wheels', 3),
('3.5t', 'Interior', 'Leather Seats', 1200, 'Premium leather seating', 4),
('3.5t', 'Interior', 'Living Area Package', 2500, 'Full living area with bed and kitchen', 5),
('3.5t', 'Safety', 'Reverse Camera', 450, 'Rear view camera system', 6),
('3.5t', 'Safety', 'Horse Monitor System', 650, 'Internal CCTV for horse area', 7),

-- 4.5t Model
('4.5t', 'Base Model', 'JTH Elite 4.5t', 35000, 'Base 4.5 tonne horsebox', 1),
('4.5t', 'Exterior', 'Metallic Paint', 1500, 'Premium metallic paint finish', 2),
('4.5t', 'Exterior', 'Alloy Wheels', 950, 'Heavy duty alloy wheels', 3),
('4.5t', 'Interior', 'Leather Seats', 1200, 'Premium leather seating', 4),
('4.5t', 'Interior', 'Deluxe Living Package', 3500, 'Deluxe living with shower and toilet', 5),
('4.5t', 'Safety', 'Full Camera System', 850, '360 degree camera system', 6),
('4.5t', 'Horse Area', 'Rubber Matting', 450, 'Premium rubber floor matting', 7),

-- 7.2t Model
('7.2t', 'Base Model', 'JTH Supreme 7.2t', 48000, 'Base 7.2 tonne horsebox', 1),
('7.2t', 'Exterior', 'Custom Paint', 2500, 'Custom paint design', 2),
('7.2t', 'Exterior', 'Chrome Package', 1200, 'Chrome exterior accessories', 3),
('7.2t', 'Interior', 'Luxury Living Suite', 5500, 'Full luxury living accommodation', 4),
('7.2t', 'Horse Area', 'Hydraulic Partition', 2200, 'Hydraulic moveable partition', 5),
('7.2t', 'Technology', 'Satellite System', 1800, 'Satellite TV and internet', 6),
('7.2t', 'Safety', 'Advanced Safety Pack', 2400, 'Full safety system with monitoring', 7);

-- Insert sample knowledge base entries
INSERT INTO knowledge_base (title, content, category, tags, source) VALUES
('Horsebox Maintenance Guide', 'Regular maintenance is crucial for your horsebox. Check tyre pressure monthly, service engine every 10,000 miles, and inspect the horse area flooring weekly for damage.', 'Maintenance', ARRAY['maintenance', 'safety', 'guide'], 'manual'),
('Choosing the Right Horsebox Size', 'The 3.5t model is perfect for one or two horses and can be driven on a car license. The 4.5t offers more living space, while the 7.2t is ideal for professional use with multiple horses.', 'Buying Guide', ARRAY['models', 'sizing', 'guide'], 'faq'),
('Safety Features Explained', 'Our horseboxes include anti-slip flooring, internal CCTV, emergency exits, and ventilation systems designed for horse comfort and safety during transport.', 'Safety', ARRAY['safety', 'features', 'transport'], 'documentation'),
('Warranty Information', 'All JTH horseboxes come with a comprehensive 2-year warranty covering mechanical components and a 5-year warranty on the chassis and body structure.', 'Warranty', ARRAY['warranty', 'support', 'coverage'], 'documentation'),
('Finance Options Available', 'We offer flexible finance packages including hire purchase and lease options. Typical APR from 5.9% with deposits from 10% of the purchase price.', 'Finance', ARRAY['finance', 'payment', 'options'], 'faq');

-- Create an admin user (you'll need to update the email)
-- First create the user through Supabase Auth dashboard, then run:
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');

COMMIT;