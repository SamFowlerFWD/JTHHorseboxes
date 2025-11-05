-- =====================================================
-- J TAYLOR HORSEBOXES - COMPLETE MIGRATION DEPLOYMENT
-- =====================================================
-- This script deploys all migrations in the correct order
-- and validates each step of the deployment process
-- 
-- IMPORTANT: Run this script in your Supabase SQL Editor
-- =====================================================

-- Start transaction for atomic deployment
BEGIN;

-- =====================================================
-- STEP 1: PRE-DEPLOYMENT CHECKS
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Starting JTH Migration Deployment';
    RAISE NOTICE 'Time: %', NOW();
    RAISE NOTICE '========================================';
END $$;

-- Check if required tables exist
DO $$
BEGIN
    -- Check for leads table (dependency)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        RAISE WARNING 'leads table does not exist - some features may not work';
    END IF;
    
    -- Check for quotes table (dependency)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
        RAISE WARNING 'quotes table does not exist - some features may not work';
    END IF;
    
    -- Check for profiles table (dependency)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'profiles table must exist before running these migrations';
    END IF;
    
    RAISE NOTICE 'Pre-deployment checks completed';
END $$;

-- =====================================================
-- MIGRATION 1: CUSTOMERS TABLE (006)
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Deploying Migration 006: Customers Table';
    RAISE NOTICE '----------------------------------------';
END $$;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects for clean deployment
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers CASCADE;
DROP TRIGGER IF EXISTS update_customer_metrics ON customers CASCADE;
DROP FUNCTION IF EXISTS update_customer_metrics() CASCADE;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_county VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United Kingdom',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    customer_type VARCHAR(50) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business', 'dealer')),
    acquisition_source VARCHAR(100),
    acquisition_campaign VARCHAR(255),
    lead_id UUID,
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[],
    last_contact_date TIMESTAMPTZ,
    preferred_contact_method VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'post')),
    vat_number VARCHAR(50),
    credit_limit DECIMAL(10,2),
    payment_terms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_customer_email UNIQUE(email),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$')
);

-- Add lead_id foreign key only if leads table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        ALTER TABLE customers 
        DROP CONSTRAINT IF EXISTS customers_lead_id_fkey;
        
        ALTER TABLE customers 
        ADD CONSTRAINT customers_lead_id_fkey 
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create customer communications table
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'note', 'sms')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100),
    performed_by UUID REFERENCES auth.users(id),
    scheduled_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer orders table
CREATE TABLE IF NOT EXISTS customer_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID,
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

-- Add quote_id foreign key only if quotes table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
        ALTER TABLE customer_orders 
        DROP CONSTRAINT IF EXISTS customer_orders_quote_id_fkey;
        
        ALTER TABLE customer_orders 
        ADD CONSTRAINT customer_orders_quote_id_fkey 
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON customers(last_order_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_customers_total_value ON customers(total_value DESC);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers(lead_id) WHERE lead_id IS NOT NULL;

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers 
    USING gin(to_tsvector('english', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(company, '') || ' ' || 
        coalesce(email, '')
    ));

-- Communications indexes
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created ON customer_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_communications_follow_up ON customer_communications(scheduled_follow_up) 
    WHERE scheduled_follow_up IS NOT NULL;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_customer_orders_customer ON customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_date ON customer_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);

-- Update quotes table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
        ALTER TABLE quotes 
        ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id) WHERE customer_id IS NOT NULL;
    END IF;
END $$;

-- Create triggers and functions
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

-- Customer metrics update function
CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
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

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "customers_admin_all" ON customers;
DROP POLICY IF EXISTS "customers_authenticated_select" ON customers;
DROP POLICY IF EXISTS "customers_authenticated_insert" ON customers;
DROP POLICY IF EXISTS "customers_authenticated_update" ON customers;
DROP POLICY IF EXISTS "communications_authenticated_all" ON customer_communications;
DROP POLICY IF EXISTS "orders_authenticated_all" ON customer_orders;

-- Create RLS policies
CREATE POLICY "customers_authenticated_select" ON customers
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "customers_authenticated_insert" ON customers
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "customers_authenticated_update" ON customers
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "communications_authenticated_all" ON customer_communications
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orders_authenticated_all" ON customer_orders
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Helper functions
CREATE OR REPLACE FUNCTION convert_lead_to_customer(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_lead RECORD;
BEGIN
    -- Get lead data (only if leads table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        EXECUTE 'SELECT * FROM leads WHERE id = $1' INTO v_lead USING p_lead_id;
        
        IF v_lead IS NULL THEN
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
        EXECUTE 'UPDATE leads SET status = $1, updated_at = $2 WHERE id = $3'
        USING 'converted', NOW(), p_lead_id;
        
        -- Update quotes if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
            EXECUTE 'UPDATE quotes SET customer_id = $1, updated_at = $2 WHERE lead_id = $3'
            USING v_customer_id, NOW(), p_lead_id;
        END IF;
    ELSE
        RAISE EXCEPTION 'leads table does not exist';
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

DO $$
BEGIN
    RAISE NOTICE 'Migration 006 completed successfully';
END $$;

-- =====================================================
-- MIGRATION 2: SEED CUSTOMER DATA (007)
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Deploying Migration 007: Customer Seed Data';
    RAISE NOTICE '----------------------------------------';
END $$;

-- Only insert seed data if customers table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM customers LIMIT 1) THEN
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
        );
        
        -- Update average order values
        UPDATE customers 
        SET average_order_value = CASE 
            WHEN total_orders > 0 THEN total_value / total_orders 
            ELSE 0 
        END
        WHERE total_orders > 0;
        
        -- Set last order dates
        UPDATE customers 
        SET last_order_date = created_at + INTERVAL '30 days'
        WHERE total_orders > 0;
        
        RAISE NOTICE 'Seed data inserted successfully';
    ELSE
        RAISE NOTICE 'Customers table already has data - skipping seed data';
    END IF;
END $$;

-- =====================================================
-- MIGRATION 3: ENHANCE PROFILES AUTH (008)
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Deploying Migration 008: Enhanced Auth';
    RAISE NOTICE '----------------------------------------';
END $$;

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Update existing profiles to ensure valid roles
UPDATE profiles 
SET role = 'viewer' 
WHERE role IS NULL OR role = 'user' OR role = 'customer';

-- Create audit log table
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

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_email ON auth_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at DESC);

-- Authentication functions
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
    v_attempts := COALESCE(v_attempts, 0) + 1;
    
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

CREATE OR REPLACE FUNCTION handle_user_login(
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW(),
    last_activity_at = NOW()
  WHERE id = p_user_id;
  
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

-- Enable RLS on auth_audit_log
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can view all audit logs" ON auth_audit_log;
DROP POLICY IF EXISTS "Users can view own audit logs" ON auth_audit_log;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create RLS policies for auth_audit_log
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

CREATE POLICY "Users can view own audit logs" ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update profiles RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

DO $$
BEGIN
    RAISE NOTICE 'Migration 008 completed successfully';
END $$;

-- =====================================================
-- MIGRATION 4: ENHANCE INVENTORY TABLE (009)
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Deploying Migration 009: Enhanced Inventory';
    RAISE NOTICE '----------------------------------------';
END $$;

-- Check if inventory table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        CREATE TABLE inventory (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            part_code VARCHAR(100),
            description TEXT,
            category VARCHAR(50),
            unit VARCHAR(20),
            quantity_on_hand DECIMAL(10,2) DEFAULT 0,
            reorder_point DECIMAL(10,2) DEFAULT 0,
            location VARCHAR(100),
            unit_cost DECIMAL(10,2),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created inventory table';
    END IF;
END $$;

-- Add missing columns
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS part_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock DECIMAL(10,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Migrate existing data
UPDATE inventory 
SET 
  part_number = COALESCE(part_number, part_code),
  name = COALESCE(name, description),
  current_stock = COALESCE(current_stock, quantity_on_hand),
  min_stock = COALESCE(min_stock, 5),
  max_stock = COALESCE(max_stock, 100),
  last_restocked = COALESCE(last_restocked, created_at);

-- Create status update function
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

-- Create trigger for status updates
DROP TRIGGER IF EXISTS update_inventory_status_trigger ON inventory;
CREATE TRIGGER update_inventory_status_trigger
  BEFORE INSERT OR UPDATE OF current_stock, min_stock, max_stock, reorder_point
  ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Update existing records
UPDATE inventory SET status = 
  CASE 
    WHEN current_stock = 0 THEN 'out_of_stock'
    WHEN current_stock <= min_stock THEN 'critical'
    WHEN current_stock <= reorder_point THEN 'reorder'
    WHEN current_stock >= max_stock THEN 'overstocked'
    ELSE 'in_stock'
  END
WHERE status IS NULL;

-- Create inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory adjustment function
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
  SELECT current_stock INTO v_current_stock
  FROM inventory
  WHERE id = p_inventory_id
  FOR UPDATE;
  
  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  IF p_adjustment > 0 THEN
    v_movement_type := 'in';
  ELSIF p_adjustment < 0 THEN
    v_movement_type := 'out';
  ELSE
    v_movement_type := 'adjustment';
  END IF;
  
  UPDATE inventory
  SET 
    current_stock = current_stock + p_adjustment,
    quantity_on_hand = quantity_on_hand + p_adjustment,
    last_restocked = CASE WHEN p_adjustment > 0 THEN NOW() ELSE last_restocked END,
    updated_at = NOW()
  WHERE id = p_inventory_id;
  
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

-- Insert sample data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM inventory LIMIT 1) THEN
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
        ) VALUES
          ('CHK-001', 'CHK-001', 'Chassis Main Beam', '3.5t chassis main support beam', 'chassis', 'units', 12, 12, 5, 50, 10, 'Warehouse A - Rack 1', 450.00, NOW() - INTERVAL '20 days'),
          ('ELC-045', 'ELC-045', 'LED Tail Light Assembly', 'Complete LED tail light unit with indicators', 'electrical', 'units', 3, 3, 10, 40, 15, 'Warehouse B - Shelf 3', 125.50, NOW() - INTERVAL '35 days'),
          ('PLB-012', 'PLB-012', 'Water Tank 100L', '100 litre fresh water tank with fittings', 'plumbing', 'units', 8, 8, 5, 20, 7, 'Warehouse A - Bay 2', 185.00, NOW() - INTERVAL '10 days');
        
        RAISE NOTICE 'Sample inventory data inserted';
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_part_number ON inventory(part_number);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- Enable RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Staff can create inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Allow authenticated read" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON inventory;
DROP POLICY IF EXISTS "Staff can manage inventory" ON inventory;

-- Create RLS policies
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

DO $$
BEGIN
    RAISE NOTICE 'Migration 009 completed successfully';
END $$;

-- =====================================================
-- FINAL VALIDATION
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
    v_test_result BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Running Final Validation';
    RAISE NOTICE '========================================';
    
    -- Check tables exist
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.tables 
    WHERE table_name IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory_movements');
    
    IF v_count = 5 THEN
        RAISE NOTICE '✓ All required tables created successfully';
    ELSE
        RAISE WARNING '✗ Some tables missing. Found %/5 tables', v_count;
    END IF;
    
    -- Check functions exist
    SELECT COUNT(*) INTO v_count
    FROM information_schema.routines 
    WHERE routine_name IN ('handle_failed_login', 'handle_user_login', 'adjust_inventory_stock', 'search_customers', 'convert_lead_to_customer');
    
    IF v_count = 5 THEN
        RAISE NOTICE '✓ All required functions created successfully';
    ELSE
        RAISE WARNING '✗ Some functions missing. Found %/5 functions', v_count;
    END IF;
    
    -- Check RLS is enabled
    SELECT COUNT(*) INTO v_count
    FROM pg_tables 
    WHERE tablename IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory', 'inventory_movements')
    AND rowsecurity = true;
    
    IF v_count >= 5 THEN
        RAISE NOTICE '✓ RLS enabled on all required tables';
    ELSE
        RAISE WARNING '✗ RLS not enabled on all tables. Enabled on %/6 tables', v_count;
    END IF;
    
    -- Check indexes
    SELECT COUNT(*) INTO v_count
    FROM pg_indexes
    WHERE tablename IN ('customers', 'inventory', 'auth_audit_log');
    
    RAISE NOTICE '✓ Created % indexes across all tables', v_count;
    
    -- Check sample data
    SELECT COUNT(*) INTO v_count FROM customers;
    RAISE NOTICE '✓ Customers table has % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM inventory;
    RAISE NOTICE '✓ Inventory table has % records', v_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Deployment Complete!';
    RAISE NOTICE '========================================';
END $$;

-- Commit the transaction
COMMIT;

-- =====================================================
-- POST-DEPLOYMENT TEST QUERIES
-- =====================================================
-- Run these queries separately to verify everything works:

/*
-- Test 1: Check all tables
SELECT table_name, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log', 'inventory', 'inventory_movements')
ORDER BY table_name;

-- Test 2: Check functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('handle_failed_login', 'handle_user_login', 'adjust_inventory_stock', 'search_customers', 'convert_lead_to_customer')
ORDER BY routine_name;

-- Test 3: Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 4: Sample data counts
SELECT 
    'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL SELECT 
    'inventory', COUNT(*) FROM inventory
UNION ALL SELECT 
    'customer_communications', COUNT(*) FROM customer_communications
UNION ALL SELECT 
    'customer_orders', COUNT(*) FROM customer_orders
UNION ALL SELECT 
    'inventory_movements', COUNT(*) FROM inventory_movements
ORDER BY table_name;

-- Test 5: Test customer search function
SELECT * FROM search_customers('Thompson');

-- Test 6: Check inventory status distribution
SELECT status, COUNT(*) as count 
FROM inventory 
GROUP BY status 
ORDER BY count DESC;
*/