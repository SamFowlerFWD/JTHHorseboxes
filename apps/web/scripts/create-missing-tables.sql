-- =====================================================
-- CREATE MISSING TABLES FOR J TAYLOR HORSEBOXES
-- This script only creates what's missing
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. CUSTOMERS TABLE (Missing)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  -- Company Information
  company_name VARCHAR(255),
  vat_number VARCHAR(50),
  company_registration VARCHAR(50),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  county VARCHAR(100),
  postcode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United Kingdom',
  
  -- Customer Details
  customer_type VARCHAR(50) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business', 'dealer')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'archived')),
  source VARCHAR(100),
  notes TEXT,
  
  -- Preferences
  preferred_contact_method VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'whatsapp')),
  marketing_consent BOOLEAN DEFAULT false,
  newsletter_subscription BOOLEAN DEFAULT false,
  
  -- Statistics
  total_orders INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0.00,
  last_order_date TIMESTAMPTZ,
  lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  
  -- Metadata
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON customers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON customers
  FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 2. AUTH AUDIT LOG TABLE (Missing)
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_email ON auth_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for audit log (admin only)
CREATE POLICY "Admin read access" ON auth_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 3. ENHANCE EXISTING PROFILES TABLE
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ;

-- =====================================================
-- 4. ENHANCE EXISTING INVENTORY TABLE
-- =====================================================
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS supplier_id UUID,
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS supplier_part_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS warranty_months INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- =====================================================
-- 5. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, company_name, customer_type, status, source) VALUES
('Sarah', 'Mitchell', 'sarah.mitchell@stableco.uk', '01234 567890', 'StableCo Ltd', 'business', 'active', 'website'),
('James', 'Wilson', 'james.wilson@email.com', '07700 900123', NULL, 'individual', 'active', 'referral'),
('Lehel', 'International', 'info@lehelinternational.com', '01524 851500', 'Lehel International Ltd', 'dealer', 'active', 'direct'),
('Emma', 'Thompson', 'emma@ridingclub.org', '01987 654321', 'County Riding Club', 'business', 'prospect', 'exhibition'),
('Michael', 'Brown', 'mbrown@horses.com', '07891 234567', NULL, 'individual', 'active', 'online')
ON CONFLICT (email) DO NOTHING;

-- Update inventory with additional data if needed
UPDATE inventory 
SET 
  supplier_name = CASE 
    WHEN category = 'chassis' THEN 'Chassis Direct Ltd'
    WHEN category = 'electrical' THEN 'Auto Electrics UK'
    WHEN category = 'plumbing' THEN 'Plumbing Supplies Co'
    ELSE 'General Supplies Ltd'
  END,
  lead_time_days = CASE
    WHEN category = 'chassis' THEN 14
    WHEN category = 'electrical' THEN 7
    ELSE 5
  END
WHERE supplier_name IS NULL;

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to search customers
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
  id UUID,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  company_name VARCHAR,
  customer_type VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.company_name,
    c.customer_type,
    c.status
  FROM customers c
  WHERE 
    search_term IS NULL OR search_term = '' OR
    c.first_name ILIKE '%' || search_term || '%' OR
    c.last_name ILIKE '%' || search_term || '%' OR
    c.email ILIKE '%' || search_term || '%' OR
    c.company_name ILIKE '%' || search_term || '%' OR
    c.phone ILIKE '%' || search_term || '%'
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to handle login tracking
CREATE OR REPLACE FUNCTION handle_user_login(
  p_user_id UUID,
  p_email VARCHAR,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Log the login
  INSERT INTO auth_audit_log (event_type, user_id, email, ip_address, user_agent)
  VALUES ('login_success', p_user_id, p_email, p_ip_address, p_user_agent);
  
  -- Reset failed login attempts
  UPDATE profiles 
  SET 
    failed_login_attempts = 0,
    last_failed_login = NULL
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle failed login
CREATE OR REPLACE FUNCTION handle_failed_login(
  p_email VARCHAR,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_attempts INTEGER;
BEGIN
  -- Get user ID
  SELECT id, failed_login_attempts 
  INTO v_user_id, v_attempts
  FROM profiles 
  WHERE email = p_email;
  
  -- Log the failed attempt
  INSERT INTO auth_audit_log (event_type, user_id, email, ip_address, user_agent)
  VALUES ('login_failed', v_user_id, p_email, p_ip_address, p_user_agent);
  
  -- Update failed attempts
  IF v_user_id IS NOT NULL THEN
    UPDATE profiles 
    SET 
      failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
      last_failed_login = NOW(),
      account_locked_until = CASE 
        WHEN COALESCE(failed_login_attempts, 0) >= 4 
        THEN NOW() + INTERVAL '30 minutes'
        ELSE account_locked_until
      END
    WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked_until TIMESTAMPTZ;
  v_is_active BOOLEAN;
BEGIN
  SELECT account_locked_until, is_active 
  INTO v_locked_until, v_is_active
  FROM profiles 
  WHERE email = p_email;
  
  -- Account is locked if:
  -- 1. is_active is false, OR
  -- 2. account_locked_until is in the future
  RETURN (v_is_active = false) OR (v_locked_until IS NOT NULL AND v_locked_until > NOW());
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINAL MESSAGE
-- =====================================================
SELECT 'Migration completed successfully!' as status,
       (SELECT COUNT(*) FROM customers) as customer_count,
       (SELECT COUNT(*) FROM inventory) as inventory_count,
       (SELECT COUNT(*) FROM profiles) as profile_count;