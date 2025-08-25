-- Quick fix for missing columns and tables

-- Add pipeline fields to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'inquiry',
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS configurator_snapshot JSONB,
ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS contract_id UUID,
ADD COLUMN IF NOT EXISTS build_id UUID;

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES leads(id),
  document_url TEXT,
  signed_at TIMESTAMPTZ,
  total_contract_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create builds table
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_number VARCHAR(50) UNIQUE NOT NULL,
  deal_id UUID REFERENCES leads(id),
  model VARCHAR(100),
  configuration JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_start DATE,
  scheduled_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create build_stages table
CREATE TABLE IF NOT EXISTS build_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sequence INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

