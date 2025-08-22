-- Enhanced schema improvements and additional features
-- This migration enhances the initial schema with better RLS, functions, and performance optimizations

-- =====================================================
-- ENHANCED RLS POLICIES
-- =====================================================

-- Drop existing basic policies to replace with more comprehensive ones
DROP POLICY IF EXISTS "Admins can manage leads" ON leads;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage pricing" ON pricing_options;
DROP POLICY IF EXISTS "Admins can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Public can create leads" ON leads;
DROP POLICY IF EXISTS "Users can manage own configurations" ON saved_configurations;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- LEADS - Enhanced RLS
-- =====================================================

-- Admins can do everything
CREATE POLICY "leads_admin_all" ON leads
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- Public can create leads (for contact forms)
CREATE POLICY "leads_public_insert" ON leads
    FOR INSERT 
    WITH CHECK (
        -- Ensure required fields are present
        first_name IS NOT NULL AND 
        last_name IS NOT NULL AND 
        email IS NOT NULL
    );

-- Users can view their own leads (by email)
CREATE POLICY "leads_own_select" ON leads
    FOR SELECT 
    USING (
        auth.jwt() ->> 'email' = email
    );

-- =====================================================
-- BLOG POSTS - Enhanced RLS
-- =====================================================

-- Admins can manage all posts
CREATE POLICY "blog_posts_admin_all" ON blog_posts
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- Public can read published posts
CREATE POLICY "blog_posts_public_select" ON blog_posts
    FOR SELECT 
    USING (
        status = 'published' AND 
        (published_at IS NULL OR published_at <= NOW())
    );

-- Authors can edit their own drafts
CREATE POLICY "blog_posts_author_update" ON blog_posts
    FOR UPDATE 
    USING (
        auth.uid() = author_id AND 
        status = 'draft'
    )
    WITH CHECK (
        auth.uid() = author_id AND 
        status IN ('draft', 'review')
    );

-- =====================================================
-- PRICING OPTIONS - Enhanced RLS
-- =====================================================

-- Admins can manage all pricing
CREATE POLICY "pricing_admin_all" ON pricing_options
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- Public can read available pricing
CREATE POLICY "pricing_public_select" ON pricing_options
    FOR SELECT 
    USING (is_available = true);

-- =====================================================
-- KNOWLEDGE BASE - Enhanced RLS
-- =====================================================

-- Admins can manage all content
CREATE POLICY "knowledge_admin_all" ON knowledge_base
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- Public can read published content
CREATE POLICY "knowledge_public_select" ON knowledge_base
    FOR SELECT 
    USING (is_published = true);

-- =====================================================
-- SAVED CONFIGURATIONS - Enhanced RLS
-- =====================================================

-- Admins can view all configurations
CREATE POLICY "configs_admin_select" ON saved_configurations
    FOR SELECT 
    USING (auth.is_admin());

-- Users can manage their own configurations
CREATE POLICY "configs_user_all" ON saved_configurations
    FOR ALL 
    USING (
        auth.uid() = user_id OR 
        (user_id IS NULL AND is_public = true)
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

-- Public can view shared configurations
CREATE POLICY "configs_public_select" ON saved_configurations
    FOR SELECT 
    USING (
        is_public = true OR 
        share_token IS NOT NULL
    );

-- =====================================================
-- LEAD ACTIVITIES - Enhanced RLS
-- =====================================================

-- Admins can manage all activities
CREATE POLICY "activities_admin_all" ON lead_activities
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- =====================================================
-- VECTOR SEARCH FUNCTIONS
-- =====================================================

-- Function for semantic search in knowledge base
CREATE OR REPLACE FUNCTION search_knowledge(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    similarity FLOAT
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
        kb.tags,
        1 - (kb.embedding <=> query_embedding) AS similarity
    FROM knowledge_base kb
    WHERE 
        kb.is_published = true AND
        1 - (kb.embedding <=> query_embedding) > match_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function for hybrid search (semantic + keyword)
CREATE OR REPLACE FUNCTION hybrid_search_knowledge(
    query_embedding vector(1536),
    search_query TEXT DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    similarity FLOAT,
    relevance FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH semantic_search AS (
        SELECT 
            kb.id,
            kb.title,
            kb.content,
            kb.category,
            kb.tags,
            1 - (kb.embedding <=> query_embedding) AS similarity,
            kb.relevance_score
        FROM knowledge_base kb
        WHERE 
            kb.is_published = true AND
            1 - (kb.embedding <=> query_embedding) > match_threshold
    ),
    keyword_search AS (
        SELECT 
            kb.id,
            ts_rank_cd(
                to_tsvector('english', kb.title || ' ' || kb.content || ' ' || COALESCE(kb.search_keywords, '')),
                plainto_tsquery('english', search_query)
            ) AS keyword_rank
        FROM knowledge_base kb
        WHERE 
            search_query IS NOT NULL AND
            kb.is_published = true AND
            to_tsvector('english', kb.title || ' ' || kb.content || ' ' || COALESCE(kb.search_keywords, '')) 
            @@ plainto_tsquery('english', search_query)
    )
    SELECT 
        s.id,
        s.title,
        s.content,
        s.category,
        s.tags,
        s.similarity,
        CASE 
            WHEN k.keyword_rank IS NOT NULL 
            THEN (s.similarity * 0.7 + k.keyword_rank * 0.3) * s.relevance_score
            ELSE s.similarity * s.relevance_score
        END AS relevance
    FROM semantic_search s
    LEFT JOIN keyword_search k ON s.id = k.id
    ORDER BY relevance DESC
    LIMIT match_count;
END;
$$;

-- =====================================================
-- ADMIN DASHBOARD FUNCTIONS
-- =====================================================

-- Function to get lead statistics
CREATE OR REPLACE FUNCTION get_lead_stats(
    date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_leads BIGINT,
    new_leads BIGINT,
    qualified_leads BIGINT,
    converted_leads BIGINT,
    avg_quote_amount NUMERIC,
    conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH lead_counts AS (
        SELECT 
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'new') AS new,
            COUNT(*) FILTER (WHERE status = 'qualified') AS qualified,
            COUNT(*) FILTER (WHERE status = 'converted') AS converted,
            AVG(quote_amount) FILTER (WHERE quote_amount IS NOT NULL) AS avg_quote
        FROM leads
        WHERE created_at BETWEEN date_from AND date_to
    )
    SELECT 
        total,
        new,
        qualified,
        converted,
        ROUND(avg_quote, 2),
        CASE 
            WHEN total > 0 
            THEN ROUND((converted::NUMERIC / total::NUMERIC) * 100, 2)
            ELSE 0
        END AS conversion_rate
    FROM lead_counts;
END;
$$;

-- Function to clean up expired anonymous configurations
CREATE OR REPLACE FUNCTION cleanup_expired_configurations()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM saved_configurations
    WHERE 
        user_id IS NULL AND 
        expires_at IS NOT NULL AND 
        expires_at < NOW();
END;
$$;

-- =====================================================
-- ADDITIONAL TABLES
-- =====================================================

-- Admin audit log for compliance
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_log_user ON admin_audit_log(user_id);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON admin_audit_log(action);

-- Email templates for automated communications
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB, -- Expected variables for template
    is_active BOOLEAN DEFAULT true
);

-- Quote history
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    lead_id UUID REFERENCES leads(id),
    configuration_id UUID REFERENCES saved_configurations(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2),
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'draft',
    pdf_url VARCHAR(500),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_quotes_lead ON quotes(lead_id);
CREATE INDEX idx_quotes_number ON quotes(quote_number);
CREATE INDEX idx_quotes_status ON quotes(status);

-- Enable RLS on new tables
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- RLS for new tables
CREATE POLICY "audit_admin_only" ON admin_audit_log
    FOR ALL USING (auth.is_admin());

CREATE POLICY "templates_admin_all" ON email_templates
    FOR ALL USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

CREATE POLICY "quotes_admin_all" ON quotes
    FOR ALL USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

CREATE POLICY "quotes_lead_view" ON quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = quotes.lead_id 
            AND leads.email = auth.jwt() ->> 'email'
        )
    );

-- Triggers for new tables
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FULL TEXT SEARCH SETUP
-- =====================================================

-- Add text search columns
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'knowledge_base' THEN
        NEW.search_vector := to_tsvector('english', 
            COALESCE(NEW.title, '') || ' ' || 
            COALESCE(NEW.content, '') || ' ' || 
            COALESCE(NEW.search_keywords, '')
        );
    ELSIF TG_TABLE_NAME = 'blog_posts' THEN
        NEW.search_vector := to_tsvector('english', 
            COALESCE(NEW.title, '') || ' ' || 
            COALESCE(NEW.excerpt, '') || ' ' || 
            COALESCE(NEW.content, '')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for search vector updates
CREATE TRIGGER update_knowledge_search_vector 
    BEFORE INSERT OR UPDATE OF title, content, search_keywords 
    ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER update_blog_search_vector 
    BEFORE INSERT OR UPDATE OF title, excerpt, content 
    ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Create GIN indexes for full text search
CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge_base USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_blog_search ON blog_posts USING GIN(search_vector);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_saved_configs_expires ON saved_configurations(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until) WHERE valid_until IS NOT NULL;

-- Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_new ON leads(created_at DESC) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS idx_blog_drafts ON blog_posts(updated_at DESC) WHERE status = 'draft';
CREATE INDEX IF NOT EXISTS idx_active_pricing ON pricing_options(model, category, display_order) WHERE is_available = true;