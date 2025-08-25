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