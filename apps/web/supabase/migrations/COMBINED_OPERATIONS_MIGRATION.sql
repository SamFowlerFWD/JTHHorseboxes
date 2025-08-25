-- COMBINED JTH OPERATIONS MIGRATION


-- ================== 005a_fix_leads_and_contracts.sql ==================
-- =====================================================
-- PART A: Fix Leads Table and Add Contracts
-- =====================================================

-- Add missing columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS configurator_snapshot JSONB,
ADD COLUMN IF NOT EXISTS contract_id UUID,
ADD COLUMN IF NOT EXISTS build_id UUID,
ADD COLUMN IF NOT EXISTS lost_reason TEXT,
ADD COLUMN IF NOT EXISTS competitor TEXT,
ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contract_status VARCHAR(50) DEFAULT 'not_sent';

-- Deal activities log for tracking all interactions
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES auth.users(id),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline automation rules
CREATE TABLE IF NOT EXISTS pipeline_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_stage VARCHAR(50),
  to_stage VARCHAR(50),
  conditions JSONB,
  actions JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts management
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES leads(id),
  template_id UUID,
  document_url TEXT,
  signed_at TIMESTAMPTZ,
  signer_ip INET,
  signer_name VARCHAR(255),
  terms_accepted BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2),
  deposit_paid_at TIMESTAMPTZ,
  total_contract_value DECIMAL(10,2),
  payment_terms TEXT,
  special_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_created_at ON deal_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_deal_id ON contracts(deal_id);

-- Enable RLS
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;


-- ================== 005b_builds_and_stages.sql ==================
-- =====================================================
-- PART B: Create Builds and Stage Management
-- =====================================================

-- Drop the basic production_jobs table if it exists
DROP TABLE IF EXISTS production_jobs CASCADE;

-- Comprehensive builds table
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_number VARCHAR(50) UNIQUE NOT NULL,
  deal_id UUID REFERENCES leads(id),
  customer_id UUID REFERENCES auth.users(id),
  
  -- Configuration
  model VARCHAR(100) NOT NULL,
  configuration JSONB NOT NULL,
  specifications JSONB,
  custom_requirements TEXT,
  
  -- Schedule
  scheduled_start DATE,
  scheduled_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'on_hold', 'completed', 'delivered', 'cancelled'
  )),
  current_stage_id UUID,
  priority INTEGER DEFAULT 5,
  
  -- Assignment
  workshop_manager_id UUID REFERENCES auth.users(id),
  primary_technician_id UUID REFERENCES auth.users(id),
  
  -- Customer visibility
  customer_visible_stage VARCHAR(100),
  last_customer_update TIMESTAMPTZ,
  customer_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage templates for consistency
CREATE TABLE IF NOT EXISTS stage_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model VARCHAR(100),
  name VARCHAR(100) NOT NULL,
  customer_name VARCHAR(100),
  sequence INTEGER,
  estimated_hours DECIMAL(5,2),
  required_tasks JSONB,
  is_customer_visible BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build stages
CREATE TABLE IF NOT EXISTS build_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  stage_template_id UUID REFERENCES stage_templates(id),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL,
  
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'ready', 'in_progress', 'blocked', 
    'review', 'completed', 'approved'
  )),
  blocker_reason TEXT,
  
  is_customer_visible BOOLEAN DEFAULT false,
  customer_stage_name VARCHAR(100),
  customer_message TEXT,
  approved_for_customer_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks within stages
CREATE TABLE IF NOT EXISTS build_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID REFERENCES build_stages(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
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
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build media
CREATE TABLE IF NOT EXISTS build_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Quality checkpoints
CREATE TABLE IF NOT EXISTS quality_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID REFERENCES builds(id),
  stage_id UUID REFERENCES build_stages(id),
  
  check_type VARCHAR(50),
  checklist JSONB,
  passed BOOLEAN,
  notes TEXT,
  requires_rework BOOLEAN DEFAULT false,
  rework_completed BOOLEAN DEFAULT false,
  
  checked_by UUID REFERENCES auth.users(id),
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer updates for portal
CREATE TABLE IF NOT EXISTS customer_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID REFERENCES builds(id),
  stage_name VARCHAR(100),
  message TEXT,
  photos_json JSONB,
  is_milestone BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ,
  seen_by UUID REFERENCES auth.users(id)
);

-- Customer approvals
CREATE TABLE IF NOT EXISTS customer_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID REFERENCES builds(id),
  approval_type VARCHAR(50),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_customer_id ON builds(customer_id);
CREATE INDEX IF NOT EXISTS idx_builds_scheduled_start ON builds(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_build_stages_build_id ON build_stages(build_id);
CREATE INDEX IF NOT EXISTS idx_build_stages_status ON build_stages(status);
CREATE INDEX IF NOT EXISTS idx_build_tasks_stage_id ON build_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_build_tasks_assigned_to ON build_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_build_media_build_id ON build_media(build_id);
CREATE INDEX IF NOT EXISTS idx_customer_updates_build_id ON customer_updates(build_id);

-- Enable RLS
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_approvals ENABLE ROW LEVEL SECURITY;


-- ================== 005c_inventory_and_materials.sql ==================
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


-- ================== 005d_rls_policies.sql ==================
-- =====================================================
-- PART D: RLS Policies and Helper Functions
-- =====================================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = user_id),
    'customer'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff_member(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'sales', 'production', 'workshop', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES POLICIES (if not already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admin can manage all profiles') THEN
    CREATE POLICY "Admin can manage all profiles" ON profiles
      FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'manager'));
  END IF;
END $$;

-- DEALS/LEADS POLICIES
CREATE POLICY "Customers see own deals only" ON leads
  FOR SELECT USING (
    auth.uid() = user_id OR
    email IN (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Sales and admin manage all deals" ON leads
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'sales', 'manager')
  );

CREATE POLICY "Production sees contracted deals" ON leads
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('production', 'workshop') AND
    stage IN ('closed_won', 'contracted')
  );

-- CONTRACTS POLICIES
CREATE POLICY "Customers see own contracts" ON contracts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = contracts.deal_id 
      AND (leads.user_id = auth.uid() OR leads.email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Sales and admin manage contracts" ON contracts
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'sales', 'manager')
  );

-- BUILDS POLICIES
CREATE POLICY "Customers see own builds" ON builds
  FOR SELECT USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = builds.deal_id 
      AND (leads.user_id = auth.uid() OR leads.email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Staff manage builds" ON builds
  FOR ALL USING (is_staff_member(auth.uid()));

-- BUILD STAGES POLICIES
CREATE POLICY "Customers see visible stages only" ON build_stages
  FOR SELECT USING (
    (is_customer_visible = true AND EXISTS (
      SELECT 1 FROM builds 
      WHERE builds.id = build_stages.build_id 
      AND (builds.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = builds.deal_id 
        AND (leads.user_id = auth.uid() OR leads.email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
      ))
    )) OR
    is_staff_member(auth.uid())
  );

CREATE POLICY "Staff manage build stages" ON build_stages
  FOR ALL USING (is_staff_member(auth.uid()));

-- BUILD TASKS POLICIES
CREATE POLICY "Workshop sees assigned tasks" ON build_tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

CREATE POLICY "Workshop updates own tasks" ON build_tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

CREATE POLICY "Production manages all tasks" ON build_tasks
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

-- BUILD MEDIA POLICIES
CREATE POLICY "Customers see visible media only" ON build_media
  FOR SELECT USING (
    (is_customer_visible = true AND EXISTS (
      SELECT 1 FROM builds 
      WHERE builds.id = build_media.build_id 
      AND (builds.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = builds.deal_id 
        AND (leads.user_id = auth.uid() OR leads.email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
      ))
    )) OR
    is_staff_member(auth.uid())
  );

CREATE POLICY "Staff manage media" ON build_media
  FOR ALL USING (is_staff_member(auth.uid()));

-- CUSTOMER UPDATES POLICIES
CREATE POLICY "Customers see own updates" ON customer_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM builds 
      WHERE builds.id = customer_updates.build_id 
      AND (builds.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = builds.deal_id 
        AND (leads.user_id = auth.uid() OR leads.email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
      ))
    )
  );

CREATE POLICY "Staff manage customer updates" ON customer_updates
  FOR ALL USING (is_staff_member(auth.uid()));

-- INVENTORY POLICIES
CREATE POLICY "Production and workshop view inventory" ON inventory
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'workshop', 'manager')
  );

CREATE POLICY "Production manages inventory" ON inventory
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

-- MATERIAL REQUIREMENTS POLICIES
CREATE POLICY "Production manages material requirements" ON material_requirements
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

CREATE POLICY "Workshop views material requirements" ON material_requirements
  FOR SELECT USING (get_user_role(auth.uid()) IN ('workshop'));

-- SUPPLIERS POLICIES
CREATE POLICY "Staff view suppliers" ON suppliers
  FOR SELECT USING (is_staff_member(auth.uid()));

CREATE POLICY "Admin and production manage suppliers" ON suppliers
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

-- PURCHASE ORDERS POLICIES
CREATE POLICY "Production manages purchase orders" ON purchase_orders
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'manager')
  );

-- QUALITY CHECKS POLICIES
CREATE POLICY "Production manages quality checks" ON quality_checks
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'workshop', 'manager')
  );

-- DEAL ACTIVITIES POLICIES
CREATE POLICY "Sales view all activities" ON deal_activities
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'sales', 'manager')
  );

CREATE POLICY "Users create own activities" ON deal_activities
  FOR INSERT WITH CHECK (
    performed_by = auth.uid() AND
    is_staff_member(auth.uid())
  );

-- PIPELINE AUTOMATIONS POLICIES
CREATE POLICY "Admin manages automations" ON pipeline_automations
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Sales views automations" ON pipeline_automations
  FOR SELECT USING (get_user_role(auth.uid()) IN ('sales'));

-- STAGE TEMPLATES POLICIES
CREATE POLICY "Staff view stage templates" ON stage_templates
  FOR SELECT USING (is_staff_member(auth.uid()));

CREATE POLICY "Admin manages stage templates" ON stage_templates
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- BILL OF MATERIALS POLICIES
CREATE POLICY "Production views BoM" ON bill_of_materials
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'production', 'workshop', 'manager')
  );

CREATE POLICY "Admin manages BoM" ON bill_of_materials
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- CUSTOMER APPROVALS POLICIES
CREATE POLICY "Customers manage own approvals" ON customer_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM builds 
      WHERE builds.id = customer_approvals.build_id 
      AND (builds.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = builds.deal_id 
        AND (leads.user_id = auth.uid() OR leads.email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
      ))
    ) OR
    is_staff_member(auth.uid())
  );

-- ORDERS POLICIES
CREATE POLICY "Customers see own orders" ON orders
  FOR SELECT USING (
    customer_id = auth.uid() OR
    customer_email IN (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Staff manage orders" ON orders
  FOR ALL USING (is_staff_member(auth.uid()));


-- ================== 005e_triggers_and_data.sql ==================
-- =====================================================
-- PART E: Triggers and Default Data
-- =====================================================

-- Ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables with updated_at
DO $$ 
BEGIN
  -- Contracts
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contracts_updated_at') THEN
    CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Builds
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_builds_updated_at') THEN
    CREATE TRIGGER update_builds_updated_at BEFORE UPDATE ON builds
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Build stages
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_build_stages_updated_at') THEN
    CREATE TRIGGER update_build_stages_updated_at BEFORE UPDATE ON build_stages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Build tasks
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_build_tasks_updated_at') THEN
    CREATE TRIGGER update_build_tasks_updated_at BEFORE UPDATE ON build_tasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Inventory
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_updated_at') THEN
    CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Purchase orders
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_purchase_orders_updated_at') THEN
    CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Suppliers
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_suppliers_updated_at') THEN
    CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Bill of materials
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bill_of_materials_updated_at') THEN
    CREATE TRIGGER update_bill_of_materials_updated_at BEFORE UPDATE ON bill_of_materials
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Pipeline automations
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pipeline_automations_updated_at') THEN
    CREATE TRIGGER update_pipeline_automations_updated_at BEFORE UPDATE ON pipeline_automations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- DEFAULT STAGE TEMPLATES
-- =====================================================

INSERT INTO stage_templates (model, name, customer_name, sequence, estimated_hours, is_customer_visible, requires_approval) VALUES
-- Professional 3.5t stages
('Professional 3.5t', 'Chassis Preparation', 'Order Confirmed', 1, 16, true, false),
('Professional 3.5t', 'Floor & Wall Construction', 'Frame Construction', 2, 24, true, false),
('Professional 3.5t', 'Electrical Installation', 'Systems Installation', 3, 16, false, false),
('Professional 3.5t', 'Plumbing Installation', 'Systems Installation', 4, 12, false, false),
('Professional 3.5t', 'Interior Fit-Out', 'Interior Work', 5, 32, true, true),
('Professional 3.5t', 'Painting & Finishing', 'Finishing Touches', 6, 20, true, true),
('Professional 3.5t', 'Testing & Quality Control', 'Quality Control', 7, 8, false, false),
('Professional 3.5t', 'Final Inspection & PDI', 'Ready for Collection', 8, 4, true, true),

-- Aeos 4.5t stages
('Aeos 4.5t', 'Chassis Preparation', 'Order Confirmed', 1, 18, true, false),
('Aeos 4.5t', 'Floor & Wall Construction', 'Frame Construction', 2, 28, true, false),
('Aeos 4.5t', 'Electrical Installation', 'Systems Installation', 3, 18, false, false),
('Aeos 4.5t', 'Plumbing Installation', 'Systems Installation', 4, 14, false, false),
('Aeos 4.5t', 'Interior Fit-Out', 'Interior Work', 5, 36, true, true),
('Aeos 4.5t', 'Painting & Finishing', 'Finishing Touches', 6, 24, true, true),
('Aeos 4.5t', 'Testing & Quality Control', 'Quality Control', 7, 10, false, false),
('Aeos 4.5t', 'Final Inspection & PDI', 'Ready for Collection', 8, 4, true, true),

-- Zenos 7.2t stages
('Zenos 7.2t', 'Chassis Preparation', 'Order Confirmed', 1, 24, true, false),
('Zenos 7.2t', 'Floor & Wall Construction', 'Frame Construction', 2, 36, true, false),
('Zenos 7.2t', 'Electrical Installation', 'Systems Installation', 3, 24, false, false),
('Zenos 7.2t', 'Plumbing Installation', 'Systems Installation', 4, 18, false, false),
('Zenos 7.2t', 'Interior Fit-Out', 'Interior Work', 5, 48, true, true),
('Zenos 7.2t', 'Painting & Finishing', 'Finishing Touches', 6, 32, true, true),
('Zenos 7.2t', 'Testing & Quality Control', 'Quality Control', 7, 12, false, false),
('Zenos 7.2t', 'Final Inspection & PDI', 'Ready for Collection', 8, 6, true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PIPELINE AUTOMATION RULES
-- =====================================================

INSERT INTO pipeline_automations (from_stage, to_stage, conditions, actions, active) VALUES
('quotation', 'negotiation', '{"quote_sent": true}', '{"send_email": "quote_followup", "set_reminder": 3}', true),
('negotiation', 'closed_won', '{"deposit_received": true}', '{"create_contract": true, "create_build": true, "send_email": "welcome"}', true),
('closed_won', 'contracted', '{"contract_signed": true}', '{"lock_configuration": true, "schedule_build": true, "notify_production": true}', true),
('inquiry', 'qualification', '{"contact_info_complete": true}', '{"assign_salesperson": true, "calculate_lead_score": true}', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

