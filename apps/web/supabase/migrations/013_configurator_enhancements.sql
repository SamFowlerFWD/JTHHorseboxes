-- Migration: Configurator Enhancements
-- Adds: Weight tracking, Living area calculations, Price history, Scheduled pricing
-- Created: 2025-11-14

-- =============================================================================
-- 1. ADD WEIGHT AND LIVING AREA COLUMNS TO PRICING_OPTIONS
-- =============================================================================

ALTER TABLE pricing_options
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS living_area_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS per_foot_pricing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_per_foot DECIMAL(10, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN pricing_options.weight_kg IS 'Weight in kilograms. 0 means no weight impact. Example: Fridge = 30kg';
COMMENT ON COLUMN pricing_options.living_area_units IS 'Living area units required (each unit = 6 inches). Standard = 6 units (3ft), max without extension = 6 units';
COMMENT ON COLUMN pricing_options.per_foot_pricing IS 'True if priced per foot (e.g., chassis extension). Use price_per_foot instead of price';
COMMENT ON COLUMN pricing_options.price_per_foot IS 'Price per foot when per_foot_pricing is true';

-- =============================================================================
-- 2. MODEL SPECIFICATIONS TABLE (Weight limits and base specs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_specifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Model Identification
    model_code VARCHAR(50) NOT NULL UNIQUE, -- 'professional-35', 'aeos-qv-45', etc.
    model_name VARCHAR(255) NOT NULL,
    tonnage VARCHAR(10) NOT NULL, -- '3.5T', '4.5T', '7.2T', '7.5T'

    -- Weight Specifications
    gross_vehicle_weight_kg DECIMAL(10, 2) NOT NULL,
    unladen_weight_kg DECIMAL(10, 2) NOT NULL,
    target_payload_kg DECIMAL(10, 2) NOT NULL,
    warning_threshold_kg DECIMAL(10, 2) NOT NULL,

    -- Living Area Specifications
    standard_living_units INTEGER DEFAULT 6,
    units_per_foot_extension INTEGER DEFAULT 2,

    -- Suggested Upgrade (if payload exceeded)
    suggested_upgrade_model VARCHAR(50),

    -- Status
    is_active BOOLEAN DEFAULT true
);

-- Add trigger for updated_at
CREATE TRIGGER update_model_specifications_updated_at
BEFORE UPDATE ON model_specifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index
CREATE INDEX idx_model_specifications_code ON model_specifications(model_code);
CREATE INDEX idx_model_specifications_tonnage ON model_specifications(tonnage);

-- =============================================================================
-- 3. PRICE HISTORY TABLE (Audit trail for price changes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS pricing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- What changed
    option_id UUID REFERENCES pricing_options(id) ON DELETE CASCADE,

    -- Price change details
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2),
    old_price_per_foot DECIMAL(10, 2),
    new_price_per_foot DECIMAL(10, 2),

    -- Weight change details
    old_weight_kg DECIMAL(8, 2),
    new_weight_kg DECIMAL(8, 2),

    -- Living area change details
    old_living_area_units INTEGER,
    new_living_area_units INTEGER,

    -- Availability change
    old_is_available BOOLEAN,
    new_is_available BOOLEAN,

    -- Audit info
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    change_metadata JSONB
);

-- Index for querying history
CREATE INDEX idx_pricing_history_option ON pricing_history(option_id, created_at DESC);
CREATE INDEX idx_pricing_history_changed_by ON pricing_history(changed_by);
CREATE INDEX idx_pricing_history_created_at ON pricing_history(created_at DESC);

-- =============================================================================
-- 4. SCHEDULED PRICE CHANGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS scheduled_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Target option
    option_id UUID REFERENCES pricing_options(id) ON DELETE CASCADE,

    -- Scheduled changes
    effective_date TIMESTAMPTZ NOT NULL,
    new_price DECIMAL(10, 2),
    new_price_per_foot DECIMAL(10, 2),
    new_weight_kg DECIMAL(8, 2),
    new_living_area_units INTEGER,
    new_is_available BOOLEAN,

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'applied', 'cancelled'
    applied_at TIMESTAMPTZ,

    -- Audit
    scheduled_by UUID REFERENCES auth.users(id),
    notes TEXT,

    CONSTRAINT check_effective_date_future
        CHECK (effective_date > created_at)
);

-- Add trigger
CREATE TRIGGER update_scheduled_pricing_updated_at
BEFORE UPDATE ON scheduled_pricing
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_scheduled_pricing_option ON scheduled_pricing(option_id);
CREATE INDEX idx_scheduled_pricing_effective_date ON scheduled_pricing(effective_date);
CREATE INDEX idx_scheduled_pricing_status ON scheduled_pricing(status);

-- =============================================================================
-- 5. CONFIGURATION CALCULATIONS TABLE (Store calculation results)
-- =============================================================================

CREATE TABLE IF NOT EXISTS configuration_calculations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Reference to configuration (nullable - can exist without being linked)
    configuration_id UUID,
    lead_id UUID,

    -- Weight calculations
    base_vehicle_weight_kg DECIMAL(10, 2) NOT NULL,
    options_total_weight_kg DECIMAL(10, 2) NOT NULL,
    total_weight_kg DECIMAL(10, 2) NOT NULL,
    remaining_payload_kg DECIMAL(10, 2) NOT NULL,
    payload_percentage_used DECIMAL(5, 2),
    weight_warning_triggered BOOLEAN DEFAULT false,
    suggested_upgrade_model VARCHAR(50),

    -- Living area calculations
    living_area_units_used INTEGER NOT NULL,
    standard_units_available INTEGER NOT NULL,
    extension_feet_required INTEGER NOT NULL,
    extension_units_provided INTEGER NOT NULL,
    total_units_available INTEGER NOT NULL,
    units_remaining INTEGER NOT NULL,

    -- Pricing breakdown
    chassis_extension_cost DECIMAL(10, 2) DEFAULT 0,
    options_total DECIMAL(10, 2) NOT NULL,
    total_ex_vat DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2) NOT NULL,
    total_inc_vat DECIMAL(10, 2) NOT NULL,

    -- Calculation metadata
    calculation_version VARCHAR(20) DEFAULT '1.0',
    calculation_warnings JSONB,
    calculation_notes TEXT
);

-- Indexes
CREATE INDEX idx_config_calculations_config ON configuration_calculations(configuration_id);
CREATE INDEX idx_config_calculations_lead ON configuration_calculations(lead_id);
CREATE INDEX idx_config_calculations_created ON configuration_calculations(created_at DESC);

-- =============================================================================
-- 6. RLS POLICIES FOR NEW TABLES
-- =============================================================================

-- Model Specifications
ALTER TABLE model_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read model specs" ON model_specifications
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage model specs" ON model_specifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Pricing History
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read pricing history" ON pricing_history
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert pricing history" ON pricing_history
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Scheduled Pricing
ALTER TABLE scheduled_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled pricing" ON scheduled_pricing
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Configuration Calculations
ALTER TABLE configuration_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read calculations" ON configuration_calculations
    FOR SELECT USING (true);  -- Public read access for calculations

CREATE POLICY "Admins can manage calculations" ON configuration_calculations
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert calculations" ON configuration_calculations
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- 7. FUNCTION: TRIGGER TO LOG PRICE CHANGES
-- =============================================================================

CREATE OR REPLACE FUNCTION log_pricing_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if price, weight, or availability changed
    IF (OLD.price != NEW.price
        OR OLD.price_per_foot != NEW.price_per_foot
        OR OLD.weight_kg != NEW.weight_kg
        OR OLD.living_area_units != NEW.living_area_units
        OR OLD.is_available != NEW.is_available) THEN

        INSERT INTO pricing_history (
            option_id,
            old_price,
            new_price,
            old_price_per_foot,
            new_price_per_foot,
            old_weight_kg,
            new_weight_kg,
            old_living_area_units,
            new_living_area_units,
            old_is_available,
            new_is_available,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.price,
            NEW.price,
            OLD.price_per_foot,
            NEW.price_per_foot,
            OLD.weight_kg,
            NEW.weight_kg,
            OLD.living_area_units,
            NEW.living_area_units,
            OLD.is_available,
            NEW.is_available,
            auth.uid()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER pricing_options_change_log
AFTER UPDATE ON pricing_options
FOR EACH ROW
EXECUTE FUNCTION log_pricing_change();

-- =============================================================================
-- 8. FUNCTION: APPLY SCHEDULED PRICE CHANGES
-- =============================================================================

CREATE OR REPLACE FUNCTION apply_scheduled_price_changes()
RETURNS INTEGER AS $$
DECLARE
    changes_applied INTEGER := 0;
    scheduled_change RECORD;
BEGIN
    -- Find all pending changes that should be applied
    FOR scheduled_change IN
        SELECT * FROM scheduled_pricing
        WHERE status = 'pending'
        AND effective_date <= NOW()
        ORDER BY effective_date ASC
    LOOP
        -- Update the pricing option
        UPDATE pricing_options
        SET
            price = COALESCE(scheduled_change.new_price, price),
            price_per_foot = COALESCE(scheduled_change.new_price_per_foot, price_per_foot),
            weight_kg = COALESCE(scheduled_change.new_weight_kg, weight_kg),
            living_area_units = COALESCE(scheduled_change.new_living_area_units, living_area_units),
            is_available = COALESCE(scheduled_change.new_is_available, is_available)
        WHERE id = scheduled_change.option_id;

        -- Mark the scheduled change as applied
        UPDATE scheduled_pricing
        SET
            status = 'applied',
            applied_at = NOW()
        WHERE id = scheduled_change.id;

        changes_applied := changes_applied + 1;
    END LOOP;

    RETURN changes_applied;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. SEED DATA: MODEL SPECIFICATIONS
-- =============================================================================

INSERT INTO model_specifications (
    model_code,
    model_name,
    tonnage,
    gross_vehicle_weight_kg,
    unladen_weight_kg,
    target_payload_kg,
    warning_threshold_kg,
    suggested_upgrade_model
) VALUES
    -- 3.5 Tonne models
    ('professional-35', 'JTH Professional 3.5T', '3.5T', 3500, 2500, 1000, 800, 'aeos-qv-45'),
    ('principle-35', 'JTH Principle 3.5T', '3.5T', 3500, 2450, 1050, 850, 'aeos-qv-45'),
    ('progeny-35', 'JTH Progeny 3.5T', '3.5T', 3500, 2400, 1100, 900, 'aeos-qv-45'),

    -- 4.5 Tonne models
    ('aeos-qv-45', 'AEOS QV 4.5T', '4.5T', 4500, 3200, 1300, 1000, 'zenos-72'),
    ('aeos-edge-45', 'AEOS Edge 4.5T', '4.5T', 4500, 3150, 1350, 1050, 'zenos-72'),

    -- 7.2 Tonne models
    ('aeos-discovery-72', 'AEOS Discovery 7.2T', '7.2T', 7200, 5000, 2200, 1800, NULL),
    ('zenos-72', 'ZENOS 7.2T', '7.2T', 7200, 4800, 2400, 2000, NULL),

    -- 7.5 Tonne models
    ('helios-75', 'HELIOS 7.5T', '7.5T', 7500, 5200, 2300, 1900, NULL)
ON CONFLICT (model_code) DO NOTHING;

-- =============================================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE model_specifications IS
    'Vehicle model specifications including weight limits and living area defaults';

COMMENT ON TABLE pricing_history IS
    'Audit trail of all price, weight, and availability changes';

COMMENT ON TABLE scheduled_pricing IS
    'Future price changes scheduled to take effect at specific dates';

COMMENT ON TABLE configuration_calculations IS
    'Cached calculation results for configurations (weight, living area, pricing)';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
