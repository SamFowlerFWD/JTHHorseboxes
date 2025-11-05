-- =====================================================
-- IMMEDIATE FIX: Run this in Supabase SQL Editor
-- =====================================================
-- This creates just the essential tables to get the ops platform working
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CUSTOMERS TABLE (Essential)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    customer_type VARCHAR(50) DEFAULT 'individual',
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ENHANCE PROFILES TABLE
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- =====================================================
-- 3. ENHANCE INVENTORY TABLE
-- =====================================================
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS part_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock DECIMAL(10,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'in_stock',
ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ;

-- Update existing inventory columns
UPDATE inventory 
SET 
  part_number = COALESCE(part_number, part_code),
  name = COALESCE(name, description),
  current_stock = COALESCE(current_stock, quantity_on_hand, 0),
  last_restocked = COALESCE(last_restocked, created_at, NOW())
WHERE part_number IS NULL OR name IS NULL OR current_stock IS NULL;

-- =====================================================
-- 4. CREATE AUTH AUDIT LOG
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
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE BASIC POLICIES
-- =====================================================
-- Allow authenticated users to read customers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow authenticated read'
    ) THEN
        CREATE POLICY "Allow authenticated read" ON customers 
        FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Allow authenticated users to manage customers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow authenticated write'
    ) THEN
        CREATE POLICY "Allow authenticated write" ON customers 
        FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- =====================================================
-- 7. INSERT SAMPLE DATA
-- =====================================================
INSERT INTO customers (first_name, last_name, email, phone, company, status) VALUES
('Sarah', 'Thompson', 'sarah.thompson@example.com', '07700 900123', 'Thompson Equestrian', 'active'),
('James', 'Mitchell', 'james.m@horsebox.co.uk', '07700 900456', 'Mitchell Stables', 'active'),
('Emily', 'Roberts', 'emily.roberts@gmail.com', '07700 900789', NULL, 'active')
ON CONFLICT (email) DO NOTHING;

-- Update sample inventory if exists
UPDATE inventory SET 
  current_stock = 12,
  min_stock = 5,
  max_stock = 50,
  status = 'in_stock'
WHERE part_number = 'CHK-001' OR part_code = 'CHK-001';

-- =====================================================
-- 8. VALIDATION QUERY
-- =====================================================
SELECT 
  'Database Setup Complete!' as status,
  (SELECT COUNT(*) FROM customers) as customer_count,
  (SELECT COUNT(*) FROM inventory WHERE current_stock IS NOT NULL) as inventory_items,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('customers', 'inventory')) as policies,
  NOW() as completed_at;