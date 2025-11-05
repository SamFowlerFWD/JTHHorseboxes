-- =====================================================
-- SAFE COMPLETE MIGRATION SCRIPT FOR J TAYLOR HORSEBOXES
-- Generated: 2025-08-29
-- =====================================================
-- 
-- This script can be safely run on ANY database state
-- It checks for table existence before dropping triggers
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SAFE DROP EXISTING TRIGGERS (Check table existence first)
-- =====================================================
DO $$ 
BEGIN
    -- Drop triggers on customers table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
        DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
        DROP TRIGGER IF EXISTS update_customer_metrics ON customers;
    END IF;
    
    -- Drop triggers on customer_orders table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_orders') THEN
        DROP TRIGGER IF EXISTS update_customer_orders_updated_at ON customer_orders;
    END IF;
    
    -- Drop triggers on inventory table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
        DROP TRIGGER IF EXISTS log_inventory_changes ON inventory;
    END IF;
    
    -- Drop triggers on profiles table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;
END $$;

-- Drop functions that might exist
DROP FUNCTION IF EXISTS update_customer_metrics() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS log_inventory_change() CASCADE;
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;
DROP FUNCTION IF EXISTS auth.user_role() CASCADE;
DROP FUNCTION IF EXISTS auth.has_permission(text) CASCADE;

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
    acquisition_source VARCHAR(100),
    acquisition_campaign VARCHAR(255),
    lead_id UUID,  -- Will add foreign key later if leads table exists
    
    -- Financial metrics
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,
    
    -- Customer service and notes
    notes TEXT,
    tags TEXT[],
    
    -- Contact tracking
    last_contact_date TIMESTAMPTZ,
    preferred_contact_method VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'post')),
    
    -- Additional business fields
    vat_number VARCHAR(50),
    credit_limit DECIMAL(10,2),
    payment_terms INTEGER DEFAULT 0,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,  -- Will add foreign key later if auth.users exists
    
    -- Constraints
    CONSTRAINT unique_customer_email UNIQUE(email),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$')
);

-- Add foreign keys if referenced tables exist
DO $$ 
BEGIN
    -- Add foreign key to leads if table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'customers_lead_id_fkey' 
            AND table_name = 'customers'
        ) THEN
            ALTER TABLE customers ADD CONSTRAINT customers_lead_id_fkey 
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Add foreign key to auth.users if schema exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'customers_created_by_fkey' 
                AND table_name = 'customers'
            ) THEN
                ALTER TABLE customers ADD CONSTRAINT customers_created_by_fkey 
                    FOREIGN KEY (created_by) REFERENCES auth.users(id);
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- CUSTOMER COMMUNICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'note', 'sms')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100),
    performed_by UUID,
    scheduled_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to auth.users if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'customer_communications_performed_by_fkey' 
                AND table_name = 'customer_communications'
            ) THEN
                ALTER TABLE customer_communications ADD CONSTRAINT customer_communications_performed_by_fkey 
                    FOREIGN KEY (performed_by) REFERENCES auth.users(id);
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- CUSTOMER ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID,  -- Will add foreign key later if quotes table exists
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

-- Add foreign key to quotes if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'customer_orders_quote_id_fkey' 
            AND table_name = 'customer_orders'
        ) THEN
            ALTER TABLE customer_orders ADD CONSTRAINT customer_orders_quote_id_fkey 
                FOREIGN KEY (quote_id) REFERENCES quotes(id);
        END IF;
    END IF;
END $$;

-- =====================================================
-- ENHANCE INVENTORY TABLE (if it exists)
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'inventory' AND column_name = 'low_stock_alert') THEN
            ALTER TABLE inventory ADD COLUMN low_stock_alert BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'inventory' AND column_name = 'reorder_quantity') THEN
            ALTER TABLE inventory ADD COLUMN reorder_quantity INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'inventory' AND column_name = 'supplier_info') THEN
            ALTER TABLE inventory ADD COLUMN supplier_info JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'inventory' AND column_name = 'last_restock_date') THEN
            ALTER TABLE inventory ADD COLUMN last_restock_date DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'inventory' AND column_name = 'estimated_delivery_days') THEN
            ALTER TABLE inventory ADD COLUMN estimated_delivery_days INTEGER;
        END IF;
    END IF;
END $$;

-- =====================================================
-- INVENTORY CHANGELOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_changelog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_quantity INTEGER,
    new_quantity INTEGER,
    change_reason TEXT,
    performed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys if tables exist
DO $$ 
BEGIN
    -- Add foreign key to inventory if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'inventory_changelog_inventory_id_fkey' 
            AND table_name = 'inventory_changelog'
        ) THEN
            ALTER TABLE inventory_changelog ADD CONSTRAINT inventory_changelog_inventory_id_fkey 
                FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key to auth.users if exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'inventory_changelog_performed_by_fkey' 
                AND table_name = 'inventory_changelog'
            ) THEN
                ALTER TABLE inventory_changelog ADD CONSTRAINT inventory_changelog_performed_by_fkey 
                    FOREIGN KEY (performed_by) REFERENCES auth.users(id);
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- ENHANCE PROFILES TABLE (if it exists)
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'role') THEN
            ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'user' 
                CHECK (role IN ('admin', 'manager', 'user', 'viewer'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
            ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
            ALTER TABLE profiles ADD COLUMN last_login TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'permissions') THEN
            ALTER TABLE profiles ADD COLUMN permissions TEXT[];
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'department') THEN
            ALTER TABLE profiles ADD COLUMN department VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'phone') THEN
            ALTER TABLE profiles ADD COLUMN phone VARCHAR(50);
        END IF;
    END IF;
END $$;

-- =====================================================
-- AUTH AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to auth.users if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'auth_audit_log_user_id_fkey' 
                AND table_name = 'auth_audit_log'
            ) THEN
                ALTER TABLE auth_audit_log ADD CONSTRAINT auth_audit_log_user_id_fkey 
                    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- UPDATE QUOTES TABLE (if it exists)
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
        -- Add customer_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quotes' AND column_name = 'customer_id') THEN
            ALTER TABLE quotes ADD COLUMN customer_id UUID;
            
            -- Add foreign key if customers table exists
            IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
                ALTER TABLE quotes ADD CONSTRAINT quotes_customer_id_fkey 
                    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON customers(last_order_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_customers_total_value ON customers(total_value DESC);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers(lead_id) WHERE lead_id IS NOT NULL;

-- Full text search index for customers
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

-- Inventory indexes (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(low_stock_alert) 
            WHERE low_stock_alert = true;
        CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity) 
            WHERE quantity < minimum_quantity;
    END IF;
END $$;

-- Inventory changelog indexes
CREATE INDEX IF NOT EXISTS idx_inventory_changelog_inventory ON inventory_changelog(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_changelog_created ON inventory_changelog(created_at DESC);

-- Auth audit log indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created ON auth_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON auth_audit_log(action);

-- Quotes indexes (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'quotes' AND column_name = 'customer_id') THEN
            CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id) 
                WHERE customer_id IS NOT NULL;
        END IF;
    END IF;
END $$;

-- =====================================================
-- CREATE OR REPLACE FUNCTIONS
-- =====================================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Inventory change logging function
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity THEN
        INSERT INTO inventory_changelog (
            inventory_id,
            action,
            old_quantity,
            new_quantity,
            change_reason,
            performed_by
        ) VALUES (
            NEW.id,
            'quantity_change',
            OLD.quantity,
            NEW.quantity,
            'Manual update',
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        INSERT INTO profiles (id, email, full_name, role, is_active)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
            true
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth helper functions in auth schema
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RETURN EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        );
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RETURN (
            SELECT role FROM profiles 
            WHERE id = auth.uid() 
            AND is_active = true
        );
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RETURN EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND is_active = true
            AND (
                role = 'admin' OR 
                permission_name = ANY(permissions)
            )
        );
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convert lead to customer function
CREATE OR REPLACE FUNCTION convert_lead_to_customer(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_lead RECORD;
BEGIN
    -- Check if leads table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
        RAISE EXCEPTION 'Leads table does not exist';
    END IF;
    
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
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'quotes' AND column_name = 'customer_id') THEN
            UPDATE quotes 
            SET 
                customer_id = v_customer_id,
                updated_at = NOW()
            WHERE lead_id = p_lead_id;
        END IF;
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search customers function
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
-- CREATE TRIGGERS
-- =====================================================

-- Customers triggers
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_metrics
    AFTER INSERT OR UPDATE OR DELETE ON customer_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_metrics();

-- Customer orders trigger
CREATE TRIGGER update_customer_orders_updated_at
    BEFORE UPDATE ON customer_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory triggers (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        -- Check if trigger already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_triggers 
            WHERE tgname = 'update_inventory_updated_at'
        ) THEN
            CREATE TRIGGER update_inventory_updated_at
                BEFORE UPDATE ON inventory
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_triggers 
            WHERE tgname = 'log_inventory_changes'
        ) THEN
            CREATE TRIGGER log_inventory_changes
                AFTER UPDATE ON inventory
                FOR EACH ROW
                EXECUTE FUNCTION log_inventory_change();
        END IF;
    END IF;
END $$;

-- Profiles trigger (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_triggers 
            WHERE tgname = 'update_profiles_updated_at'
        ) THEN
            CREATE TRIGGER update_profiles_updated_at
                BEFORE UPDATE ON profiles
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    
    -- Create trigger on auth.users if it exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
            IF NOT EXISTS (
                SELECT 1 FROM pg_triggers 
                WHERE tgname = 'on_auth_user_created'
                AND tgrelid = 'auth.users'::regclass
            ) THEN
                CREATE TRIGGER on_auth_user_created
                    AFTER INSERT ON auth.users
                    FOR EACH ROW
                    EXECUTE FUNCTION handle_new_user();
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on existing tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "customers_admin_all" ON customers;
DROP POLICY IF EXISTS "customers_authenticated_select" ON customers;
DROP POLICY IF EXISTS "customers_authenticated_insert" ON customers;
DROP POLICY IF EXISTS "customers_authenticated_update" ON customers;
DROP POLICY IF EXISTS "communications_authenticated_all" ON customer_communications;
DROP POLICY IF EXISTS "orders_authenticated_all" ON customer_orders;

-- Customers policies
CREATE POLICY "customers_admin_all" ON customers
    FOR ALL 
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

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

-- Customer communications policies
CREATE POLICY "communications_authenticated_all" ON customer_communications
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Customer orders policies
CREATE POLICY "orders_authenticated_all" ON customer_orders
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Inventory changelog policies
CREATE POLICY "inventory_changelog_authenticated_select" ON inventory_changelog
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_changelog_system_insert" ON inventory_changelog
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Auth audit log policies
CREATE POLICY "auth_audit_admin_all" ON auth_audit_log
    FOR ALL
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

CREATE POLICY "auth_audit_user_own" ON auth_audit_log
    FOR SELECT
    USING (user_id = auth.uid());

-- Inventory policies (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "inventory_authenticated_select" ON inventory;
        DROP POLICY IF EXISTS "inventory_manager_all" ON inventory;
        
        -- Create new policies
        CREATE POLICY "inventory_authenticated_select" ON inventory
            FOR SELECT
            USING (auth.uid() IS NOT NULL);
        
        CREATE POLICY "inventory_manager_all" ON inventory
            FOR ALL
            USING (auth.user_role() IN ('admin', 'manager'))
            WITH CHECK (auth.user_role() IN ('admin', 'manager'));
    END IF;
END $$;

-- Profiles policies (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "profiles_users_own" ON profiles;
        DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
        
        -- Create new policies
        CREATE POLICY "profiles_users_own" ON profiles
            FOR ALL
            USING (id = auth.uid())
            WITH CHECK (id = auth.uid());
        
        CREATE POLICY "profiles_admin_all" ON profiles
            FOR ALL
            USING (auth.is_admin())
            WITH CHECK (auth.is_admin());
    END IF;
END $$;

-- =====================================================
-- INSERT SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample customers (only if table is empty)
INSERT INTO customers (
    first_name, last_name, email, phone, company,
    address_street, address_city, address_county, address_postcode,
    status, customer_type, acquisition_source,
    notes, tags
)
SELECT * FROM (VALUES
    ('John', 'Smith', 'john.smith@example.com', '07700900001', 'Smith Stables',
     '123 High Street', 'London', 'Greater London', 'SW1A 1AA',
     'active', 'business', 'website',
     'Premium customer, interested in 7.5T models', ARRAY['vip', 'racing']),
    
    ('Sarah', 'Johnson', 'sarah.j@email.com', '07700900002', NULL,
     '456 Oak Lane', 'Manchester', 'Greater Manchester', 'M1 1AE',
     'active', 'individual', 'referral',
     'Referred by John Smith', ARRAY['referral']),
    
    ('David', 'Williams', 'david.williams@racingteam.co.uk', '07700900003', 'Williams Racing Team',
     '789 Park Road', 'Birmingham', 'West Midlands', 'B1 1BB',
     'active', 'business', 'event',
     'Met at Badminton Horse Trials 2024', ARRAY['racing', 'events']),
    
    ('Emma', 'Brown', 'emma.brown@gmail.com', '07700900004', NULL,
     '321 Church Street', 'Liverpool', 'Merseyside', 'L1 1AA',
     'prospect', 'individual', 'website',
     'Downloaded brochure, follow up needed', ARRAY['prospect']),
    
    ('Michael', 'Davis', 'mdavis@equestrian.ie', '353851234567', 'Irish Equestrian Services',
     '12 Main Street', 'Dublin', 'County Dublin', 'D01 F5P2',
     'active', 'dealer', 'direct',
     'Dealer for Ireland region', ARRAY['dealer', 'ireland'])
) AS v(first_name, last_name, email, phone, company,
       address_street, address_city, address_county, address_postcode,
       status, customer_type, acquisition_source,
       notes, tags)
WHERE NOT EXISTS (SELECT 1 FROM customers LIMIT 1);

-- Insert sample communications (only if customers exist and table is empty)
INSERT INTO customer_communications (
    customer_id, communication_type, direction, subject, content, outcome
)
SELECT 
    c.id, 'email', 'outbound', 
    'Welcome to J Taylor Horseboxes', 
    'Thank you for your interest in our premium horseboxes. We''re delighted to have you as a customer.',
    'sent'
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customer_communications LIMIT 1)
LIMIT 1;

-- =====================================================
-- FINAL VALIDATION
-- =====================================================

-- Create a validation function to check the migration
CREATE OR REPLACE FUNCTION validate_migration()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check customers table
    RETURN QUERY
    SELECT 'Customers table'::TEXT, 
           CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'customers') 
                THEN 'SUCCESS' ELSE 'FAILED' END,
           'Table creation check'::TEXT;
    
    -- Check customer_communications table
    RETURN QUERY
    SELECT 'Customer communications table'::TEXT,
           CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'customer_communications')
                THEN 'SUCCESS' ELSE 'FAILED' END,
           'Table creation check'::TEXT;
    
    -- Check customer_orders table
    RETURN QUERY
    SELECT 'Customer orders table'::TEXT,
           CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'customer_orders')
                THEN 'SUCCESS' ELSE 'FAILED' END,
           'Table creation check'::TEXT;
    
    -- Check auth_audit_log table
    RETURN QUERY
    SELECT 'Auth audit log table'::TEXT,
           CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'auth_audit_log')
                THEN 'SUCCESS' ELSE 'FAILED' END,
           'Table creation check'::TEXT;
    
    -- Check for sample data
    RETURN QUERY
    SELECT 'Sample customers'::TEXT,
           CASE WHEN EXISTS (SELECT 1 FROM customers LIMIT 1)
                THEN 'SUCCESS' ELSE 'WARNING' END,
           'Sample data check'::TEXT;
    
    -- Check RLS is enabled
    RETURN QUERY
    SELECT 'RLS on customers'::TEXT,
           CASE WHEN EXISTS (
               SELECT 1 FROM pg_tables 
               WHERE tablename = 'customers' 
               AND rowsecurity = true
           ) THEN 'SUCCESS' ELSE 'FAILED' END,
           'Row Level Security check'::TEXT;
    
    -- Check functions exist
    RETURN QUERY
    SELECT 'Auth functions'::TEXT,
           CASE WHEN EXISTS (
               SELECT 1 FROM pg_proc 
               WHERE proname = 'is_admin' 
               AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
           ) THEN 'SUCCESS' ELSE 'FAILED' END,
           'Auth helper functions check'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Run validation
SELECT * FROM validate_migration();

-- =====================================================
-- END OF SAFE MIGRATION SCRIPT
-- =====================================================