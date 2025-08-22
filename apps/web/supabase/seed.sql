-- Seed data for J Taylor Horseboxes database
-- This file contains sample data for testing and development

-- =====================================================
-- PRICING OPTIONS - Sample data for all models
-- =====================================================

-- 3.5t Model Base Options
INSERT INTO pricing_options (model, category, subcategory, name, description, sku, price, is_default, display_order) VALUES
('3.5t', 'base', 'model', 'Principle 3.5t', 'Entry-level 3.5 tonne horsebox with essential features', 'JTH-P35-BASE', 18995.00, false, 1),
('3.5t', 'base', 'model', 'Professional 3.5t', 'Mid-range 3.5 tonne horsebox with enhanced comfort', 'JTH-PR35-BASE', 24995.00, true, 2),
('3.5t', 'base', 'model', 'Progeny 3.5t', 'Premium 3.5 tonne horsebox with luxury features', 'JTH-PG35-BASE', 32995.00, false, 3);

-- 4.5t Model Base Options
INSERT INTO pricing_options (model, category, subcategory, name, description, sku, price, is_default, display_order) VALUES
('4.5t', 'base', 'model', 'Professional 4.5t', 'Standard 4.5 tonne horsebox for professional use', 'JTH-PR45-BASE', 34995.00, true, 1),
('4.5t', 'base', 'model', 'Prestige 4.5t', 'Premium 4.5 tonne horsebox with advanced features', 'JTH-PS45-BASE', 42995.00, false, 2);

-- 7.2t Model Base Options
INSERT INTO pricing_options (model, category, subcategory, name, description, sku, price, is_default, display_order) VALUES
('7.2t', 'base', 'model', 'Professional 7.2t', 'Heavy-duty 7.2 tonne horsebox for commercial use', 'JTH-PR72-BASE', 52995.00, true, 1),
('7.2t', 'base', 'model', 'Elite 7.2t', 'Top-tier 7.2 tonne horsebox with maximum capacity', 'JTH-EL72-BASE', 68995.00, false, 2);

-- Common Options for All Models
INSERT INTO pricing_options (model, category, subcategory, name, description, sku, price, display_order) VALUES
-- External Features
('all', 'exterior', 'paint', 'Metallic Paint', 'Premium metallic paint finish', 'OPT-PAINT-METAL', 1250.00, 1),
('all', 'exterior', 'paint', 'Two-Tone Paint', 'Custom two-tone paint scheme', 'OPT-PAINT-2TONE', 1850.00, 2),
('all', 'exterior', 'graphics', 'Custom Graphics', 'Personalized vinyl graphics and lettering', 'OPT-GRAPH-CUSTOM', 650.00, 3),
('all', 'exterior', 'accessories', 'Alloy Wheels', 'Lightweight alloy wheel upgrade', 'OPT-WHEEL-ALLOY', 1450.00, 4),
('all', 'exterior', 'accessories', 'External Tack Locker', 'Weatherproof external storage locker', 'OPT-TACK-EXT', 850.00, 5),

-- Internal Features
('all', 'interior', 'flooring', 'Rubber Matting', 'Heavy-duty rubber floor matting', 'OPT-FLOOR-RUBBER', 450.00, 1),
('all', 'interior', 'flooring', 'Aluminium Flooring', 'Lightweight aluminium floor panels', 'OPT-FLOOR-ALU', 1250.00, 2),
('all', 'interior', 'partitions', 'Adjustable Partition', 'Sliding adjustable horse partition', 'OPT-PART-ADJ', 650.00, 3),
('all', 'interior', 'partitions', 'Full Height Partition', 'Floor to ceiling partition with padding', 'OPT-PART-FULL', 950.00, 4),
('all', 'interior', 'comfort', 'Padded Walls', 'Extra wall padding for horse comfort', 'OPT-PAD-WALL', 750.00, 5),

-- Safety Equipment
('all', 'safety', 'camera', 'Reversing Camera', 'HD reversing camera with monitor', 'OPT-CAM-REVERSE', 450.00, 1),
('all', 'safety', 'camera', 'Horse Area Camera', 'Internal CCTV for horse monitoring', 'OPT-CAM-HORSE', 650.00, 2),
('all', 'safety', 'camera', 'Full CCTV System', '4-camera system with DVR recording', 'OPT-CAM-FULL', 1850.00, 3),
('all', 'safety', 'emergency', 'Fire Extinguisher', 'Vehicle-rated fire extinguisher', 'OPT-SAFE-FIRE', 125.00, 4),
('all', 'safety', 'emergency', 'First Aid Kit', 'Comprehensive equine first aid kit', 'OPT-SAFE-AID', 185.00, 5),

-- Living/Comfort Features
('all', 'living', 'seating', 'Luxury Seating', 'Premium leather day bed/seating', 'OPT-SEAT-LUX', 1850.00, 1),
('all', 'living', 'kitchen', 'Kitchenette', 'Compact kitchen with sink and hob', 'OPT-KITCH-BASIC', 2450.00, 2),
('all', 'living', 'kitchen', 'Full Kitchen', 'Complete kitchen with fridge and microwave', 'OPT-KITCH-FULL', 4250.00, 3),
('all', 'living', 'power', 'Solar Panel System', '200W solar panel with battery storage', 'OPT-SOLAR-200', 1650.00, 4),
('all', 'living', 'power', 'Diesel Heater', 'Webasto diesel heating system', 'OPT-HEAT-DIESEL', 2250.00, 5),

-- Horse Equipment
('all', 'equipment', 'water', 'Water Tank Upgrade', 'Larger 200L water tank', 'OPT-WATER-200L', 450.00, 1),
('all', 'equipment', 'feeding', 'Hay Net System', 'Integrated hay net hanging system', 'OPT-HAY-NET', 185.00, 2),
('all', 'equipment', 'ventilation', 'Extra Windows', 'Additional windows for ventilation', 'OPT-WINDOW-ADD', 650.00, 3),
('all', 'equipment', 'ventilation', 'Roof Vents', 'Powered roof ventilation system', 'OPT-VENT-ROOF', 850.00, 4);

-- Model-specific options
INSERT INTO pricing_options (model, category, subcategory, name, description, sku, price, display_order, dependencies) VALUES
-- 7.2t specific options
('7.2t', 'capacity', 'stalls', '3 Horse Configuration', 'Upgrade to 3 horse capacity', 'OPT-72-3HORSE', 2850.00, 1, NULL),
('7.2t', 'capacity', 'stalls', '4 Horse Configuration', 'Upgrade to 4 horse capacity', 'OPT-72-4HORSE', 4250.00, 2, NULL),
('7.2t', 'living', 'sleeping', 'Luton Bed', 'Overhead sleeping area above cab', 'OPT-72-LUTON', 3450.00, 3, NULL);

-- =====================================================
-- KNOWLEDGE BASE - Sample content for RAG
-- =====================================================

INSERT INTO knowledge_base (title, content, category, tags, source, relevance_score, search_keywords) VALUES
-- General Information
('What is the towing licence requirement for a 3.5t horsebox?', 
'To tow a 3.5 tonne horsebox in the UK, you need a standard Category B driving licence if you passed your test after 1 January 1997. The combined weight of the vehicle and trailer must not exceed 3,500kg MAM (Maximum Authorised Mass). If you passed your test before this date, you automatically have Category B+E which allows you to tow heavier trailers. For our 3.5t horseboxes, no additional licence is required as they are driven, not towed.',
'licensing', ARRAY['licence', 'driving', '3.5t', 'legal'], 'faq', 1.00,
'license licence driving B+E category MAM weight towing requirements legal'),

('How many horses can each model carry?',
'Our horsebox capacity varies by model: The 3.5t models (Principle, Professional, Progeny) can safely carry 2 horses up to 500kg each. The 4.5t models (Professional, Prestige) can carry 2-3 horses depending on weight. The 7.2t models (Professional, Elite) can carry 3-4 horses with our optional configurations. All models are designed with optimal weight distribution and safety features.',
'capacity', ARRAY['horses', 'weight', 'models', 'capacity'], 'product', 1.00,
'horse horses capacity weight carry transport models 3.5t 4.5t 7.2t maximum'),

-- Maintenance and Care
('How often should I service my horsebox?',
'Regular servicing is essential for safety and longevity. We recommend: Annual service or every 10,000 miles (whichever comes first) for the base vehicle. Six-monthly safety checks for the horse area including floors, partitions, and tie points. Annual habitation check for living areas if fitted. Daily pre-journey checks of tyres, lights, and essential systems. Keep detailed service records for warranty and resale value.',
'maintenance', ARRAY['service', 'maintenance', 'safety', 'checks'], 'documentation', 0.95,
'service servicing maintenance safety check annual inspection MOT warranty'),

('What warranty coverage is provided?',
'All J Taylor Horseboxes come with comprehensive warranty coverage: 3-year manufacturer warranty on the base vehicle, 5-year structural warranty on the horsebox conversion, 2-year warranty on all fitted equipment and accessories, 12-month warranty on electrical systems. Extended warranty options are available. Warranty is transferable to subsequent owners.',
'warranty', ARRAY['warranty', 'coverage', 'guarantee', 'support'], 'documentation', 0.90,
'warranty guarantee coverage support years structural manufacturer extended'),

-- Technical Specifications
('What are the payload capacities?',
'Payload capacity (horses + equipment + passengers) varies by model: 3.5t models offer approximately 1,000-1,200kg payload. 4.5t models provide 1,500-1,800kg payload. 7.2t models deliver 2,500-3,500kg payload depending on specification. These figures include horses, passengers, water, feed, and tack. Always check your specific vehicle plate for exact payload.',
'specifications', ARRAY['payload', 'weight', 'capacity', 'technical'], 'product', 0.95,
'payload capacity weight horses equipment maximum MAM specifications technical'),

('What safety features are standard?',
'All J Taylor Horseboxes include comprehensive safety features as standard: Anti-slip flooring, padded partitions, internal lighting, external warning lights, breakaway cable, secure tie points, emergency exits, fire extinguisher, first aid kit. Optional safety upgrades include CCTV systems, reversing cameras, and additional emergency equipment.',
'safety', ARRAY['safety', 'features', 'standard', 'security'], 'product', 1.00,
'safety features security standard equipment emergency cameras CCTV protection'),

-- Customization Options
('Can I customize the interior layout?',
'Yes, we offer extensive customization options. Our design team will work with you to create your ideal layout including: Partition configurations, living area arrangements, storage solutions, colour schemes, and equipment placement. Use our online configurator to explore options or visit our showroom for a consultation.',
'customization', ARRAY['custom', 'design', 'interior', 'layout'], 'product', 0.85,
'customize customization custom bespoke interior layout design personal options'),

('What external colour options are available?',
'We offer unlimited colour options for your horsebox exterior: Standard colours at no extra cost, metallic and pearl finishes, two-tone combinations, custom graphics and signwriting, vinyl wraps for temporary designs. Our paint shop uses high-quality automotive paints with a 5-year guarantee against fading.',
'customization', ARRAY['colours', 'paint', 'exterior', 'graphics'], 'product', 0.80,
'colour color paint exterior graphics vinyl metallic custom signwriting wrap'),

-- Delivery and Lead Times
('What are typical delivery times?',
'Delivery times vary by model and specification: Stock models: 2-4 weeks, Standard builds: 8-12 weeks, Custom builds: 12-16 weeks, Peak season (March-September) may add 2-4 weeks. We provide regular updates throughout the build process and can arrange collection or delivery throughout the UK and Ireland.',
'delivery', ARRAY['delivery', 'lead time', 'production', 'timeline'], 'faq', 0.85,
'delivery lead time times production build weeks collection timeline schedule'),

-- Finance Options
('What finance options are available?',
'We offer flexible finance solutions through our partner providers: Hire Purchase (HP) from 2-5 years, Lease Purchase with balloon payment options, Business Contract Hire for commercial customers, 0% finance on selected models (subject to promotions). All finance is subject to status and approval. Representative APR varies by term and deposit.',
'finance', ARRAY['finance', 'payment', 'lease', 'HP'], 'faq', 0.90,
'finance payment hire purchase lease HP deposit APR credit monthly options');

-- =====================================================
-- BLOG POSTS - Sample content
-- =====================================================

INSERT INTO blog_posts (
    title, slug, excerpt, content, status, published_at, 
    category, tags, meta_title, meta_description, featured
) VALUES
(
    'Choosing the Right Horsebox: 3.5t vs 7.2t Models',
    'choosing-right-horsebox-weight-class',
    'Understanding the key differences between horsebox weight classes helps you make the best choice for your needs.',
    E'# Choosing the Right Horsebox: 3.5t vs 7.2t Models\n\nWhen investing in a horsebox, one of the most important decisions is choosing the right weight class. Let\'s explore the key differences between our 3.5t and 7.2t models.\n\n## Licence Requirements\n\nThe most significant difference is the driving licence requirement:\n- **3.5t models**: Can be driven on a standard car licence (Category B)\n- **7.2t models**: Require a Category C1 licence\n\n## Capacity and Payload\n\n### 3.5t Models\n- Carry 2 horses comfortably\n- Payload of 1,000-1,200kg\n- Ideal for local shows and events\n- More economical to run\n\n### 7.2t Models\n- Carry 3-4 horses\n- Payload of 2,500-3,500kg\n- Perfect for professional use\n- More living and storage space\n\n## Running Costs\n\nConsider these ongoing costs:\n- Fuel consumption (3.5t: 25-30mpg, 7.2t: 18-22mpg)\n- Insurance premiums\n- Servicing and maintenance\n- Road tax differences\n\n## Making Your Decision\n\nConsider:\n1. How many horses you need to transport\n2. Distance and frequency of travel\n3. Licence requirements and restrictions\n4. Budget for purchase and running costs\n5. Storage and parking availability\n\nOur team is here to help you make the right choice. Book a consultation to discuss your specific needs.',
    'published',
    NOW() - INTERVAL '7 days',
    'guides',
    ARRAY['buying guide', 'models', '3.5t', '7.2t'],
    'Choosing Between 3.5t and 7.2t Horseboxes | J Taylor Horseboxes',
    'Complete guide to choosing between 3.5t and 7.2t horsebox models. Compare licence requirements, capacity, and running costs.',
    true
),
(
    'Essential Pre-Journey Safety Checks for Your Horsebox',
    'essential-pre-journey-safety-checks',
    'A comprehensive checklist to ensure your horsebox is safe and roadworthy before every journey.',
    E'# Essential Pre-Journey Safety Checks for Your Horsebox\n\nSafety should always be your top priority when transporting horses. Here\'s our comprehensive pre-journey checklist.\n\n## Vehicle Checks\n\n### Tyres and Wheels\n- Check tyre pressure (including spare)\n- Inspect for damage or excessive wear\n- Ensure wheel nuts are secure\n- Minimum 3mm tread depth recommended\n\n### Lights and Indicators\n- Test all lights are working\n- Check brake lights with assistance\n- Clean all lenses\n- Carry spare bulbs\n\n### Fluids and Engine\n- Engine oil level\n- Coolant level\n- Brake fluid\n- Windscreen washer fluid\n- Fuel level adequate for journey\n\n## Horse Area Checks\n\n### Flooring and Structure\n- Inspect floor for damage or rot\n- Check rubber matting is secure\n- Test partition stability\n- Ensure no sharp edges or protrusions\n\n### Ventilation and Comfort\n- Windows and vents operational\n- Adequate bedding if used\n- Water containers filled and secure\n- Hay nets properly positioned\n\n## Safety Equipment\n\n### Emergency Kit\n- First aid kit (human and equine)\n- Fire extinguisher in date\n- Warning triangle\n- High-visibility vest\n- Basic tools\n- Mobile phone and charger\n\n## Documentation\n\n### Essential Papers\n- Driving licence\n- Insurance documents\n- Vehicle registration\n- Horse passports\n- Emergency contact numbers\n- Breakdown cover details\n\n## Loading Preparation\n\n### Weight Distribution\n- Calculate total payload\n- Position horses appropriately\n- Secure all loose equipment\n- Balance weight side to side\n\n## Final Checks\n\n1. Doors and ramps secure\n2. Breakaway cable attached (if applicable)\n3. Mirrors adjusted\n4. Route planned with suitable stops\n5. Weather conditions checked\n\nRemember: If in doubt, don\'t travel. Your safety and that of your horses is paramount.',
    'published',
    NOW() - INTERVAL '14 days',
    'safety',
    ARRAY['safety', 'maintenance', 'checklist', 'pre-journey'],
    'Pre-Journey Safety Checks for Horseboxes | Complete Checklist',
    'Essential pre-journey safety checklist for horsebox owners. Ensure safe travel with our comprehensive inspection guide.',
    false
),
(
    'Horsebox Maintenance Schedule: Keeping Your Investment Protected',
    'horsebox-maintenance-schedule-guide',
    'A detailed maintenance schedule to ensure your horsebox remains safe, reliable, and retains its value.',
    E'# Horsebox Maintenance Schedule: Keeping Your Investment Protected\n\nRegular maintenance is crucial for safety, reliability, and protecting your investment. Here\'s our recommended schedule.\n\n## Daily Checks (Before Each Journey)\n\n- Tyre pressure and condition\n- Lights and indicators\n- Oil and coolant levels\n- Ramp and door operation\n- Tie points and partitions\n\n## Weekly Maintenance\n\n### Cleaning\n- Wash exterior to prevent corrosion\n- Clean and disinfect horse area\n- Clear drainage holes\n- Check and clean ventilation systems\n\n### Inspection\n- Floor condition (signs of rot or damage)\n- Rubber matting integrity\n- Window and door seals\n- Battery terminals\n\n## Monthly Tasks\n\n### Mechanical\n- Grease ramp hinges and locks\n- Check brake pad wear\n- Test handbrake efficiency\n- Inspect exhaust system\n\n### Horse Area\n- Deep clean and disinfect\n- Check partition padding\n- Inspect tie rings and chains\n- Test internal lighting\n\n## Quarterly Service\n\n### Professional Inspection\n- Book professional safety inspection\n- Check chassis for corrosion\n- Inspect suspension components\n- Test brake performance\n\n### Living Area (if fitted)\n- Service gas appliances\n- Check water system\n- Test electrical systems\n- Inspect habitation door seals\n\n## Annual Requirements\n\n### Legal Requirements\n- MOT test (if applicable)\n- Insurance renewal\n- Tax renewal\n- Tachograph calibration (7.2t models)\n\n### Major Service\n- Full vehicle service\n- Cambelt replacement (as per schedule)\n- Brake fluid change\n- Comprehensive habitation check\n\n## Long-term Care (2-5 Years)\n\n### Structural\n- Professional floor inspection\n- Repaint/treat wooden components\n- Replace worn rubber matting\n- Update safety equipment\n\n### Mechanical\n- Major service items\n- Clutch inspection\n- Suspension overhaul\n- Exhaust system check\n\n## Record Keeping\n\nMaintain detailed records of:\n- All services and repairs\n- MOT certificates\n- Inspection reports\n- Warranty claims\n- Modification details\n\n## Cost Budgeting\n\nAnnual maintenance costs typically:\n- 3.5t models: £1,500-2,000\n- 7.2t models: £2,000-3,000\n- Include: servicing, MOT, repairs, consumables\n\n## Professional Support\n\nOur service department offers:\n- Annual service packages\n- Emergency breakdown support\n- Warranty-approved repairs\n- Genuine parts supply\n\nRegular maintenance ensures your horsebox remains safe and reliable for years to come.',
    'published',
    NOW() - INTERVAL '21 days',
    'maintenance',
    ARRAY['maintenance', 'service', 'care', 'schedule'],
    'Complete Horsebox Maintenance Schedule | Service Guide',
    'Comprehensive maintenance schedule for horsebox owners. Keep your vehicle safe and protect your investment with regular care.',
    false
);

-- =====================================================
-- EMAIL TEMPLATES
-- =====================================================

INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
('welcome_lead', 
'Welcome to J Taylor Horseboxes - Your Journey Starts Here',
'<h2>Welcome {{first_name}}!</h2><p>Thank you for your interest in J Taylor Horseboxes. We''re excited to help you find your perfect horsebox.</p><p>Your dedicated advisor will be in touch within 24 hours to discuss your requirements.</p><p>In the meantime, feel free to explore our <a href="https://jtaylorhorseboxes.com/models">model range</a> or use our <a href="https://jtaylorhorseboxes.com/configurator">online configurator</a>.</p>',
'Welcome {{first_name}}! Thank you for your interest in J Taylor Horseboxes. Your dedicated advisor will be in touch within 24 hours.',
'{"first_name": "string", "last_name": "string", "email": "string"}'::jsonb),

('quote_ready',
'Your J Taylor Horseboxes Quote is Ready',
'<h2>Hi {{first_name}},</h2><p>Your personalised quote for the {{model}} is now ready.</p><p><a href="{{quote_link}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Quote</a></p><p>This quote is valid for 30 days. If you have any questions, please don''t hesitate to contact your advisor.</p>',
'Hi {{first_name}}, Your quote for the {{model}} is ready. View it here: {{quote_link}}',
'{"first_name": "string", "model": "string", "quote_link": "string"}'::jsonb),

('configuration_saved',
'Your Horsebox Configuration Has Been Saved',
'<h2>Configuration Saved Successfully</h2><p>Hi {{first_name}},</p><p>Your {{model}} configuration "{{config_name}}" has been saved.</p><p>You can access it anytime using this link: <a href="{{config_link}}">{{config_link}}</a></p><p>Ready to proceed? Request a formal quote or book a showroom visit.</p>',
'Your {{model}} configuration has been saved. Access it here: {{config_link}}',
'{"first_name": "string", "model": "string", "config_name": "string", "config_link": "string"}'::jsonb);

-- =====================================================
-- SAMPLE LEADS
-- =====================================================

INSERT INTO leads (
    first_name, last_name, email, phone, company,
    source, status, notes, quote_amount,
    utm_source, utm_medium, utm_campaign,
    consent_marketing, consent_timestamp
) VALUES
('John', 'Smith', 'john.smith@example.com', '07700 900123', 'Smith Equestrian',
'website', 'new', 'Interested in 3.5t Professional model', 24995.00,
'google', 'cpc', 'brand', true, NOW()),

('Sarah', 'Jones', 'sarah.jones@example.com', '07700 900456', NULL,
'configurator', 'qualified', 'Configured 7.2t Elite with living. Ready to purchase.', 78500.00,
'facebook', 'social', 'summer2024', true, NOW()),

('Michael', 'Brown', 'michael.brown@example.com', '07700 900789', 'Brown Racing Stables',
'phone', 'contacted', 'Called about 4.5t for competition use. Callback scheduled.', 42995.00,
NULL, NULL, NULL, false, NULL),

('Emma', 'Wilson', 'emma.wilson@example.com', '07700 900321', NULL,
'email', 'quoted', 'Sent quote for 3.5t Progeny with custom paint', 35250.00,
'newsletter', 'email', 'monthly', true, NOW()),

('David', 'Taylor', 'david.taylor@example.com', '07700 900654', 'Taylor Transport Ltd',
'showroom', 'converted', 'Purchased 7.2t Professional. Delivery next month.', 58750.00,
NULL, 'direct', NULL, true, NOW());

-- =====================================================
-- SAMPLE SAVED CONFIGURATIONS
-- =====================================================

INSERT INTO saved_configurations (
    name, model, configuration, total_price, share_token, is_public
) VALUES
('My Dream 3.5t', '3.5t', 
'{"base": "Professional 3.5t", "exterior": ["Metallic Paint", "Alloy Wheels"], "interior": ["Rubber Matting", "Adjustable Partition"], "safety": ["Reversing Camera", "Horse Area Camera"]}'::jsonb,
28740.00, 'share_' || substr(md5(random()::text), 1, 10), true),

('Competition Ready 7.2t', '7.2t',
'{"base": "Elite 7.2t", "capacity": ["3 Horse Configuration"], "living": ["Full Kitchen", "Luton Bed"], "safety": ["Full CCTV System"], "equipment": ["Water Tank Upgrade", "Roof Vents"]}'::jsonb,
82440.00, 'share_' || substr(md5(random()::text), 1, 10), true),

('Budget Friendly 3.5t', '3.5t',
'{"base": "Principle 3.5t", "interior": ["Rubber Matting"], "safety": ["Fire Extinguisher", "First Aid Kit"]}'::jsonb,
19755.00, 'share_' || substr(md5(random()::text), 1, 10), false);

-- Note: Vector embeddings for knowledge_base would need to be generated
-- by your application using OpenAI's API or similar service