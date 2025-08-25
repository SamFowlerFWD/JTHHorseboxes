-- =====================================================
-- JTH OPERATIONS PLATFORM - COMPLETE MIGRATION
-- =====================================================
-- Run this in Supabase SQL Editor at:
-- https://app.supabase.com/project/nsbybnsmhvviofzfgphb/sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: EXTEND LEADS TABLE FOR PIPELINE
-- =====================================================

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'inquiry',
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS configurator_snapshot JSONB,
ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS contract_id UUID,
ADD COLUMN IF NOT EXISTS build_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS lost_reason TEXT,
ADD COLUMN IF NOT EXISTS competitor TEXT,
ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contract_status VARCHAR(50) DEFAULT 'not_sent';

-- =====================================================
-- PART 2: CREATE CORE TABLES
-- =====================================================

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES leads(id),
  template_id UUID,
  document_url TEXT,
  signed_at TIMESTAMPTZ,
  signer_ip INET,
  signer_name VARCHAR(255),
  total_contract_value DECIMAL(10,2),
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builds table (comprehensive version)
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_number VARCHAR(50) UNIQUE NOT NULL,
  deal_id UUID REFERENCES leads(id),
  customer_id UUID REFERENCES auth.users(id),
  model VARCHAR(100) NOT NULL,
  configuration JSONB NOT NULL,
  specifications JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  current_stage_id UUID,
  priority INTEGER DEFAULT 5,
  scheduled_start DATE,
  scheduled_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  workshop_manager_id UUID REFERENCES auth.users(id),
  primary_technician_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build stages table
CREATE TABLE IF NOT EXISTS build_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  stage_template_id UUID,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  blocker_reason TEXT,
  is_customer_visible BOOLEAN DEFAULT false,
  customer_stage_name VARCHAR(100),
  customer_message TEXT,
  approved_for_customer_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build tasks table
CREATE TABLE IF NOT EXISTS build_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES build_stages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  checklist_items JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  time_logged_minutes INTEGER,
  requires_photo BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  validation_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build media table
CREATE TABLE IF NOT EXISTS build_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES build_stages(id),
  task_id UUID REFERENCES build_tasks(id),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type VARCHAR(50),
  file_size INTEGER,
  caption TEXT,
  is_customer_visible BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[]
);

-- Deal activities log
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES auth.users(id),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline automations
CREATE TABLE IF NOT EXISTS pipeline_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_stage VARCHAR(50),
  to_stage VARCHAR(50),
  conditions JSONB,
  actions JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage templates for consistency
CREATE TABLE IF NOT EXISTS stage_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model VARCHAR(100),
  name VARCHAR(100) NOT NULL,
  customer_name VARCHAR(100),
  sequence INTEGER,
  estimated_hours DECIMAL(5,2),
  required_tasks JSONB,
  is_customer_visible BOOLEAN DEFAULT false
);

-- Quality checks
CREATE TABLE IF NOT EXISTS quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id),
  stage_id UUID REFERENCES build_stages(id),
  check_type VARCHAR(50),
  checklist JSONB,
  passed BOOLEAN,
  notes TEXT,
  checked_by UUID REFERENCES auth.users(id),
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer updates for portal
CREATE TABLE IF NOT EXISTS customer_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id),
  stage_name VARCHAR(100),
  message TEXT,
  photos_json JSONB,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ
);

-- =====================================================
-- PART 3: INVENTORY MANAGEMENT
-- =====================================================

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2),
  supplier_id UUID,
  location VARCHAR(100),
  last_counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  lead_time_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  status VARCHAR(50) DEFAULT 'draft',
  items_json JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  ordered_date DATE,
  expected_date DATE,
  received_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill of materials
CREATE TABLE IF NOT EXISTS bill_of_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model VARCHAR(100) NOT NULL,
  base_bom_json JSONB NOT NULL,
  version VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material requirements
CREATE TABLE IF NOT EXISTS material_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id),
  part_id UUID REFERENCES inventory(id),
  quantity_needed INTEGER NOT NULL,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_short INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 4: PROFILES TABLE (IF MISSING)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer',
  company VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: BASIC RLS POLICIES
-- =====================================================

-- Allow authenticated users to read most data
CREATE POLICY "Allow authenticated read" ON contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON builds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON build_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON build_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON stage_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON profiles FOR SELECT TO authenticated USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins full access (you'll need to implement role checking)
CREATE POLICY "Admins have full access" ON contracts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  
CREATE POLICY "Admins have full access" ON builds FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- PART 7: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_deal_id ON builds(deal_id);
CREATE INDEX IF NOT EXISTS idx_build_stages_build_id ON build_stages(build_id);
CREATE INDEX IF NOT EXISTS idx_build_stages_status ON build_stages(status);
CREATE INDEX IF NOT EXISTS idx_inventory_part_code ON inventory(part_code);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity_on_hand);
CREATE INDEX IF NOT EXISTS idx_contracts_deal_id ON contracts(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_created_at ON deal_activities(created_at DESC);

-- =====================================================
-- PART 8: SAMPLE DATA
-- =====================================================

-- Insert stage templates
INSERT INTO stage_templates (model, name, customer_name, sequence, estimated_hours, is_customer_visible)
VALUES 
  ('Professional 35', 'Chassis Preparation', 'Preparation', 1, 16, true),
  ('Professional 35', 'Floor and Walls', 'Construction', 2, 24, true),
  ('Professional 35', 'Electrical Systems', 'Systems Installation', 3, 18, true),
  ('Professional 35', 'Plumbing Installation', 'Systems Installation', 4, 12, true),
  ('Professional 35', 'Interior Fit-Out', 'Interior Work', 5, 32, true),
  ('Professional 35', 'Painting and Graphics', 'Finishing', 6, 20, true),
  ('Professional 35', 'Testing and PDI', 'Quality Control', 7, 8, true),
  ('Professional 35', 'Final Inspection', 'Ready for Collection', 8, 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory (part_code, description, category, quantity_on_hand, reorder_point, unit_price)
VALUES 
  ('CHASSIS-35T', '3.5 Tonne Chassis', 'Chassis', 5, 2, 15000.00),
  ('DOOR-STD', 'Standard Door Unit', 'Doors', 12, 5, 850.00),
  ('WINDOW-SIDE', 'Side Window', 'Windows', 8, 4, 320.00),
  ('FLOOR-PLY-18', '18mm Plywood Flooring', 'Materials', 25, 10, 45.00),
  ('PARTITION-STD', 'Standard Partition', 'Interior', 6, 3, 280.00)
ON CONFLICT (part_code) DO NOTHING;

-- Insert pipeline automation rules
INSERT INTO pipeline_automations (from_stage, to_stage, conditions, actions, active)
VALUES 
  ('qualifying', 'quoted', '{"quote_sent": true}', '{"send_email": "quote_follow_up"}', true),
  ('negotiating', 'committed', '{"deposit_received": true}', '{"lock_configuration": true}', true),
  ('committed', 'contracted', '{"contract_signed": true}', '{"create_build": true, "send_email": "welcome"}', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 9: TRIGGER FUNCTIONS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at BEFORE UPDATE ON builds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Verify installation
SELECT 
  'Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM stage_templates) as stage_templates_count,
  (SELECT COUNT(*) FROM inventory) as inventory_items_count,
  (SELECT COUNT(*) FROM pipeline_automations) as automation_rules_count;

-- =====================================================
-- After running this migration:
-- 1. Test the Operations Dashboard at /ops
-- 2. Test the Sales Pipeline at /ops/pipeline
-- 3. Test Build Tracking at /ops/builds
-- 4. Test Customer Portal at /portal/tracker/[buildId]
-- =====================================================