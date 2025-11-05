-- QUICK SETUP: Essential tables only
-- Run this if you need to get started quickly

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure profiles table has required columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create customers table (simplified)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  total_orders INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table (simplified)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number VARCHAR(100),
  name VARCHAR(255),
  category VARCHAR(50),
  description TEXT,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  max_stock DECIMAL(10,2) DEFAULT 100,
  reorder_point DECIMAL(10,2) DEFAULT 10,
  unit VARCHAR(20) DEFAULT 'units',
  location VARCHAR(100),
  unit_cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_stock',
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Allow authenticated read" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON inventory FOR SELECT TO authenticated USING (true);

-- Insert sample data
INSERT INTO customers (name, email, phone, company, status) VALUES
('Lehel International Ltd', 'info@lehelinternational.com', '01524 851500', 'Lehel International', 'active'),
('Bloomfields Horseboxes', 'sales@bloomfields.co', '01487 831100', 'Bloomfields', 'active'),
('Private Customer', 'john.smith@email.com', '07700 900000', NULL, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (part_number, name, category, current_stock, min_stock, max_stock) VALUES
('CHK-001', 'Chassis Main Beam', 'chassis', 12, 5, 50),
('ELC-045', 'LED Tail Light Assembly', 'electrical', 3, 10, 40),
('PLB-012', 'Water Tank 100L', 'plumbing', 8, 5, 20)
ON CONFLICT DO NOTHING;

SELECT 'Quick setup complete!' as status;