-- Migration 015: Clean up model-specific option names
-- Remove "(Professional 35)", "(Principal 35)", etc. from option names
-- Consolidate duplicate options with multi-model support

-- Step 1: Create a temporary table to identify unique base options
CREATE TEMP TABLE option_consolidation AS
WITH base_options AS (
  SELECT
    id,
    created_at,
    -- Remove model suffix patterns like (Professional 35), (Principal 35), etc.
    REGEXP_REPLACE(name, '\s*\([^)]*35\)$', '', 'i') as base_name,
    category,
    subcategory,
    description,
    sku,
    price,
    price_per_foot,
    weight_kg,
    living_area_units,
    per_foot_pricing,
    vat_rate,
    is_default,
    is_available,
    dependencies,
    incompatible_with,
    display_order,
    image_url,
    applicable_models
  FROM pricing_options
),
grouped_options AS (
  SELECT
    base_name,
    category,
    subcategory,
    description,
    sku,
    price,
    price_per_foot,
    weight_kg,
    living_area_units,
    per_foot_pricing,
    vat_rate,
    is_default,
    is_available,
    dependencies,
    incompatible_with,
    display_order,
    image_url,
    -- Collect all unique models from all versions of this option
    ARRAY_AGG(DISTINCT elem ORDER BY elem) as consolidated_models,
    -- Keep the oldest record (first created)
    (ARRAY_AGG(id ORDER BY created_at ASC))[1] as keep_id,
    -- Get all IDs for this group
    ARRAY_AGG(id ORDER BY created_at ASC) as all_ids
  FROM base_options,
  LATERAL UNNEST(applicable_models) as elem
  GROUP BY
    base_name,
    category,
    subcategory,
    description,
    sku,
    price,
    price_per_foot,
    weight_kg,
    living_area_units,
    per_foot_pricing,
    vat_rate,
    is_default,
    is_available,
    dependencies,
    incompatible_with,
    display_order,
    image_url
)
SELECT
  *,
  -- Create array of IDs to delete (all except the one we're keeping)
  ARRAY(SELECT id FROM UNNEST(all_ids) as id WHERE id != keep_id) as delete_ids
FROM grouped_options;

-- Step 2: Update the kept options with cleaned names and consolidated models
UPDATE pricing_options p
SET
  name = c.base_name,
  applicable_models =
    CASE
      -- If it's a cross-model option, set to all models
      WHEN array_length(c.consolidated_models, 1) > 1 THEN ARRAY['3.5t', '4.5t', '7.2t', '7.5t']
      -- Otherwise keep the single model
      ELSE c.consolidated_models
    END
FROM option_consolidation c
WHERE p.id = c.keep_id;

-- Step 3: Delete duplicate options
DELETE FROM pricing_options
WHERE id IN (
  SELECT UNNEST(delete_ids)
  FROM option_consolidation
  WHERE delete_ids IS NOT NULL
);

-- Step 4: Clean up any remaining bracketed model names that might have slipped through
UPDATE pricing_options
SET name = REGEXP_REPLACE(name, '\s*\([^)]*\d+[tT]?\)$', '', 'i')
WHERE name ~ '\([^)]*\d+[tT]?\)$';

-- Drop the temp table
DROP TABLE option_consolidation;

-- Verify results
SELECT
  COUNT(*) as total_options,
  COUNT(DISTINCT name) as unique_names,
  COUNT(*) FILTER (WHERE array_length(applicable_models, 1) > 1) as multi_model_options
FROM pricing_options;
