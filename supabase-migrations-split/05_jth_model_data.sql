-- ======================================================
-- JTH model specifications and pricing
-- File: 05_jth_model_data
-- Original: supabase/migrations/004_jth_model_data.sql
-- Generated: 2025-08-22T15:17:20.945Z
-- ======================================================

-- JTH Model Data and Sample Content
-- =====================================================
-- ACCURATE JTH MODEL INFORMATION
-- =====================================================

-- Clear existing model data for clean insert
DELETE FROM product_models WHERE model_code LIKE 'JTH-%';

-- Insert accurate JTH models with correct pricing and specifications
INSERT INTO product_models (
    model_code, name, category, series, 
    base_price, weight_kg,
    external_length_mm, external_width_mm, external_height_mm,
    internal_length_mm, internal_width_mm, internal_height_mm,
    horse_capacity, payload_kg,
    build_time_weeks_min, build_time_weeks_max,
    warranty_years, description, features, is_active
) VALUES 
    -- 3.5t Models
    ('JTH-PRIN-35', 'Principle 35', '3.5t', 'Principle',
     35000.00, 1200,
     5500, 2200, 2800,
     3600, 1800, 2000,
     2, 2300,
     8, 10,
     5, -- 5-year structural warranty
     'Entry-level 3.5t horsebox perfect for weekend riders and first-time buyers. Built with JTH quality and reliability.',
     '["LED lighting throughout", "Anti-slip rubber flooring", "Full height breast bar", "Padded divider", "External tack locker", "Grooms door", "2 horse capacity"]'::jsonb,
     true),
    
    ('JTH-PROF-35', 'Professional 35', '3.5t', 'Professional',
     45000.00, 1250,
     5500, 2200, 2800,
     3600, 1800, 2000,
     2, 2250,
     10, 12,
     5,
     'Mid-range 3.5t horsebox with enhanced comfort features and premium finishes. Popular with competition riders.',
     '["Luxury living area", "Hot water system", "Weekender package", "Solar panel ready", "Bluetooth sound system", "Reversing camera", "Air conditioning prep"]'::jsonb,
     true),
    
    ('JTH-PROG-35', 'Progeny 35', '3.5t', 'Progeny',
     55000.00, 1300,
     5500, 2200, 2800,
     3600, 1800, 2000,
     2, 2200,
     12, 14,
     5,
     'Premium 3.5t horsebox with Pioneer Package. Top-of-the-line features for discerning equestrians.',
     '["Pioneer Package included", "Full bathroom", "Luxury kitchen", "100Ah lithium battery", "1000W inverter", "Satellite TV prep", "Premium leather seating", "Underfloor heating"]'::jsonb,
     true),
    
    -- 4.5t Models
    ('JTH-AEOS-EDGE', 'Aeos Edge', '4.5t', 'Aeos',
     65000.00, 1800,
     6500, 2400, 3000,
     4200, 2000, 2100,
     2, 2700,
     12, 14,
     5,
     'Professional 4.5t horsebox with cutting-edge design and maximum payload capacity.',
     '["Increased payload", "Extended living area", "Professional kitchen", "Separate shower room", "200Ah battery bank", "Heavy duty suspension", "Commercial grade components"]'::jsonb,
     true),
    
    ('JTH-AEOS-FREE', 'Aeos Freedom', '4.5t', 'Aeos',
     70000.00, 1850,
     6500, 2400, 3000,
     4200, 2000, 2100,
     3, 2650,
     12, 14,
     5,
     'Family-oriented 4.5t horsebox with space for 3 horses. Perfect for family equestrian activities.',
     '["3 horse capacity", "Family seating area", "Bunk beds option", "Large wardrobe", "Washing machine prep", "Extra storage", "Child safety features"]'::jsonb,
     true),
    
    ('JTH-AEOS-DISC', 'Aeos Discovery', '4.5t', 'Aeos',
     80000.00, 1900,
     7000, 2400, 3000,
     4500, 2000, 2100,
     2, 2600,
     14, 16,
     5,
     'Luxury living 4.5t horsebox with extended accommodation. Your home away from home.',
     '["Extended luxury living", "Full residential kitchen", "Queen size bed", "Separate toilet and shower", "300Ah battery bank", "3000W inverter", "Satellite TV", "Air conditioning"]'::jsonb,
     true),
    
    -- 7.2t Model
    ('JTH-ZENOS-72', 'Zenos 72', '7.2t', 'Zenos',
     120000.00, 2500,
     8000, 2500, 3200,
     5000, 2200, 2300,
     4, 4700,
     16, 20,
     5,
     'Flagship 7.2t horsebox for professional teams and serious competitors. No compromise on quality or features.',
     '["4 horse capacity", "Luxury apartment living", "Full bathroom with shower", "Professional kitchen with oven", "500Ah battery bank", "5000W inverter", "Full air conditioning", "Hydraulic ramp", "CCTV system", "WiFi router included"]'::jsonb,
     true);

-- Insert product options/accessories with accurate pricing
DELETE FROM product_options WHERE code LIKE 'JTH-%';

INSERT INTO product_options (code, name, category, description, unit_price, lead_time_days, is_active)
VALUES 
    -- Pioneer Package Components
    ('JTH-PKG-PIONEER', 'Pioneer Package', 'Packages', 
     'Complete luxury package including premium finishes and advanced technology', 
     8500.00, 0, true),
    
    -- Power Systems
    ('JTH-PWR-LITH100', '100Ah Lithium Battery', 'Power Systems',
     'High-performance lithium battery for extended off-grid capability',
     850.00, 7, true),
    
    ('JTH-PWR-LITH200', '200Ah Lithium Battery Bank', 'Power Systems',
     'Dual lithium battery system for maximum power storage',
     1650.00, 7, true),
    
    ('JTH-PWR-SOL100', '100W Solar Panel', 'Power Systems',
     'Roof-mounted solar panel with MPPT controller',
     450.00, 7, true),
    
    ('JTH-PWR-INV1000', '1000W Pure Sine Inverter', 'Power Systems',
     'Clean power for sensitive electronics',
     650.00, 7, true),
    
    ('JTH-PWR-INV3000', '3000W Pure Sine Inverter', 'Power Systems',
     'Heavy-duty inverter for full off-grid living',
     1850.00, 7, true),
    
    -- Comfort Features
    ('JTH-COM-AC', 'Air Conditioning System', 'Comfort',
     'Roof-mounted AC unit with heating function',
     2850.00, 14, true),
    
    ('JTH-COM-HEAT', 'Diesel Heating System', 'Comfort',
     'Webasto diesel heater with programmable timer',
     1950.00, 14, true),
    
    ('JTH-COM-HW', 'Hot Water System', 'Comfort',
     'Gas/electric hot water system with 10L tank',
     850.00, 7, true),
    
    -- Horse Area Equipment
    ('JTH-HRS-CAM', 'Horse Area Camera System', 'Horse Area',
     'Wireless camera system for monitoring horses',
     650.00, 7, true),
    
    ('JTH-HRS-PADDED', 'Full Padding Package', 'Horse Area',
     'Premium padding for walls and dividers',
     1850.00, 7, true),
    
    ('JTH-HRS-HYDRO', 'Hydraulic Ramp', 'Horse Area',
     'Electric hydraulic ramp for easy loading',
     4500.00, 21, true),
    
    -- Technology
    ('JTH-TEC-WIFI', 'WiFi Router System', 'Technology',
     '4G WiFi router with external antenna',
     450.00, 7, true),
    
    ('JTH-TEC-SAT', 'Satellite TV System', 'Technology',
     'Auto-seeking satellite dish with receiver',
     1850.00, 14, true),
    
    ('JTH-TEC-REV', 'Reversing Camera & Monitor', 'Technology',
     'High-definition reversing camera with 7" monitor',
     450.00, 7, true);

-- Link popular options to models
INSERT INTO model_options (model_id, option_id, is_standard, is_popular)
SELECT 
    pm.id as model_id,
    po.id as option_id,
    false as is_standard,
    true as is_popular
FROM product_models pm
CROSS JOIN product_options po
WHERE 
    (pm.series = 'Progeny' AND po.code = 'JTH-PKG-PIONEER') OR
    (pm.category IN ('3.5t', '4.5t') AND po.code IN ('JTH-PWR-LITH100', 'JTH-COM-HW', 'JTH-TEC-REV')) OR
    (pm.category = '4.5t' AND po.code IN ('JTH-PWR-LITH200', 'JTH-COM-AC')) OR
    (pm.category = '7.2t' AND po.code IN ('JTH-HRS-HYDRO', 'JTH-TEC-WIFI', 'JTH-TEC-SAT'));

-- =====================================================
-- KNOWLEDGE BASE CONTENT
-- =====================================================

-- Insert knowledge base articles for each model
INSERT INTO kb_articles (
    category_id, title, slug, content, summary, 
    author_id, tags, meta_description, is_published, is_featured
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'models'),
    'JTH Principle 35 - Entry Level Excellence',
    'jth-principle-35-guide',
    E'# JTH Principle 35 - Entry Level Excellence\n\n## Overview\nThe Principle 35 is our entry-level 3.5t horsebox, perfect for weekend riders and first-time horsebox buyers. Built with the same JTH quality and attention to detail as our premium models.\n\n## Key Features\n- 2 horse capacity with full-height breast bar\n- LED lighting throughout\n- Anti-slip rubber flooring\n- External tack locker\n- Grooms door for easy access\n\n## Specifications\n- **Base Price**: £35,000 - £40,000\n- **Build Time**: 8-10 weeks\n- **Payload**: 2,300kg\n- **Warranty**: 5-year structural, 2-year components\n\n## Why Choose the Principle 35?\nPerfect for riders who need reliable, safe transport without breaking the bank. Every Principle 35 is built to the same exacting standards as our luxury models.',
    'Entry-level 3.5t horsebox with essential features and JTH build quality',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['3.5t', 'principle', 'entry-level', 'horsebox'],
    'Discover the JTH Principle 35 - affordable 3.5t horsebox with 8-10 week build time',
    true,
    true;

INSERT INTO kb_articles (
    category_id, title, slug, content, summary, 
    author_id, tags, meta_description, is_published, is_featured
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'models'),
    'JTH Professional 35 - The Competition Choice',
    'jth-professional-35-guide',
    E'# JTH Professional 35 - The Competition Choice\n\n## Overview\nThe Professional 35 is our mid-range 3.5t horsebox, featuring enhanced comfort and premium finishes. The choice of competition riders across the UK.\n\n## Key Features\n- Luxury living area with weekender package\n- Hot water system\n- Solar panel ready\n- Bluetooth sound system\n- Reversing camera\n- Air conditioning preparation\n\n## Specifications\n- **Base Price**: £45,000 - £55,000\n- **Build Time**: 10-12 weeks\n- **Payload**: 2,250kg\n- **Warranty**: 5-year structural, 2-year components\n\n## Perfect For\nCompetition riders who spend weekends at shows and need comfort alongside functionality.',
    'Mid-range 3.5t horsebox with luxury living and competition features',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['3.5t', 'professional', 'competition', 'weekender'],
    'JTH Professional 35 - luxury 3.5t horsebox for competition riders',
    true,
    true;

INSERT INTO kb_articles (
    category_id, title, slug, content, summary, 
    author_id, tags, meta_description, is_published, is_featured
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'models'),
    'JTH Progeny 35 with Pioneer Package',
    'jth-progeny-35-pioneer',
    E'# JTH Progeny 35 with Pioneer Package\n\n## Overview\nThe pinnacle of 3.5t horsebox design. The Progeny 35 with Pioneer Package offers luxury car-like features in a horsebox.\n\n## Pioneer Package Includes\n- Full bathroom with toilet and shower\n- Luxury kitchen with all appliances\n- 100Ah lithium battery system\n- 1000W pure sine wave inverter\n- Satellite TV preparation\n- Premium leather seating\n- Underfloor heating\n\n## Specifications\n- **Base Price**: £55,000 - £65,000\n- **Build Time**: 12-14 weeks\n- **Payload**: 2,200kg\n- **Warranty**: 5-year structural, 3-year components with Pioneer Package\n\n## The Ultimate 3.5t\nNo compromise on luxury or functionality. The Progeny 35 is for those who demand the best.',
    'Premium 3.5t horsebox with Pioneer Package luxury features',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['3.5t', 'progeny', 'pioneer-package', 'luxury'],
    'JTH Progeny 35 - premium 3.5t horsebox with Pioneer Package',
    true,
    true;

-- Insert warranty information article
INSERT INTO kb_articles (
    category_id, title, slug, content, summary,
    author_id, tags, meta_description, is_published
)
SELECT 
    (SELECT id FROM kb_categories WHERE slug = 'warranty'),
    'JTH Warranty Coverage Explained',
    'warranty-coverage-explained',
    E'# JTH Warranty Coverage Explained\n\n## Standard Warranty\nAll JTH horseboxes come with comprehensive warranty coverage:\n\n### Structural Warranty - 5 Years\n- Chassis and frame\n- Body shell\n- Floor structure\n- Roof integrity\n\n### Component Warranty - 2 Years\n- Electrical systems\n- Plumbing\n- Windows and doors\n- Interior fittings\n- Horse area equipment\n\n### Cosmetic Warranty - 1 Year\n- Paint finish\n- Interior surfaces\n- Upholstery\n- External graphics\n\n## Extended Warranty Options\n- Additional 2-year component warranty available\n- Additional 3-year structural warranty available\n- Annual service packages to maintain warranty\n\n## What''s Not Covered\n- Normal wear and tear\n- Damage from accidents or misuse\n- Modifications not approved by JTH\n- Consumable items (bulbs, fuses, etc.)',
    'Comprehensive guide to JTH warranty coverage and options',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    ARRAY['warranty', 'coverage', 'service', 'support'],
    'Understanding your JTH horsebox warranty - 5 year structural warranty included',
    true;

-- =====================================================
-- FREQUENTLY ASKED QUESTIONS
-- =====================================================

INSERT INTO faqs (category, question, answer, tags, position, is_published)
VALUES 
    ('General Information', 
     'What is the typical build time for a JTH horsebox?',
     'Build times vary by model: Principle 35 (8-10 weeks), Professional 35 (10-12 weeks), Progeny 35 (12-14 weeks), Aeos models (12-14 weeks), Zenos 72 (16-20 weeks). These are estimates from deposit date and can vary based on specification and current workload.',
     ARRAY['build-time', 'delivery', 'production'],
     1, true),
    
    ('Models & Specifications',
     'What''s the difference between the 3.5t models?',
     'We offer three 3.5t models: Principle 35 (£35-40k, essential features), Professional 35 (£45-55k, enhanced comfort and weekender package), and Progeny 35 (£55-65k, includes Pioneer Package with luxury features). All have the same 2-horse capacity but differ in living accommodation and features.',
     ARRAY['3.5t', 'models', 'comparison', 'pricing'],
     2, true),
    
    ('Models & Specifications',
     'Can I tow a 3.5t horsebox on a car license?',
     'Yes, if you passed your test before 1997, you can tow up to 3.5t on a standard license. If you passed after 1997, you may need to take an additional B+E test depending on your vehicle and trailer combination weight. We recommend checking with DVLA for your specific situation.',
     ARRAY['license', '3.5t', 'towing', 'legal'],
     3, true),
    
    ('Warranty & Service',
     'What warranty comes with a JTH horsebox?',
     'All JTH horseboxes include: 5-year structural warranty (chassis, body, floor, roof), 2-year component warranty (electrical, plumbing, fittings), and 1-year cosmetic warranty. Extended warranties are available, and the Pioneer Package includes an additional year on components.',
     ARRAY['warranty', 'coverage', 'service'],
     4, true),
    
    ('Finance & Payment',
     'What deposit do I need to order?',
     'We typically require a 20% deposit to secure your build slot, with the balance due on completion. We can arrange flexible payment schedules and work with various finance providers to help spread the cost. Contact our sales team for personalized options.',
     ARRAY['deposit', 'payment', 'finance', 'ordering'],
     5, true),
    
    ('Ordering & Delivery',
     'Can I visit during the build?',
     'Absolutely! We encourage customers to visit our York workshop during the build process. We''ll provide regular photo updates through our customer portal, and you''re welcome to book visits to see your horsebox taking shape. Final inspection before collection is standard.',
     ARRAY['visit', 'workshop', 'build-updates', 'collection'],
     6, true),
    
    ('Models & Specifications',
     'What''s included in the Pioneer Package?',
     'The Pioneer Package (standard on Progeny 35) includes: full bathroom, luxury kitchen, 100Ah lithium battery, 1000W inverter, satellite TV prep, premium leather seating, underfloor heating, and enhanced warranty. It adds approximately £8,500 to the base price.',
     ARRAY['pioneer-package', 'progeny', 'features', 'luxury'],
     7, true),
    
    ('General Information',
     'Where are JTH horseboxes built?',
     'All JTH horseboxes are hand-built in our workshop in York, North Yorkshire. We''ve been building quality horseboxes since 2010, with over 500 satisfied customers across the UK and Ireland.',
     ARRAY['location', 'workshop', 'york', 'manufacturing'],
     8, true),
    
    ('Ordering & Delivery',
     'Do you deliver nationwide?',
     'Yes, we deliver throughout the UK and Ireland. Delivery within 100 miles of York is included in the price. For longer distances, we charge a nominal fee. We can also arrange collection from our York workshop if you prefer.',
     ARRAY['delivery', 'nationwide', 'collection'],
     9, true),
    
    ('Finance & Payment',
     'Do you offer finance options?',
     'Yes, we work with several specialist horsebox finance providers offering competitive rates. Options include hire purchase, lease purchase, and personal loans. Terms from 1-7 years available subject to status. Our sales team can provide a personalized quote.',
     ARRAY['finance', 'payment-options', 'hire-purchase'],
     10, true);

-- =====================================================
-- SAMPLE CUSTOMER DATA FOR TESTING
-- =====================================================

-- Sample leads in different stages
INSERT INTO leads (organization_id, contact_id, source, stage, status, score, notes)
VALUES
    -- New inquiry
    ((SELECT id FROM organizations WHERE name = 'Kathy Webb Equestrian'),
     (SELECT id FROM contacts WHERE email = 'kathy.webb@example.com'),
     'website', 'inquiry', 'new', 10,
     'Interested in Professional 35, wants weekender package'),
    
    -- Qualification stage
    ('a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000002',
     'phone', 'qualification', 'active', 30,
     'Budget confirmed, looking at Principle 35 or Professional 35'),
    
    -- Specification stage
    ('a0000000-0000-0000-0000-000000000003',
     'b0000000-0000-0000-0000-000000000003',
     'referral', 'specification', 'active', 50,
     'Progeny 35 with Pioneer Package, custom color scheme requested'),
    
    -- Quotation stage
    ('a0000000-0000-0000-0000-000000000004',
     'b0000000-0000-0000-0000-000000000004',
     'show', 'quotation', 'active', 70,
     'Aeos Freedom for family use, quote sent last week');

-- Insert sample organization and contacts for the leads above
INSERT INTO organizations (id, name, type) VALUES
    ('a0000000-0000-0000-0000-000000000002', 'Smith Equestrian', 'individual'),
    ('a0000000-0000-0000-0000-000000000003', 'Johnson Stables', 'business'),
    ('a0000000-0000-0000-0000-000000000004', 'Williams Family', 'individual');

INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone) VALUES
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
     'John', 'Smith', 'john.smith@example.com', '07700900001'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
     'Sarah', 'Johnson', 'sarah@johnsonstables.com', '07700900002'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
     'David', 'Williams', 'david.williams@example.com', '07700900003');

-- Sample production job with stages
INSERT INTO production_jobs (
    job_number, order_id, model_id, status, current_stage,
    start_date, target_date, hours_estimated, notes
)
SELECT 
    'JOB-2025-001',
    (SELECT id FROM orders LIMIT 1),
    (SELECT id FROM product_models WHERE model_code = 'JTH-PROF-35'),
    'in_progress',
    'Interior Fit Out',
    CURRENT_DATE - INTERVAL '2 weeks',
    CURRENT_DATE + INTERVAL '4 weeks',
    160,
    'Professional 35 for Kathy Webb - Blue exterior, cream interior';

-- Add production stages for the job
INSERT INTO production_stages (
    job_id, stage_name, stage_order, status, 
    estimated_hours, completion_percentage
)
SELECT 
    (SELECT id FROM production_jobs WHERE job_number = 'JOB-2025-001'),
    stage_name,
    stage_order,
    status,
    estimated_hours,
    completion_percentage
FROM (VALUES
    ('Chassis Preparation', 1, 'completed', 16, 100),
    ('Floor & Walls', 2, 'completed', 24, 100),
    ('Electrical Installation', 3, 'completed', 16, 100),
    ('Plumbing', 4, 'completed', 12, 100),
    ('Interior Fit Out', 5, 'in_progress', 32, 60),
    ('Painting', 6, 'pending', 20, 0),
    ('Testing & QC', 7, 'pending', 8, 0),
    ('Final Inspection', 8, 'pending', 4, 0)
) AS stages(stage_name, stage_order, status, estimated_hours, completion_percentage);

-- Sample build updates for customer portal
INSERT INTO build_updates (
    job_id, title, description, update_type, is_customer_visible
)
SELECT 
    (SELECT id FROM production_jobs WHERE job_number = 'JOB-2025-001'),
    title,
    description,
    update_type,
    true
FROM (VALUES
    ('Chassis Complete', 'Chassis preparation completed and moved to body shop', 'milestone'),
    ('Walls and Floor Installed', 'Insulated floor and walls are now in place', 'milestone'),
    ('Electrical System Installed', 'All wiring complete, LED lights fitted throughout', 'milestone'),
    ('Interior Work Started', 'Cabinet installation has begun in the living area', 'progress')
) AS updates(title, description, update_type);

-- =====================================================
-- MODEL SPECIFICATIONS FOR KNOWLEDGE BASE
-- =====================================================

INSERT INTO kb_model_specs (
    model_id, spec_category, spec_name, spec_value, spec_unit, is_highlight, position
)
SELECT 
    pm.id,
    spec.category,
    spec.name,
    spec.value,
    spec.unit,
    spec.highlight,
    spec.position
FROM product_models pm
CROSS JOIN (VALUES
    -- Weight & Dimensions
    ('Dimensions', 'Gross Vehicle Weight', '3500', 'kg', true, 1),
    ('Dimensions', 'Unladen Weight', '1200-1300', 'kg', false, 2),
    ('Dimensions', 'Payload Capacity', '2200-2300', 'kg', true, 3),
    ('Dimensions', 'External Length', '5.5', 'm', false, 4),
    ('Dimensions', 'External Width', '2.2', 'm', false, 5),
    ('Dimensions', 'External Height', '2.8', 'm', false, 6),
    
    -- Horse Area
    ('Horse Area', 'Horse Capacity', '2', 'horses', true, 10),
    ('Horse Area', 'Stall Length', '1.8', 'm', false, 11),
    ('Horse Area', 'Stall Width', '0.9', 'm', false, 12),
    ('Horse Area', 'Internal Height', '2.0', 'm', false, 13),
    ('Horse Area', 'Floor Type', 'Anti-slip rubber', '', false, 14),
    
    -- Living Area
    ('Living Area', 'Seating Capacity', '4', 'persons', false, 20),
    ('Living Area', 'Bed Configuration', 'Luton overcab', '', false, 21),
    ('Living Area', 'Kitchen Type', 'Varies by model', '', false, 22),
    ('Living Area', 'Water Tank', '80', 'litres', false, 23),
    
    -- Power & Technology
    ('Power', 'Leisure Battery', '100-200', 'Ah', false, 30),
    ('Power', 'Solar Panel Option', 'Yes', '', false, 31),
    ('Power', 'Inverter Option', '1000-3000', 'W', false, 32),
    ('Power', 'USB Outlets', '4-8', 'ports', false, 33)
) AS spec(category, name, value, unit, highlight, position)
WHERE pm.category = '3.5t';

-- =====================================================
-- INITIALIZE COUNTERS AND SETTINGS
-- =====================================================

-- Reset order number sequence
ALTER SEQUENCE IF EXISTS order_number_seq RESTART WITH 1001;

-- Update system settings for production
UPDATE system_settings 
SET value = jsonb_set(value, '{max_concurrent_builds}', '5')
WHERE key = 'production_stages';

-- Create notification for admin about database setup
INSERT INTO activity_logs (
    entity_type, entity_id, action, performed_by, details
) VALUES (
    'system', uuid_generate_v4(), 'database_initialized',
    (SELECT id FROM users WHERE email = 'admin@jthltd.co.uk'),
    jsonb_build_object(
        'message', 'JTH database initialized with models, knowledge base, and sample data',
        'timestamp', NOW(),
        'version', '1.0.0'
    )
);