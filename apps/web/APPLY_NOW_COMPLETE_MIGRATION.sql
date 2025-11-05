-- =====================================================
-- COMBINED MIGRATION SCRIPT FOR J TAYLOR HORSEBOXES
-- Generated: 2025-08-29T13:38:04.555Z
-- =====================================================
-- 
-- IMPORTANT: Run this script in your Supabase SQL Editor
-- Navigate to: https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new
-- 
-- This script combines all migrations in the correct order
-- =====================================================


-- =====================================================
-- MIGRATION: 006_customers_table.sql
-- =====================================================

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
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_customer_metrics ON customers;
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


-- =====================================================
-- MIGRATION: 007_customers_seed_data.sql
-- =====================================================

-- =====================================================
-- CUSTOMERS SEED DATA MIGRATION
-- =====================================================
-- This migration imports the mock customer data from the application
-- into the newly created customers table.
-- 
-- Run this after 006_customers_table.sql
-- =====================================================

-- Insert mock customers data
INSERT INTO customers (
    id,
    first_name,
    last_name,
    company,
    email,
    phone,
    address_street,
    address_city,
    address_county,
    address_postcode,
    address_country,
    status,
    customer_type,
    created_at,
    last_contact_date,
    total_orders,
    total_value,
    notes,
    tags
) VALUES 
(
    uuid_generate_v4(),
    'Sarah',
    'Thompson',
    'Thompson Equestrian',
    'sarah.thompson@example.com',
    '+44 7700 900123',
    '123 High Street',
    'York',
    'North Yorkshire',
    'YO1 7HY',
    'United Kingdom',
    'active',
    'business',
    '2024-06-15'::TIMESTAMPTZ,
    '2024-12-10'::TIMESTAMPTZ,
    2,
    85000.00,
    'VIP customer - owns multiple horses',
    ARRAY['vip', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'James',
    'Wilson',
    NULL,
    'j.wilson@example.com',
    '+44 7700 900456',
    '45 Oak Avenue',
    'Leeds',
    'West Yorkshire',
    'LS1 2AB',
    'United Kingdom',
    'prospect',
    'individual',
    '2024-11-20'::TIMESTAMPTZ,
    '2024-12-08'::TIMESTAMPTZ,
    0,
    0.00,
    'Interested in 3.5t model',
    ARRAY['lead', 'follow_up']
),
(
    uuid_generate_v4(),
    'Emma',
    'Davies',
    'Davies Racing Stables',
    'emma@daviesracing.co.uk',
    '+44 7700 900789',
    '78 Mill Lane',
    'Harrogate',
    'North Yorkshire',
    'HG1 3QP',
    'United Kingdom',
    'active',
    'business',
    '2023-09-10'::TIMESTAMPTZ,
    '2024-11-25'::TIMESTAMPTZ,
    3,
    125000.00,
    'Professional racing stable',
    ARRAY['professional', 'racing']
),
(
    uuid_generate_v4(),
    'Michael',
    'Brown',
    NULL,
    'mbrown@example.com',
    '+44 7700 900321',
    '12 Church Road',
    'Sheffield',
    'South Yorkshire',
    'S1 4PD',
    'United Kingdom',
    'active',
    'individual',
    '2024-03-22'::TIMESTAMPTZ,
    '2024-10-15'::TIMESTAMPTZ,
    1,
    42000.00,
    'First time buyer',
    ARRAY['new_customer']
),
(
    uuid_generate_v4(),
    'Lucy',
    'Anderson',
    'Anderson Equine Transport',
    'lucy@andersonequine.com',
    '+44 7700 900654',
    '234 Main Street',
    'Ripon',
    'North Yorkshire',
    'HG4 1AA',
    'United Kingdom',
    'active',
    'business',
    '2024-01-05'::TIMESTAMPTZ,
    '2024-12-01'::TIMESTAMPTZ,
    4,
    180000.00,
    'Fleet customer - multiple vehicles',
    ARRAY['fleet', 'commercial']
),
(
    uuid_generate_v4(),
    'David',
    'Jones',
    NULL,
    'djones@example.com',
    '+44 7700 900987',
    '56 Park View',
    'Thirsk',
    'North Yorkshire',
    'YO7 1RR',
    'United Kingdom',
    'prospect',
    'individual',
    '2024-12-05'::TIMESTAMPTZ,
    '2024-12-12'::TIMESTAMPTZ,
    0,
    0.00,
    'Quote requested for 4.5t model',
    ARRAY['quote_sent']
),
(
    uuid_generate_v4(),
    'Rachel',
    'Green',
    'Green Fields Stud',
    'rachel@greenfields.co.uk',
    '+44 7700 900147',
    '89 Country Lane',
    'Wetherby',
    'West Yorkshire',
    'LS22 5EF',
    'United Kingdom',
    'active',
    'business',
    '2023-05-18'::TIMESTAMPTZ,
    '2024-11-30'::TIMESTAMPTZ,
    2,
    95000.00,
    'Breeding operation',
    ARRAY['breeder', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'Thomas',
    'Wright',
    NULL,
    'twright@example.com',
    '+44 7700 900258',
    '33 Station Road',
    'Northallerton',
    'North Yorkshire',
    'DL7 8AD',
    'United Kingdom',
    'inactive',
    'individual',
    '2023-11-12'::TIMESTAMPTZ,
    '2024-05-20'::TIMESTAMPTZ,
    1,
    38000.00,
    'Completed purchase - no current activity',
    ARRAY['inactive']
),
(
    uuid_generate_v4(),
    'Charlotte',
    'Evans',
    'Evans Livery Yard',
    'charlotte@evanslivery.com',
    '+44 7700 900369',
    '15 Farm Road',
    'Skipton',
    'North Yorkshire',
    'BD23 1EP',
    'United Kingdom',
    'active',
    'business',
    '2024-02-28'::TIMESTAMPTZ,
    '2024-12-05'::TIMESTAMPTZ,
    2,
    76000.00,
    'Livery yard owner - potential for more sales',
    ARRAY['livery', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'Oliver',
    'Taylor',
    NULL,
    'o.taylor@example.com',
    '+44 7700 900741',
    '67 Queens Road',
    'Beverley',
    'East Yorkshire',
    'HU17 8NF',
    'United Kingdom',
    'active',
    'individual',
    '2024-07-10'::TIMESTAMPTZ,
    '2024-11-28'::TIMESTAMPTZ,
    1,
    48000.00,
    'Happy customer - left positive review',
    ARRAY['satisfied', 'reviewer']
),
(
    uuid_generate_v4(),
    'Sophie',
    'Martin',
    'Martin Competition Horses',
    'sophie@martinhorses.co.uk',
    '+44 7700 900852',
    '90 Paddock Lane',
    'Malton',
    'North Yorkshire',
    'YO17 7HP',
    'United Kingdom',
    'active',
    'business',
    '2023-12-15'::TIMESTAMPTZ,
    '2024-12-08'::TIMESTAMPTZ,
    3,
    142000.00,
    'Competition yard - high-end requirements',
    ARRAY['competition', 'premium', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'William',
    'Clarke',
    NULL,
    'w.clarke@example.com',
    '+44 7700 900963',
    '23 Victoria Street',
    'Doncaster',
    'South Yorkshire',
    'DN1 3NJ',
    'United Kingdom',
    'prospect',
    'individual',
    '2024-12-01'::TIMESTAMPTZ,
    '2024-12-11'::TIMESTAMPTZ,
    0,
    0.00,
    'Browsed configurator - follow up needed',
    ARRAY['configurator_user', 'follow_up']
);

-- Update average order values for customers with orders
UPDATE customers 
SET average_order_value = CASE 
    WHEN total_orders > 0 THEN total_value / total_orders 
    ELSE 0 
END
WHERE total_orders > 0;

-- Set last order dates for customers with orders
UPDATE customers 
SET last_order_date = created_at + INTERVAL '30 days'
WHERE total_orders > 0;

-- Add some sample communications for active customers
INSERT INTO customer_communications (
    customer_id,
    communication_type,
    direction,
    subject,
    content,
    outcome,
    created_at
)
SELECT 
    c.id,
    'email',
    'outbound',
    'Thank you for your interest in J Taylor Horseboxes',
    'Following up on your recent inquiry about our ' || 
    CASE 
        WHEN c.notes LIKE '%3.5t%' THEN '3.5t model'
        WHEN c.notes LIKE '%4.5t%' THEN '4.5t model'
        ELSE 'horsebox range'
    END,
    CASE 
        WHEN c.status = 'active' THEN 'interested'
        WHEN c.status = 'prospect' THEN 'follow_up_needed'
        ELSE 'not_interested'
    END,
    c.last_contact_date
FROM customers c
WHERE c.status IN ('active', 'prospect')
LIMIT 5;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the data migration:
/*
-- Check customer count
SELECT COUNT(*) as total_customers FROM customers;

-- Check customer distribution by status
SELECT status, COUNT(*) as count 
FROM customers 
GROUP BY status 
ORDER BY count DESC;

-- Check customer types
SELECT customer_type, COUNT(*) as count 
FROM customers 
GROUP BY customer_type 
ORDER BY count DESC;

-- Check top customers by value
SELECT 
    first_name || ' ' || last_name as name,
    company,
    total_value,
    total_orders
FROM customers 
ORDER BY total_value DESC 
LIMIT 5;

-- Check communications
SELECT COUNT(*) as total_communications 
FROM customer_communications;
*/

-- =====================================================
-- END OF SEED DATA MIGRATION
-- =====================================================


-- =====================================================
-- MIGRATION: 008_enhance_profiles_auth.sql
-- =====================================================

-- =====================================================
-- Migration: Enhance profiles table for authentication
-- Purpose: Add missing fields required by the /ops authentication system
-- =====================================================

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Update existing profiles to ensure they have valid roles
UPDATE profiles 
SET role = 'viewer' 
WHERE role IS NULL OR role = 'user' OR role = 'customer';

-- Create audit log table for login attempts
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_log_email ON auth_audit_log(email);
CREATE INDEX idx_auth_audit_log_created_at ON auth_audit_log(created_at DESC);

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(
  p_email VARCHAR,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_attempts INTEGER;
BEGIN
  -- Get user ID and current attempts
  SELECT p.id, p.failed_login_attempts 
  INTO v_user_id, v_attempts
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = LOWER(p_email);
  
  IF v_user_id IS NOT NULL THEN
    -- Increment failed attempts
    v_attempts := COALESCE(v_attempts, 0) + 1;
    
    -- Lock account after 5 failed attempts (15 minutes)
    IF v_attempts >= 5 THEN
      UPDATE profiles 
      SET 
        failed_login_attempts = v_attempts,
        locked_until = NOW() + INTERVAL '15 minutes'
      WHERE id = v_user_id;
    ELSE
      UPDATE profiles 
      SET failed_login_attempts = v_attempts
      WHERE id = v_user_id;
    END IF;
  END IF;
  
  -- Log the failed attempt
  INSERT INTO auth_audit_log (
    event_type,
    user_id,
    email,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    'login_failed',
    v_user_id,
    p_email,
    p_ip_address,
    p_user_agent,
    false,
    CASE 
      WHEN v_attempts >= 5 THEN 'Account locked due to too many failed attempts'
      ELSE 'Invalid credentials'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle successful login
CREATE OR REPLACE FUNCTION handle_user_login(
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Reset failed attempts and update last login
  UPDATE profiles 
  SET 
    failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW(),
    last_activity_at = NOW()
  WHERE id = p_user_id;
  
  -- Log successful login
  INSERT INTO auth_audit_log (
    event_type,
    user_id,
    ip_address,
    user_agent,
    success
  ) VALUES (
    'login_success',
    p_user_id,
    p_ip_address,
    p_user_agent,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked_until TIMESTAMPTZ;
BEGIN
  SELECT locked_until INTO v_locked_until
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN v_locked_until IS NOT NULL AND v_locked_until > NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- RLS policies for auth_audit_log
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin can view all audit logs" ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update profiles RLS policies for authentication
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    -- Users cannot change their own role or active status
    id = auth.uid() AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update last_activity_at on any authenticated request
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_activity_at = NOW()
  WHERE id = auth.uid()
  AND last_activity_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Triggers for activity tracking would be added to relevant tables
-- For now, the application should call this manually or use middleware

-- Insert initial admin user (update email/id as needed)
-- This should be run separately after creating the user in Supabase Auth
/*
INSERT INTO profiles (id, email, full_name, role, department, is_active)
VALUES (
  'YOUR-ADMIN-USER-ID',
  'admin@jtaylorhorseboxes.com',
  'System Administrator',
  'admin',
  'IT',
  true
) ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  department = 'IT',
  is_active = true;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'User profiles with authentication and authorization information';
COMMENT ON TABLE auth_audit_log IS 'Audit log for authentication events and security monitoring';
COMMENT ON FUNCTION handle_failed_login IS 'Handles failed login attempts and account locking';
COMMENT ON FUNCTION handle_user_login IS 'Handles successful login and resets failed attempts';
COMMENT ON FUNCTION is_account_locked IS 'Checks if a user account is currently locked';


-- =====================================================
-- MIGRATION: 009_enhance_inventory_table.sql
-- =====================================================

-- =====================================================
-- Migration: Enhance inventory table for operations platform
-- Purpose: Add missing fields and adjust structure to match frontend requirements
-- =====================================================

-- Add missing columns to inventory table
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS part_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock DECIMAL(10,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Migrate existing data to new column names
UPDATE inventory 
SET 
  part_number = COALESCE(part_number, part_code),
  name = COALESCE(name, description),
  current_stock = COALESCE(current_stock, quantity_on_hand),
  min_stock = COALESCE(min_stock, 5), -- Default min stock
  max_stock = COALESCE(max_stock, 100), -- Default max stock
  last_restocked = COALESCE(last_restocked, created_at);

-- Create computed status column based on stock levels
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock = 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.min_stock THEN
    NEW.status = 'critical';
  ELSIF NEW.current_stock <= NEW.reorder_point THEN
    NEW.status = 'reorder';
  ELSIF NEW.current_stock >= NEW.max_stock THEN
    NEW.status = 'overstocked';
  ELSE
    NEW.status = 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update status automatically
DROP TRIGGER IF EXISTS update_inventory_status_trigger ON inventory;
CREATE TRIGGER update_inventory_status_trigger
  BEFORE INSERT OR UPDATE OF current_stock, min_stock, max_stock, reorder_point
  ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Update all existing records to set status
UPDATE inventory SET status = 
  CASE 
    WHEN current_stock = 0 THEN 'out_of_stock'
    WHEN current_stock <= min_stock THEN 'critical'
    WHEN current_stock <= reorder_point THEN 'reorder'
    WHEN current_stock >= max_stock THEN 'overstocked'
    ELSE 'in_stock'
  END
WHERE status IS NULL;

-- Create inventory movements table for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'return'
  quantity DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50), -- 'purchase_order', 'build', 'adjustment', 'return'
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle stock adjustments
CREATE OR REPLACE FUNCTION adjust_inventory_stock(
  p_inventory_id UUID,
  p_adjustment DECIMAL,
  p_reason TEXT,
  p_user_id UUID
) RETURNS void AS $$
DECLARE
  v_current_stock DECIMAL;
  v_movement_type VARCHAR(50);
BEGIN
  -- Get current stock
  SELECT current_stock INTO v_current_stock
  FROM inventory
  WHERE id = p_inventory_id
  FOR UPDATE;
  
  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  -- Determine movement type
  IF p_adjustment > 0 THEN
    v_movement_type := 'in';
  ELSIF p_adjustment < 0 THEN
    v_movement_type := 'out';
  ELSE
    v_movement_type := 'adjustment';
  END IF;
  
  -- Update stock level
  UPDATE inventory
  SET 
    current_stock = current_stock + p_adjustment,
    quantity_on_hand = quantity_on_hand + p_adjustment,
    last_restocked = CASE WHEN p_adjustment > 0 THEN NOW() ELSE last_restocked END,
    updated_at = NOW()
  WHERE id = p_inventory_id;
  
  -- Record the movement
  INSERT INTO inventory_movements (
    inventory_id,
    movement_type,
    quantity,
    reference_type,
    reason,
    performed_by
  ) VALUES (
    p_inventory_id,
    v_movement_type,
    p_adjustment,
    'adjustment',
    p_reason,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample inventory data if table is empty
INSERT INTO inventory (
  part_number,
  part_code,
  name,
  description,
  category,
  unit,
  current_stock,
  quantity_on_hand,
  min_stock,
  max_stock,
  reorder_point,
  location,
  unit_cost,
  last_restocked
) 
SELECT * FROM (VALUES
  ('CHK-001', 'CHK-001', 'Chassis Main Beam', '3.5t chassis main support beam', 'chassis', 'units', 12, 12, 5, 50, 10, 'Warehouse A - Rack 1', 450.00, NOW() - INTERVAL '20 days'),
  ('ELC-045', 'ELC-045', 'LED Tail Light Assembly', 'Complete LED tail light unit with indicators', 'electrical', 'units', 3, 3, 10, 40, 15, 'Warehouse B - Shelf 3', 125.50, NOW() - INTERVAL '35 days'),
  ('PLB-012', 'PLB-012', 'Water Tank 100L', '100 litre fresh water tank with fittings', 'plumbing', 'units', 8, 8, 5, 20, 7, 'Warehouse A - Bay 2', 185.00, NOW() - INTERVAL '10 days'),
  ('INT-089', 'INT-089', 'Tack Locker Door', 'Aluminum tack locker door with lock', 'interior', 'units', 0, 0, 5, 25, 8, 'Warehouse C - Section 2', 275.00, NOW() - INTERVAL '60 days'),
  ('HRD-234', 'HRD-234', 'M12 Bolt Set', 'M12 stainless steel bolt set (pack of 50)', 'hardware', 'packs', 45, 45, 20, 100, 30, 'Warehouse A - Drawer 5', 22.50, NOW() - INTERVAL '15 days'),
  ('EXT-067', 'EXT-067', 'Side Window Kit', 'Double glazed side window with frame', 'exterior', 'units', 6, 6, 8, 30, 12, 'Warehouse B - Rack 4', 320.00, NOW() - INTERVAL '22 days'),
  ('CHK-015', 'CHK-015', 'Axle Assembly 3.5t', 'Complete axle assembly for 3.5t model', 'chassis', 'units', 4, 4, 2, 10, 3, 'Warehouse A - Heavy Storage', 1250.00, NOW() - INTERVAL '40 days'),
  ('INT-102', 'INT-102', 'Rubber Matting', 'Heavy duty rubber floor matting (per m²)', 'interior', 'm²', 85, 85, 50, 200, 75, 'Warehouse C - Roll Storage', 45.00, NOW() - INTERVAL '12 days'),
  ('ELC-078', 'ELC-078', 'Control Panel Switch', 'Illuminated rocker switch for control panel', 'electrical', 'units', 12, 12, 20, 60, 25, 'Warehouse B - Bin 12', 8.50, NOW() - INTERVAL '28 days'),
  ('PLB-025', 'PLB-025', 'Waste Water Valve', 'Waste water outlet valve with seal', 'plumbing', 'units', 18, 18, 10, 40, 15, 'Warehouse A - Shelf 8', 32.00, NOW() - INTERVAL '17 days')
) AS v(part_number, part_code, name, description, category, unit, current_stock, quantity_on_hand, min_stock, max_stock, reorder_point, location, unit_cost, last_restocked)
WHERE NOT EXISTS (SELECT 1 FROM inventory LIMIT 1);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_part_number ON inventory(part_number);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- RLS policies for inventory movements
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory movements" ON inventory_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create inventory movements" ON inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Update RLS policies for inventory table
DROP POLICY IF EXISTS "Allow authenticated read" ON inventory;
CREATE POLICY "Authenticated users can view inventory" ON inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage inventory" ON inventory
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Grant permissions
GRANT ALL ON inventory_movements TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_inventory_stock TO authenticated;

-- Add helpful comments
COMMENT ON TABLE inventory IS 'Inventory management for parts and materials';
COMMENT ON TABLE inventory_movements IS 'Audit log of all inventory stock movements';
COMMENT ON FUNCTION adjust_inventory_stock IS 'Safely adjust inventory stock levels with audit logging';

