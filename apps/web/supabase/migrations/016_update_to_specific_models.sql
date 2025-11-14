-- Migration 016: Update from weight-class codes to specific model variant codes
-- Maps old codes (3.5t, 4.5t, 7.2t, 7.5t) to new specific model codes
-- AEOS range is prebuilt with no optional extras, so excluded from optional extras

-- Step 1: Update 3.5t to JTH 3.5T models (Professional, Principal, Progeny)
UPDATE pricing_options
SET applicable_models = ARRAY['professional-35', 'principal-35', 'progeny-35']
WHERE applicable_models @> ARRAY['3.5t'];

-- Step 2: Update 4.5t to JTH 4.5T models (Professional, Principal, Progeny)
-- Excluding AEOS models since they're prebuilt with no optional extras
UPDATE pricing_options
SET applicable_models = ARRAY['professional-45', 'principal-45', 'progeny-45']
WHERE applicable_models @> ARRAY['4.5t'];

-- Step 3: Update 7.2t to Zenos Discovery 7.2T
UPDATE pricing_options
SET applicable_models = ARRAY['zenos-discovery-72']
WHERE applicable_models @> ARRAY['7.2t'];

-- Step 4: Update 7.5t to Helios 7.5T
UPDATE pricing_options
SET applicable_models = ARRAY['helios-75']
WHERE applicable_models @> ARRAY['7.5t'];

-- Step 5: Remove any old weight-class codes that may still exist
UPDATE pricing_options
SET applicable_models = array_remove(applicable_models, '3.5t')
WHERE '3.5t' = ANY(applicable_models);

UPDATE pricing_options
SET applicable_models = array_remove(applicable_models, '4.5t')
WHERE '4.5t' = ANY(applicable_models);

UPDATE pricing_options
SET applicable_models = array_remove(applicable_models, '7.2t')
WHERE '7.2t' = ANY(applicable_models);

UPDATE pricing_options
SET applicable_models = array_remove(applicable_models, '7.5t')
WHERE '7.5t' = ANY(applicable_models);

-- Step 6: Verify results
SELECT
  COUNT(*) as total_options,
  COUNT(DISTINCT name) as unique_names,
  COUNT(*) FILTER (WHERE array_length(applicable_models, 1) > 1) as multi_model_options,
  COUNT(*) FILTER (WHERE applicable_models && ARRAY['professional-35', 'principal-35', 'progeny-35']) as jth_35_options,
  COUNT(*) FILTER (WHERE applicable_models && ARRAY['professional-45', 'principal-45', 'progeny-45']) as jth_45_options,
  COUNT(*) FILTER (WHERE applicable_models && ARRAY['zenos-discovery-72']) as zenos_options,
  COUNT(*) FILTER (WHERE applicable_models && ARRAY['helios-75']) as helios_options,
  -- Verify no old codes remain
  COUNT(*) FILTER (WHERE applicable_models && ARRAY['3.5t', '4.5t', '7.2t', '7.5t']) as old_codes_remaining
FROM pricing_options;

-- Step 7: Show sample of updated options
SELECT
  name,
  category,
  applicable_models,
  price
FROM pricing_options
ORDER BY category, name
LIMIT 20;
