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