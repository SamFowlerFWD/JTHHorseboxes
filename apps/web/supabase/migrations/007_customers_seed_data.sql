-- =====================================================
-- CUSTOMERS SEED DATA MIGRATION
-- =====================================================
-- This migration imports the mock customer data from the application
-- into the newly created customers table.
-- 
-- Run this after 006_customers_table.sql
-- =====================================================

-- Insert mock customers data
INSERT INTO customers (
    id,
    first_name,
    last_name,
    company,
    email,
    phone,
    address_street,
    address_city,
    address_county,
    address_postcode,
    address_country,
    status,
    customer_type,
    created_at,
    last_contact_date,
    total_orders,
    total_value,
    notes,
    tags
) VALUES 
(
    uuid_generate_v4(),
    'Sarah',
    'Thompson',
    'Thompson Equestrian',
    'sarah.thompson@example.com',
    '+44 7700 900123',
    '123 High Street',
    'York',
    'North Yorkshire',
    'YO1 7HY',
    'United Kingdom',
    'active',
    'business',
    '2024-06-15'::TIMESTAMPTZ,
    '2024-12-10'::TIMESTAMPTZ,
    2,
    85000.00,
    'VIP customer - owns multiple horses',
    ARRAY['vip', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'James',
    'Wilson',
    NULL,
    'j.wilson@example.com',
    '+44 7700 900456',
    '45 Oak Avenue',
    'Leeds',
    'West Yorkshire',
    'LS1 2AB',
    'United Kingdom',
    'prospect',
    'individual',
    '2024-11-20'::TIMESTAMPTZ,
    '2024-12-08'::TIMESTAMPTZ,
    0,
    0.00,
    'Interested in 3.5t model',
    ARRAY['lead', 'follow_up']
),
(
    uuid_generate_v4(),
    'Emma',
    'Davies',
    'Davies Racing Stables',
    'emma@daviesracing.co.uk',
    '+44 7700 900789',
    '78 Mill Lane',
    'Harrogate',
    'North Yorkshire',
    'HG1 3QP',
    'United Kingdom',
    'active',
    'business',
    '2023-09-10'::TIMESTAMPTZ,
    '2024-11-25'::TIMESTAMPTZ,
    3,
    125000.00,
    'Professional racing stable',
    ARRAY['professional', 'racing']
),
(
    uuid_generate_v4(),
    'Michael',
    'Brown',
    NULL,
    'mbrown@example.com',
    '+44 7700 900321',
    '12 Church Road',
    'Sheffield',
    'South Yorkshire',
    'S1 4PD',
    'United Kingdom',
    'active',
    'individual',
    '2024-03-22'::TIMESTAMPTZ,
    '2024-10-15'::TIMESTAMPTZ,
    1,
    42000.00,
    'First time buyer',
    ARRAY['new_customer']
),
(
    uuid_generate_v4(),
    'Lucy',
    'Anderson',
    'Anderson Equine Transport',
    'lucy@andersonequine.com',
    '+44 7700 900654',
    '234 Main Street',
    'Ripon',
    'North Yorkshire',
    'HG4 1AA',
    'United Kingdom',
    'active',
    'business',
    '2024-01-05'::TIMESTAMPTZ,
    '2024-12-01'::TIMESTAMPTZ,
    4,
    180000.00,
    'Fleet customer - multiple vehicles',
    ARRAY['fleet', 'commercial']
),
(
    uuid_generate_v4(),
    'David',
    'Jones',
    NULL,
    'djones@example.com',
    '+44 7700 900987',
    '56 Park View',
    'Thirsk',
    'North Yorkshire',
    'YO7 1RR',
    'United Kingdom',
    'prospect',
    'individual',
    '2024-12-05'::TIMESTAMPTZ,
    '2024-12-12'::TIMESTAMPTZ,
    0,
    0.00,
    'Quote requested for 4.5t model',
    ARRAY['quote_sent']
),
(
    uuid_generate_v4(),
    'Rachel',
    'Green',
    'Green Fields Stud',
    'rachel@greenfields.co.uk',
    '+44 7700 900147',
    '89 Country Lane',
    'Wetherby',
    'West Yorkshire',
    'LS22 5EF',
    'United Kingdom',
    'active',
    'business',
    '2023-05-18'::TIMESTAMPTZ,
    '2024-11-30'::TIMESTAMPTZ,
    2,
    95000.00,
    'Breeding operation',
    ARRAY['breeder', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'Thomas',
    'Wright',
    NULL,
    'twright@example.com',
    '+44 7700 900258',
    '33 Station Road',
    'Northallerton',
    'North Yorkshire',
    'DL7 8AD',
    'United Kingdom',
    'inactive',
    'individual',
    '2023-11-12'::TIMESTAMPTZ,
    '2024-05-20'::TIMESTAMPTZ,
    1,
    38000.00,
    'Completed purchase - no current activity',
    ARRAY['inactive']
),
(
    uuid_generate_v4(),
    'Charlotte',
    'Evans',
    'Evans Livery Yard',
    'charlotte@evanslivery.com',
    '+44 7700 900369',
    '15 Farm Road',
    'Skipton',
    'North Yorkshire',
    'BD23 1EP',
    'United Kingdom',
    'active',
    'business',
    '2024-02-28'::TIMESTAMPTZ,
    '2024-12-05'::TIMESTAMPTZ,
    2,
    76000.00,
    'Livery yard owner - potential for more sales',
    ARRAY['livery', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'Oliver',
    'Taylor',
    NULL,
    'o.taylor@example.com',
    '+44 7700 900741',
    '67 Queens Road',
    'Beverley',
    'East Yorkshire',
    'HU17 8NF',
    'United Kingdom',
    'active',
    'individual',
    '2024-07-10'::TIMESTAMPTZ,
    '2024-11-28'::TIMESTAMPTZ,
    1,
    48000.00,
    'Happy customer - left positive review',
    ARRAY['satisfied', 'reviewer']
),
(
    uuid_generate_v4(),
    'Sophie',
    'Martin',
    'Martin Competition Horses',
    'sophie@martinhorses.co.uk',
    '+44 7700 900852',
    '90 Paddock Lane',
    'Malton',
    'North Yorkshire',
    'YO17 7HP',
    'United Kingdom',
    'active',
    'business',
    '2023-12-15'::TIMESTAMPTZ,
    '2024-12-08'::TIMESTAMPTZ,
    3,
    142000.00,
    'Competition yard - high-end requirements',
    ARRAY['competition', 'premium', 'repeat_customer']
),
(
    uuid_generate_v4(),
    'William',
    'Clarke',
    NULL,
    'w.clarke@example.com',
    '+44 7700 900963',
    '23 Victoria Street',
    'Doncaster',
    'South Yorkshire',
    'DN1 3NJ',
    'United Kingdom',
    'prospect',
    'individual',
    '2024-12-01'::TIMESTAMPTZ,
    '2024-12-11'::TIMESTAMPTZ,
    0,
    0.00,
    'Browsed configurator - follow up needed',
    ARRAY['configurator_user', 'follow_up']
);

-- Update average order values for customers with orders
UPDATE customers 
SET average_order_value = CASE 
    WHEN total_orders > 0 THEN total_value / total_orders 
    ELSE 0 
END
WHERE total_orders > 0;

-- Set last order dates for customers with orders
UPDATE customers 
SET last_order_date = created_at + INTERVAL '30 days'
WHERE total_orders > 0;

-- Add some sample communications for active customers
INSERT INTO customer_communications (
    customer_id,
    communication_type,
    direction,
    subject,
    content,
    outcome,
    created_at
)
SELECT 
    c.id,
    'email',
    'outbound',
    'Thank you for your interest in J Taylor Horseboxes',
    'Following up on your recent inquiry about our ' || 
    CASE 
        WHEN c.notes LIKE '%3.5t%' THEN '3.5t model'
        WHEN c.notes LIKE '%4.5t%' THEN '4.5t model'
        ELSE 'horsebox range'
    END,
    CASE 
        WHEN c.status = 'active' THEN 'interested'
        WHEN c.status = 'prospect' THEN 'follow_up_needed'
        ELSE 'not_interested'
    END,
    c.last_contact_date
FROM customers c
WHERE c.status IN ('active', 'prospect')
LIMIT 5;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the data migration:
/*
-- Check customer count
SELECT COUNT(*) as total_customers FROM customers;

-- Check customer distribution by status
SELECT status, COUNT(*) as count 
FROM customers 
GROUP BY status 
ORDER BY count DESC;

-- Check customer types
SELECT customer_type, COUNT(*) as count 
FROM customers 
GROUP BY customer_type 
ORDER BY count DESC;

-- Check top customers by value
SELECT 
    first_name || ' ' || last_name as name,
    company,
    total_value,
    total_orders
FROM customers 
ORDER BY total_value DESC 
LIMIT 5;

-- Check communications
SELECT COUNT(*) as total_communications 
FROM customer_communications;
*/

-- =====================================================
-- END OF SEED DATA MIGRATION
-- =====================================================