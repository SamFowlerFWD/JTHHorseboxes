-- Additional tables for Operations functionality
-- Run this after the main setup.sql

-- Extend leads table with additional fields for pipeline
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'inquiry',
ADD COLUMN IF NOT EXISTS model_interest VARCHAR(100),
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS next_action TEXT,
ADD COLUMN IF NOT EXISTS next_action_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Production Jobs Table
CREATE TABLE IF NOT EXISTS production_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_id UUID,
    model VARCHAR(100) NOT NULL,
    chassis_number VARCHAR(100),
    registration VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled',
    current_stage VARCHAR(50),
    priority INTEGER DEFAULT 999,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    completed_stages TEXT[] DEFAULT '{}',
    stage_progress JSONB DEFAULT '{}',
    assigned_team TEXT[] DEFAULT '{}',
    issues JSONB DEFAULT '[]',
    photos JSONB DEFAULT '[]',
    notes TEXT
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    lead_id UUID REFERENCES leads(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    model VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    options_price DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    finance_option VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    production_job_id UUID REFERENCES production_jobs(id),
    notes TEXT
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_production_jobs_status ON production_jobs(status);
CREATE INDEX IF NOT EXISTS idx_production_jobs_priority ON production_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_production_jobs_target_date ON production_jobs(target_date);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_lead_id ON orders(lead_id);

-- Enable RLS for new tables
ALTER TABLE production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for production_jobs
CREATE POLICY "Admins can manage production jobs" ON production_jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow authenticated users to view production jobs
CREATE POLICY "Authenticated users can view production jobs" ON production_jobs
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for orders
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            customer_email IN (
                SELECT email FROM auth.users WHERE id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_production_jobs_updated_at BEFORE UPDATE ON production_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO production_jobs (
    job_number, 
    order_number, 
    customer_name, 
    model, 
    status, 
    current_stage,
    priority,
    start_date, 
    target_date,
    stage_progress,
    completed_stages,
    assigned_team
) VALUES 
(
    'JOB-2025-0001',
    'ORD-2025-0001',
    'Test Customer 1',
    'Professional 4.5t',
    'in_progress',
    'painting',
    1,
    '2025-07-01',
    '2025-08-25',
    '{
        "chassis_prep": {"status": "completed", "completion": 100, "hours": 18},
        "floor_walls": {"status": "completed", "completion": 100, "hours": 22},
        "electrical": {"status": "completed", "completion": 100, "hours": 15},
        "plumbing": {"status": "completed", "completion": 100, "hours": 14},
        "interior": {"status": "completed", "completion": 100, "hours": 35},
        "painting": {"status": "in_progress", "completion": 65, "hours": 13},
        "testing": {"status": "pending", "completion": 0, "hours": 0},
        "final": {"status": "pending", "completion": 0, "hours": 0}
    }'::jsonb,
    '{"chassis_prep", "floor_walls", "electrical", "plumbing", "interior"}',
    '{"Steven Warner", "Workshop Team"}'
),
(
    'JOB-2025-0002',
    'ORD-2025-0002',
    'Test Customer 2',
    'Aeos 4.5t',
    'scheduled',
    null,
    2,
    '2025-09-01',
    '2025-11-15',
    '{
        "chassis_prep": {"status": "pending", "completion": 0, "hours": 0},
        "floor_walls": {"status": "pending", "completion": 0, "hours": 0},
        "electrical": {"status": "pending", "completion": 0, "hours": 0},
        "plumbing": {"status": "pending", "completion": 0, "hours": 0},
        "interior": {"status": "pending", "completion": 0, "hours": 0},
        "painting": {"status": "pending", "completion": 0, "hours": 0},
        "testing": {"status": "pending", "completion": 0, "hours": 0},
        "final": {"status": "pending", "completion": 0, "hours": 0}
    }'::jsonb,
    '{}',
    '{}'
);

-- Insert sample leads for testing
INSERT INTO leads (
    first_name,
    last_name,
    email,
    phone,
    company,
    stage,
    model_interest,
    quote_amount,
    assigned_to,
    lead_score,
    tags
) VALUES 
(
    'John',
    'Smith',
    'john@example.com',
    '+44 7700 900123',
    'Smith Equestrian',
    'inquiry',
    'Professional 3.5t',
    45000,
    'Sales Team',
    65,
    '{"website", "urgent"}'
),
(
    'Sarah',
    'Johnson',
    'sarah@example.com',
    '+44 7700 900456',
    'Green Valley Stables',
    'qualification',
    'Aeos 4.5t',
    62000,
    'Steven Warner',
    75,
    '{"referral", "finance"}'
),
(
    'Emma',
    'Brown',
    'emma@example.com',
    '+44 7700 900789',
    'Highland Riders',
    'specification',
    'Progeny 3.5t',
    48000,
    'Sales Team',
    85,
    '{"custom", "premium"}'
);

COMMIT;