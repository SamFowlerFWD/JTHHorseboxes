-- Migration 014: Multi-Model Support for Pricing Options
-- Allows pricing options to be applicable to multiple models
-- For example, "Reversing Sensors" can apply to 3.5t, 4.5t, 7.2t, etc.

-- Add applicable_models column as text array
ALTER TABLE pricing_options
ADD COLUMN IF NOT EXISTS applicable_models TEXT[] DEFAULT ARRAY['3.5t'];

-- Migrate existing model data to applicable_models array
UPDATE pricing_options
SET applicable_models = ARRAY[model]
WHERE model IS NOT NULL AND applicable_models IS NULL;

-- For any rows where model is null, set to default
UPDATE pricing_options
SET applicable_models = ARRAY['3.5t']
WHERE model IS NULL;

-- Drop the old model column (after data migration)
ALTER TABLE pricing_options
DROP COLUMN IF EXISTS model;

-- Add comment
COMMENT ON COLUMN pricing_options.applicable_models IS 'Array of model codes this option applies to (e.g., {3.5t, 4.5t, 7.2t})';

-- Add 4.5t model specifications
INSERT INTO model_specifications (
  model_code,
  model_name,
  tonnage,
  gross_vehicle_weight_kg,
  unladen_weight_kg,
  target_payload_kg,
  warning_threshold_kg,
  standard_living_units,
  units_per_foot_extension,
  suggested_upgrade_model,
  is_active
) VALUES
  -- 4.5T Model
  (
    '4.5t',
    'Professional 45',
    '4.5T',
    4500,
    3500,
    1000,
    800,
    6,
    2,
    '7.2t',
    true
  )
ON CONFLICT (model_code) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  tonnage = EXCLUDED.tonnage,
  gross_vehicle_weight_kg = EXCLUDED.gross_vehicle_weight_kg,
  unladen_weight_kg = EXCLUDED.unladen_weight_kg,
  target_payload_kg = EXCLUDED.target_payload_kg,
  warning_threshold_kg = EXCLUDED.warning_threshold_kg,
  standard_living_units = EXCLUDED.standard_living_units,
  units_per_foot_extension = EXCLUDED.units_per_foot_extension,
  suggested_upgrade_model = EXCLUDED.suggested_upgrade_model,
  is_active = EXCLUDED.is_active;

-- Create index on applicable_models for faster queries
CREATE INDEX IF NOT EXISTS idx_pricing_options_applicable_models
ON pricing_options USING GIN (applicable_models);

-- Create helper function to check if option applies to a specific model
CREATE OR REPLACE FUNCTION option_applies_to_model(
  option_models TEXT[],
  target_model TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN target_model = ANY(option_models);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION option_applies_to_model IS 'Check if a pricing option applies to a specific model';
