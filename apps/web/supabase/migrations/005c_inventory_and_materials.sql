-- =====================================================
-- PART C: Inventory and Materials Management
-- =====================================================

-- Bill of Materials templates
CREATE TABLE IF NOT EXISTS bill_of_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model VARCHAR(100),
  base_bom_json JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material requirements for builds
CREATE TABLE IF NOT EXISTS material_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID REFERENCES builds(id),
  part_id UUID,
  part_code VARCHAR(100),
  description TEXT,
  quantity_needed DECIMAL(10,2),
  quantity_reserved DECIMAL(10,2),
  quantity_issued DECIMAL(10,2),
  quantity_short DECIMAL(10,2),
  required_by_stage VARCHAR(50),
  required_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory management
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  unit VARCHAR(20),
  quantity_on_hand DECIMAL(10,2),
  quantity_reserved DECIMAL(10,2),
  quantity_available DECIMAL(10,2) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  reorder_point DECIMAL(10,2),
  reorder_quantity DECIMAL(10,2),
  supplier_id UUID,
  location VARCHAR(100),
  last_counted DATE,
  unit_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier details
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  lead_time_days INTEGER,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name VARCHAR(255),
  items_json JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  total_amount DECIMAL(10,2),
  ordered_date DATE,
  expected_date DATE,
  received_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update orders table to reference builds
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS build_id UUID REFERENCES builds(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_part_code ON inventory(part_code);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_material_requirements_build_id ON material_requirements(build_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Enable RLS
ALTER TABLE bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;