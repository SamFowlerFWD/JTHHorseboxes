-- Migration 017: Update all optional extras to apply to all JTH models (excluding AEOS)
-- This ensures optional extras are available across JTH 3.5T, 4.5T, Zenos 7.2T, and Helios 7.5T

-- Update all non-base category options to apply to all JTH models
UPDATE pricing_options
SET applicable_models = ARRAY[
  'professional-35',
  'principal-35',
  'progeny-35',
  'professional-45',
  'principal-45',
  'progeny-45',
  'zenos-discovery-72',
  'helios-75'
]
WHERE category != 'base';

-- Verify the update
DO $$
DECLARE
  updated_count INT;
  jth_model_count INT;
BEGIN
  -- Count options updated
  SELECT COUNT(*) INTO updated_count
  FROM pricing_options
  WHERE category != 'base';

  -- Count options with correct JTH models (8 models)
  SELECT COUNT(*) INTO jth_model_count
  FROM pricing_options
  WHERE category != 'base'
    AND array_length(applicable_models, 1) = 8;

  RAISE NOTICE '✅ Migration 017 complete!';
  RAISE NOTICE 'Total optional extras: %', updated_count;
  RAISE NOTICE 'Optional extras with all JTH models: %', jth_model_count;
END $$;
