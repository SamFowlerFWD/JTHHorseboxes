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