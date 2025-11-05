-- =====================================================
-- SAFE MIGRATION SCRIPT FOR J TAYLOR HORSEBOXES
-- NO EXTERNAL TABLE DEPENDENCIES
-- Generated: 2025-01-17
-- =====================================================
--
-- This script creates core tables WITHOUT dependencies on quotes/leads tables
-- Run this first, then add foreign keys later when those tables exist
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE (NO FOREIGN KEY DEPENDENCIES)
-- =====================================================
DROP TABLE IF EXISTS customer_communications CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

CREATE TABLE customers (
    -- Primary identification
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),

    -- Address information
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_county VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United Kingdom',

    -- Business classification
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    customer_type VARCHAR(50) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business', 'dealer')),

    -- Acquisition and relationship tracking
    acquisition_source VARCHAR(100),
    acquisition_campaign VARCHAR(255),
    lead_id UUID, -- Will add FK later when leads table exists

    -- Financial metrics
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,

    -- Customer service and notes
    notes TEXT,
    tags TEXT[],

    -- Contact tracking
    last_contact_date TIMESTAMPTZ,
    preferred_contact_method VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'post')),

    -- Additional business fields
    vat_number VARCHAR(50),
    credit_limit DECIMAL(10,2),
    payment_terms INTEGER DEFAULT 0,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,

    -- Constraints
    CONSTRAINT unique_customer_email UNIQUE(email),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$')
);

-- =====================================================
-- CUSTOMER COMMUNICATIONS TABLE
-- =====================================================
CREATE TABLE customer_communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'note', 'sms')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100),
    performed_by UUID,
    scheduled_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER ORDERS TABLE (NO QUOTES DEPENDENCY)
-- =====================================================
CREATE TABLE customer_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID, -- Will add FK later when quotes table exists
    order_date TIMESTAMPTZ DEFAULT NOW(),
    total_amount DECIMAL(12,2) NOT NULL,
    vat_amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    build_id UUID,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUTH AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENHANCE PROFILES TABLE (IF EXISTS)
-- =====================================================
-- Add operations platform columns to profiles table
DO $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Add columns if they don't exist
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS department VARCHAR(100),
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS last_login_ip INET;
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Customers indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX idx_customers_last_order ON customers(last_order_date DESC NULLS LAST);
CREATE INDEX idx_customers_total_value ON customers(total_value DESC);
CREATE INDEX idx_customers_company ON customers(company) WHERE company IS NOT NULL;
CREATE INDEX idx_customers_lead_id ON customers(lead_id) WHERE lead_id IS NOT NULL;

-- Full text search index
CREATE INDEX idx_customers_search ON customers
    USING gin(to_tsvector('english',
        coalesce(first_name, '') || ' ' ||
        coalesce(last_name, '') || ' ' ||
        coalesce(company, '') || ' ' ||
        coalesce(email, '')
    ));

-- Communications indexes
CREATE INDEX idx_customer_communications_customer ON customer_communications(customer_id);
CREATE INDEX idx_customer_communications_created ON customer_communications(created_at DESC);
CREATE INDEX idx_customer_communications_follow_up ON customer_communications(scheduled_follow_up)
    WHERE scheduled_follow_up IS NOT NULL;

-- Orders indexes
CREATE INDEX idx_customer_orders_customer ON customer_orders(customer_id);
CREATE INDEX idx_customer_orders_date ON customer_orders(order_date DESC);
CREATE INDEX idx_customer_orders_status ON customer_orders(status);

-- Auth audit log indexes
CREATE INDEX idx_auth_audit_user_id ON auth_audit_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_auth_audit_created ON auth_audit_log(created_at DESC);
CREATE INDEX idx_auth_audit_event_type ON auth_audit_log(event_type);
CREATE INDEX idx_auth_audit_success ON auth_audit_log(success);

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_orders_updated_at
    BEFORE UPDATE ON customer_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Allow authenticated users to view customers"
    ON customers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
    ON customers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
    ON customers FOR UPDATE
    TO authenticated
    USING (true);

-- Communications policies
CREATE POLICY "Allow authenticated users to view communications"
    ON customer_communications FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert communications"
    ON customer_communications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow authenticated users to view orders"
    ON customer_orders FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
    ON customer_orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Auth audit log policies (read-only for most users)
CREATE POLICY "Allow authenticated users to view audit logs"
    ON auth_audit_log FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow service role to insert audit logs"
    ON auth_audit_log FOR INSERT
    TO service_role
    WITH CHECK (true);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to search customers
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    company VARCHAR(255),
    status VARCHAR(50),
    total_orders INTEGER,
    total_value DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.company,
        c.status,
        c.total_orders,
        c.total_value
    FROM customers c
    WHERE
        to_tsvector('english',
            coalesce(c.first_name, '') || ' ' ||
            coalesce(c.last_name, '') || ' ' ||
            coalesce(c.company, '') || ' ' ||
            coalesce(c.email, '')
        ) @@ plainto_tsquery('english', search_term)
    ORDER BY c.last_name, c.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED SAMPLE DATA (OPTIONAL - COMMENT OUT IF NOT NEEDED)
-- =====================================================
-- Uncomment below to add sample customers for testing

/*
INSERT INTO customers (first_name, last_name, email, phone, company, status, customer_type, total_orders, total_value)
VALUES
    ('John', 'Smith', 'john.smith@example.com', '+44 7700 900123', NULL, 'active', 'individual', 2, 125000.00),
    ('Sarah', 'Johnson', 'sarah.j@equestrian.co.uk', '+44 7700 900456', 'Johnson Equestrian', 'active', 'business', 5, 450000.00),
    ('Michael', 'Brown', 'mike@brownstables.com', '+44 7700 900789', 'Brown Stables Ltd', 'active', 'business', 1, 95000.00),
    ('Emma', 'Wilson', 'emma.wilson@gmail.com', '+44 7700 900321', NULL, 'prospect', 'individual', 0, 0.00),
    ('David', 'Taylor', 'david@taylorhorses.co.uk', '+44 7700 900654', 'Taylor Horses', 'active', 'dealer', 12, 1250000.00);
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
SELECT 'Migration completed successfully!' AS status,
       'Tables created: customers, customer_communications, customer_orders, auth_audit_log' AS tables,
       'RLS policies enabled' AS security,
       'Indexes created for performance' AS optimization;
