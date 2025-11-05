-- =====================================================
-- Migration: Enhance inventory table for operations platform
-- Purpose: Add missing fields and adjust structure to match frontend requirements
-- =====================================================

-- Add missing columns to inventory table
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS part_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock DECIMAL(10,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Migrate existing data to new column names
UPDATE inventory 
SET 
  part_number = COALESCE(part_number, part_code),
  name = COALESCE(name, description),
  current_stock = COALESCE(current_stock, quantity_on_hand),
  min_stock = COALESCE(min_stock, 5), -- Default min stock
  max_stock = COALESCE(max_stock, 100), -- Default max stock
  last_restocked = COALESCE(last_restocked, created_at);

-- Create computed status column based on stock levels
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock = 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.min_stock THEN
    NEW.status = 'critical';
  ELSIF NEW.current_stock <= NEW.reorder_point THEN
    NEW.status = 'reorder';
  ELSIF NEW.current_stock >= NEW.max_stock THEN
    NEW.status = 'overstocked';
  ELSE
    NEW.status = 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update status automatically
DROP TRIGGER IF EXISTS update_inventory_status_trigger ON inventory;
CREATE TRIGGER update_inventory_status_trigger
  BEFORE INSERT OR UPDATE OF current_stock, min_stock, max_stock, reorder_point
  ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Update all existing records to set status
UPDATE inventory SET status = 
  CASE 
    WHEN current_stock = 0 THEN 'out_of_stock'
    WHEN current_stock <= min_stock THEN 'critical'
    WHEN current_stock <= reorder_point THEN 'reorder'
    WHEN current_stock >= max_stock THEN 'overstocked'
    ELSE 'in_stock'
  END
WHERE status IS NULL;

-- Create inventory movements table for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'return'
  quantity DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50), -- 'purchase_order', 'build', 'adjustment', 'return'
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle stock adjustments
CREATE OR REPLACE FUNCTION adjust_inventory_stock(
  p_inventory_id UUID,
  p_adjustment DECIMAL,
  p_reason TEXT,
  p_user_id UUID
) RETURNS void AS $$
DECLARE
  v_current_stock DECIMAL;
  v_movement_type VARCHAR(50);
BEGIN
  -- Get current stock
  SELECT current_stock INTO v_current_stock
  FROM inventory
  WHERE id = p_inventory_id
  FOR UPDATE;
  
  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  -- Determine movement type
  IF p_adjustment > 0 THEN
    v_movement_type := 'in';
  ELSIF p_adjustment < 0 THEN
    v_movement_type := 'out';
  ELSE
    v_movement_type := 'adjustment';
  END IF;
  
  -- Update stock level
  UPDATE inventory
  SET 
    current_stock = current_stock + p_adjustment,
    quantity_on_hand = quantity_on_hand + p_adjustment,
    last_restocked = CASE WHEN p_adjustment > 0 THEN NOW() ELSE last_restocked END,
    updated_at = NOW()
  WHERE id = p_inventory_id;
  
  -- Record the movement
  INSERT INTO inventory_movements (
    inventory_id,
    movement_type,
    quantity,
    reference_type,
    reason,
    performed_by
  ) VALUES (
    p_inventory_id,
    v_movement_type,
    p_adjustment,
    'adjustment',
    p_reason,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample inventory data if table is empty
INSERT INTO inventory (
  part_number,
  part_code,
  name,
  description,
  category,
  unit,
  current_stock,
  quantity_on_hand,
  min_stock,
  max_stock,
  reorder_point,
  location,
  unit_cost,
  last_restocked
) 
SELECT * FROM (VALUES
  ('CHK-001', 'CHK-001', 'Chassis Main Beam', '3.5t chassis main support beam', 'chassis', 'units', 12, 12, 5, 50, 10, 'Warehouse A - Rack 1', 450.00, NOW() - INTERVAL '20 days'),
  ('ELC-045', 'ELC-045', 'LED Tail Light Assembly', 'Complete LED tail light unit with indicators', 'electrical', 'units', 3, 3, 10, 40, 15, 'Warehouse B - Shelf 3', 125.50, NOW() - INTERVAL '35 days'),
  ('PLB-012', 'PLB-012', 'Water Tank 100L', '100 litre fresh water tank with fittings', 'plumbing', 'units', 8, 8, 5, 20, 7, 'Warehouse A - Bay 2', 185.00, NOW() - INTERVAL '10 days'),
  ('INT-089', 'INT-089', 'Tack Locker Door', 'Aluminum tack locker door with lock', 'interior', 'units', 0, 0, 5, 25, 8, 'Warehouse C - Section 2', 275.00, NOW() - INTERVAL '60 days'),
  ('HRD-234', 'HRD-234', 'M12 Bolt Set', 'M12 stainless steel bolt set (pack of 50)', 'hardware', 'packs', 45, 45, 20, 100, 30, 'Warehouse A - Drawer 5', 22.50, NOW() - INTERVAL '15 days'),
  ('EXT-067', 'EXT-067', 'Side Window Kit', 'Double glazed side window with frame', 'exterior', 'units', 6, 6, 8, 30, 12, 'Warehouse B - Rack 4', 320.00, NOW() - INTERVAL '22 days'),
  ('CHK-015', 'CHK-015', 'Axle Assembly 3.5t', 'Complete axle assembly for 3.5t model', 'chassis', 'units', 4, 4, 2, 10, 3, 'Warehouse A - Heavy Storage', 1250.00, NOW() - INTERVAL '40 days'),
  ('INT-102', 'INT-102', 'Rubber Matting', 'Heavy duty rubber floor matting (per m²)', 'interior', 'm²', 85, 85, 50, 200, 75, 'Warehouse C - Roll Storage', 45.00, NOW() - INTERVAL '12 days'),
  ('ELC-078', 'ELC-078', 'Control Panel Switch', 'Illuminated rocker switch for control panel', 'electrical', 'units', 12, 12, 20, 60, 25, 'Warehouse B - Bin 12', 8.50, NOW() - INTERVAL '28 days'),
  ('PLB-025', 'PLB-025', 'Waste Water Valve', 'Waste water outlet valve with seal', 'plumbing', 'units', 18, 18, 10, 40, 15, 'Warehouse A - Shelf 8', 32.00, NOW() - INTERVAL '17 days')
) AS v(part_number, part_code, name, description, category, unit, current_stock, quantity_on_hand, min_stock, max_stock, reorder_point, location, unit_cost, last_restocked)
WHERE NOT EXISTS (SELECT 1 FROM inventory LIMIT 1);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_part_number ON inventory(part_number);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- RLS policies for inventory movements
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory movements" ON inventory_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create inventory movements" ON inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Update RLS policies for inventory table
DROP POLICY IF EXISTS "Allow authenticated read" ON inventory;
CREATE POLICY "Authenticated users can view inventory" ON inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage inventory" ON inventory
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Grant permissions
GRANT ALL ON inventory_movements TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_inventory_stock TO authenticated;

-- Add helpful comments
COMMENT ON TABLE inventory IS 'Inventory management for parts and materials';
COMMENT ON TABLE inventory_movements IS 'Audit log of all inventory stock movements';
COMMENT ON FUNCTION adjust_inventory_stock IS 'Safely adjust inventory stock levels with audit logging';