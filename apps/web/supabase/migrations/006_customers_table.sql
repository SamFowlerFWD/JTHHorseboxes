-- =====================================================
-- CUSTOMERS TABLE MIGRATION
-- =====================================================
-- This migration creates a comprehensive customers table for the J Taylor Horseboxes
-- operations platform, replacing mock data with a proper database structure.
-- 
-- Dependencies:
-- - leads table (for customer origination tracking)
-- - quotes table (for customer quote relationships)
-- - auth.users (for RLS policies)
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING OBJECTS (for rollback safety)
-- =====================================================
-- Safe drop triggers (check if table exists first)
DO $$ 
BEGIN
    -- Drop triggers on customers table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
        DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
        DROP TRIGGER IF EXISTS update_customer_metrics ON customers;
    END IF;
    
    -- Drop triggers on customer_orders table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_orders') THEN
        DROP TRIGGER IF EXISTS update_customer_orders_updated_at ON customer_orders;
    END IF;
END $$;

-- Drop functions that might exist
DROP FUNCTION IF EXISTS update_customer_metrics() CASCADE;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
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
    acquisition_source VARCHAR(100), -- e.g., 'website', 'referral', 'event', 'direct'
    acquisition_campaign VARCHAR(255), -- specific campaign or referral details
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, -- original lead if converted
    
    -- Financial metrics
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,
    
    -- Customer service and notes
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    
    -- Contact tracking
    last_contact_date TIMESTAMPTZ,
    preferred_contact_method VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'post')),
    
    -- Additional business fields
    vat_number VARCHAR(50), -- For business customers
    credit_limit DECIMAL(10,2), -- For approved dealers
    payment_terms INTEGER DEFAULT 0, -- Days for payment (0 = immediate)
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT unique_customer_email UNIQUE(email),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$')
);

-- =====================================================
-- CUSTOMER COMMUNICATIONS TABLE
-- =====================================================
-- Track all communications with customers for CRM purposes
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'note', 'sms')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100), -- e.g., 'interested', 'follow_up_needed', 'not_interested'
    performed_by UUID REFERENCES auth.users(id),
    scheduled_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER ORDERS TABLE (for future order tracking)
-- =====================================================
-- Placeholder for when order management is implemented
CREATE TABLE IF NOT EXISTS customer_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    order_date TIMESTAMPTZ DEFAULT NOW(),
    total_amount DECIMAL(12,2) NOT NULL,
    vat_amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    build_id UUID, -- Reference to future builds table
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Primary search and filter indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX idx_customers_last_order ON customers(last_order_date DESC NULLS LAST);
CREATE INDEX idx_customers_total_value ON customers(total_value DESC);
CREATE INDEX idx_customers_company ON customers(company) WHERE company IS NOT NULL;
CREATE INDEX idx_customers_lead_id ON customers(lead_id) WHERE lead_id IS NOT NULL;

-- Full text search index for customer names and company
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

-- =====================================================
-- UPDATE QUOTES TABLE RELATIONSHIP
-- =====================================================
-- Add customer reference to quotes if not exists
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id) WHERE customer_id IS NOT NULL;

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

-- Auto-update customer metrics when orders change
CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer metrics based on orders
    UPDATE customers
    SET 
        total_orders = (
            SELECT COUNT(*) 
            FROM customer_orders 
            WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
            AND status IN ('completed', 'delivered')
        ),
        total_value = (
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM customer_orders 
            WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
            AND status IN ('completed', 'delivered')
        ),
        last_order_date = (
            SELECT MAX(order_date) 
            FROM customer_orders 
            WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
            AND status IN ('completed', 'delivered')
        ),
        average_order_value = (
            SELECT AVG(total_amount) 
            FROM customer_orders 
            WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
            AND status IN ('completed', 'delivered')
        )
    WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_metrics
    AFTER INSERT OR UPDATE OR DELETE ON customer_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_metrics();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Customers table policies
-- Admins can do everything
CREATE POLICY "customers_admin_all" ON customers
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- Authenticated users can view all customers (for operations platform)
CREATE POLICY "customers_authenticated_select" ON customers
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert new customers
CREATE POLICY "customers_authenticated_insert" ON customers
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update customers
CREATE POLICY "customers_authenticated_update" ON customers
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Customer communications policies
-- Authenticated users can manage communications
CREATE POLICY "communications_authenticated_all" ON customer_communications
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Customer orders policies
-- Authenticated users can manage orders
CREATE POLICY "orders_authenticated_all" ON customer_orders
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to convert a lead to a customer
CREATE OR REPLACE FUNCTION convert_lead_to_customer(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_lead RECORD;
BEGIN
    -- Get lead data
    SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found: %', p_lead_id;
    END IF;
    
    -- Check if customer already exists with this email
    SELECT id INTO v_customer_id 
    FROM customers 
    WHERE email = v_lead.email;
    
    IF FOUND THEN
        -- Update existing customer with lead reference
        UPDATE customers 
        SET 
            lead_id = p_lead_id,
            updated_at = NOW()
        WHERE id = v_customer_id;
    ELSE
        -- Create new customer from lead
        INSERT INTO customers (
            first_name,
            last_name,
            email,
            phone,
            company,
            lead_id,
            status,
            customer_type,
            acquisition_source,
            notes,
            created_by
        ) VALUES (
            v_lead.first_name,
            v_lead.last_name,
            v_lead.email,
            v_lead.phone,
            v_lead.company,
            p_lead_id,
            'active',
            CASE 
                WHEN v_lead.company IS NOT NULL THEN 'business'
                ELSE 'individual'
            END,
            v_lead.source,
            v_lead.notes,
            auth.uid()
        )
        RETURNING id INTO v_customer_id;
    END IF;
    
    -- Update lead status
    UPDATE leads 
    SET 
        status = 'converted',
        updated_at = NOW()
    WHERE id = p_lead_id;
    
    -- Update any quotes associated with this lead
    UPDATE quotes 
    SET 
        customer_id = v_customer_id,
        updated_at = NOW()
    WHERE lead_id = p_lead_id;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search customers
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    company VARCHAR,
    phone VARCHAR,
    status VARCHAR,
    total_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.company,
        c.phone,
        c.status,
        c.total_value
    FROM customers c
    WHERE 
        to_tsvector('english', 
            coalesce(c.first_name, '') || ' ' || 
            coalesce(c.last_name, '') || ' ' || 
            coalesce(c.company, '') || ' ' || 
            coalesce(c.email, '')
        ) @@ plainto_tsquery('english', search_term)
        OR c.email ILIKE '%' || search_term || '%'
        OR c.phone ILIKE '%' || search_term || '%'
    ORDER BY c.last_name, c.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION DATA
-- =====================================================
-- Note: Mock data from the application can be imported after this migration
-- using the application's API or a separate data migration script

-- Add comment to table for documentation
COMMENT ON TABLE customers IS 'Central customer management table for J Taylor Horseboxes CRM system';
COMMENT ON COLUMN customers.lead_id IS 'Reference to original lead if customer was converted from leads table';
COMMENT ON COLUMN customers.acquisition_source IS 'How the customer was acquired: website, referral, event, direct, etc.';
COMMENT ON COLUMN customers.customer_type IS 'Classification: individual (private buyer), business (company), dealer (reseller)';
COMMENT ON COLUMN customers.tags IS 'Flexible tagging system for customer categorization, e.g. {vip, repeat_customer, racing}';

-- =====================================================
-- ROLLBACK SCRIPT (Save separately)
-- =====================================================
-- To rollback this migration, run:
/*
DROP TRIGGER IF EXISTS update_customer_metrics ON customer_orders;
DROP TRIGGER IF EXISTS update_customer_orders_updated_at ON customer_orders;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP FUNCTION IF EXISTS update_customer_metrics() CASCADE;
DROP FUNCTION IF EXISTS convert_lead_to_customer(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_customers(TEXT) CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS customer_communications CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
ALTER TABLE quotes DROP COLUMN IF EXISTS customer_id;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================