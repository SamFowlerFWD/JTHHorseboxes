-- =====================================================
-- REMAINING TABLES MIGRATION - LEADS, QUOTES, INVENTORY
-- J Taylor Horseboxes (FIXED VERSION)
-- Generated: 2025-01-17
-- =====================================================
--
-- This creates the remaining core tables:
-- - leads (lead management system)
-- - quotes (quote generation and tracking)
-- - inventory (horsebox inventory management)
-- - profiles (if it doesn't exist)
--
-- FIXED: Handles existing triggers gracefully
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (Create if doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'sales', 'manager', 'viewer')),
    avatar_url TEXT,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    locked_until TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_profile_email UNIQUE(email)
);

-- =====================================================
-- LEADS TABLE
-- =====================================================
DROP TABLE IF EXISTS lead_activities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Contact information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),

    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_county VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United Kingdom',

    -- Lead classification
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived')),
    stage VARCHAR(50) DEFAULT 'inquiry' CHECK (stage IN ('inquiry', 'consultation', 'specification', 'quotation', 'follow_up', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Lead source tracking
    source VARCHAR(100) DEFAULT 'website',
    source_campaign VARCHAR(255),
    source_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Requirements
    horsebox_type VARCHAR(50),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    timeline VARCHAR(100),
    requirements TEXT,

    -- Qualification
    is_qualified BOOLEAN DEFAULT false,
    qualification_score INTEGER CHECK (qualification_score BETWEEN 0 AND 100),
    qualification_notes TEXT,

    -- Assignment
    assigned_to UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ,

    -- Communication tracking
    last_contact_date TIMESTAMPTZ,
    next_follow_up_date TIMESTAMPTZ,
    contact_attempts INTEGER DEFAULT 0,

    -- Conversion tracking
    converted_to_customer_id UUID REFERENCES customers(id),
    converted_at TIMESTAMPTZ,
    lost_reason VARCHAR(255),
    lost_notes TEXT,

    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- LEAD ACTIVITIES TABLE
-- =====================================================
CREATE TABLE lead_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note', 'status_change', 'quote_sent', 'follow_up')),
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(100),
    performed_by UUID REFERENCES profiles(id),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTES TABLE
-- =====================================================
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;

CREATE TABLE quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Quote identification
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    version INTEGER DEFAULT 1,
    parent_quote_id UUID REFERENCES quotes(id),

    -- Customer/Lead relationship
    customer_id UUID REFERENCES customers(id),
    lead_id UUID REFERENCES leads(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_company VARCHAR(255),

    -- Quote details
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'superseded')),

    -- Horsebox specification
    horsebox_model VARCHAR(100) NOT NULL,
    horsebox_type VARCHAR(50) NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,

    -- Configuration (from configurator)
    configuration JSONB,

    -- Pricing breakdown
    options_total DECIMAL(12,2) DEFAULT 0.00,
    extras_total DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    net_total DECIMAL(12,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,

    -- Finance options
    finance_available BOOLEAN DEFAULT false,
    finance_deposit DECIMAL(10,2),
    finance_term_months INTEGER,
    finance_monthly_payment DECIMAL(10,2),
    finance_total_payable DECIMAL(12,2),
    finance_apr DECIMAL(5,2),

    -- Validity and timing
    valid_until DATE,
    build_time_weeks INTEGER,
    expected_delivery_date DATE,

    -- Terms and conditions
    terms TEXT,
    notes TEXT,
    internal_notes TEXT,

    -- PDF generation
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,

    -- Communication tracking
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Assignment
    created_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),

    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTE ITEMS TABLE
-- =====================================================
CREATE TABLE quote_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('base', 'option', 'extra', 'discount', 'fee')),
    category VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVENTORY TABLE
-- =====================================================
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

CREATE TABLE inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Identification
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),

    -- Horsebox specific
    horsebox_type VARCHAR(50),
    model VARCHAR(100),
    variant VARCHAR(100),
    registration VARCHAR(20),
    chassis_number VARCHAR(100),
    year_built INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'in_build', 'maintenance', 'discontinued')),
    condition VARCHAR(50) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished', 'damaged')),

    -- Stock tracking
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    reorder_level INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,

    -- Location
    location VARCHAR(255),
    location_details VARCHAR(255),

    -- Pricing
    cost_price DECIMAL(10,2),
    sale_price DECIMAL(12,2) NOT NULL,
    rrp DECIMAL(12,2),

    -- Supplier information
    supplier_name VARCHAR(255),
    supplier_sku VARCHAR(100),
    supplier_lead_time_days INTEGER,

    -- Specifications
    specifications JSONB,

    -- Images
    images TEXT[],
    primary_image_url TEXT,

    -- Metadata
    tags TEXT[],
    notes TEXT,

    -- Tracking
    last_stock_check_date DATE,
    last_movement_date TIMESTAMPTZ,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- INVENTORY MOVEMENTS TABLE
-- =====================================================
CREATE TABLE inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'transfer', 'reservation', 'return', 'damage', 'write_off')),
    quantity INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT,
    notes TEXT,
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADD FOREIGN KEYS TO EXISTING TABLES
-- =====================================================

-- Add foreign keys to customers table (now that leads exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_customers_lead'
    ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT fk_customers_lead
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign keys to customer_orders table (now that quotes exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_quote'
    ) THEN
        ALTER TABLE customer_orders
        ADD CONSTRAINT fk_orders_quote
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_converted ON leads(converted_to_customer_id) WHERE converted_to_customer_id IS NOT NULL;

-- Full-text search for leads
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads
    USING gin(to_tsvector('english',
        coalesce(first_name, '') || ' ' ||
        coalesce(last_name, '') || ' ' ||
        coalesce(company, '') || ' ' ||
        coalesce(email, '')
    ));

-- Lead activities indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created ON lead_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_scheduled ON lead_activities(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_lead ON quotes(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until) WHERE valid_until IS NOT NULL;

-- Quote items indexes
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_type ON quote_items(item_type);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory(horsebox_type) WHERE horsebox_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity) WHERE available_quantity > 0;

-- Full-text search for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory
    USING gin(to_tsvector('english',
        coalesce(name, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(model, '') || ' ' ||
        coalesce(sku, '')
    ));

-- Inventory movements indexes
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);

-- =====================================================
-- TRIGGERS (DROP EXISTING FIRST)
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view lead activities" ON lead_activities;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON lead_activities;
DROP POLICY IF EXISTS "Authenticated users can view quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can view quote items" ON quote_items;
DROP POLICY IF EXISTS "Authenticated users can manage quote items" ON quote_items;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can view movements" ON inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can record movements" ON inventory_movements;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view lead activities" ON lead_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create activities" ON lead_activities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view quotes" ON quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create quotes" ON quotes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update quotes" ON quotes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view quote items" ON quote_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage quote items" ON quote_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage inventory" ON inventory FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view movements" ON inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can record movements" ON inventory_movements FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to adjust inventory stock
CREATE OR REPLACE FUNCTION adjust_inventory_stock(
    p_inventory_id UUID,
    p_quantity INTEGER,
    p_movement_type VARCHAR(50),
    p_reason TEXT DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT stock_quantity INTO v_current_stock
    FROM inventory
    WHERE id = p_inventory_id;

    -- Calculate new stock
    v_new_stock := v_current_stock + p_quantity;

    -- Update inventory
    UPDATE inventory
    SET stock_quantity = v_new_stock,
        last_movement_date = NOW()
    WHERE id = p_inventory_id;

    -- Record movement
    INSERT INTO inventory_movements (
        inventory_id,
        movement_type,
        quantity,
        quantity_before,
        quantity_after,
        reference_type,
        reference_id,
        reason,
        performed_by
    ) VALUES (
        p_inventory_id,
        p_movement_type,
        p_quantity,
        v_current_stock,
        v_new_stock,
        p_reference_type,
        p_reference_id,
        p_reason,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert lead to customer
CREATE OR REPLACE FUNCTION convert_lead_to_customer(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_lead RECORD;
BEGIN
    -- Get lead details
    SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

    IF v_lead IS NULL THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;

    -- Create customer
    INSERT INTO customers (
        first_name,
        last_name,
        email,
        phone,
        company,
        address_street,
        address_city,
        address_county,
        address_postcode,
        address_country,
        status,
        acquisition_source,
        lead_id,
        notes,
        tags
    ) VALUES (
        v_lead.first_name,
        v_lead.last_name,
        v_lead.email,
        v_lead.phone,
        v_lead.company,
        v_lead.address_street,
        v_lead.address_city,
        v_lead.address_county,
        v_lead.address_postcode,
        v_lead.address_country,
        'active',
        v_lead.source,
        v_lead.id,
        v_lead.notes,
        v_lead.tags
    )
    RETURNING id INTO v_customer_id;

    -- Update lead
    UPDATE leads
    SET status = 'won',
        converted_to_customer_id = v_customer_id,
        converted_at = NOW()
    WHERE id = p_lead_id;

    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
SELECT
    'Migration completed successfully!' AS status,
    'Tables created: profiles, leads, lead_activities, quotes, quote_items, inventory, inventory_movements' AS tables,
    'Foreign keys added to customers and customer_orders' AS relationships,
    'RLS policies enabled, indexes created' AS security_performance;
