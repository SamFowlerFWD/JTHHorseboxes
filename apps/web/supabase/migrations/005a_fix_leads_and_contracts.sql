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