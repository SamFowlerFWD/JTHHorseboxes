-- Quick verification that tables were created successfully
SELECT 'Tables Verification' AS check_type;

-- Count rows in each table (should be 0 but table should exist)
SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers
UNION ALL
SELECT 'customer_communications', COUNT(*) FROM customer_communications
UNION ALL
SELECT 'customer_orders', COUNT(*) FROM customer_orders
UNION ALL
SELECT 'auth_audit_log', COUNT(*) FROM auth_audit_log;

-- Show table structures
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('customers', 'customer_communications', 'customer_orders', 'auth_audit_log')
ORDER BY table_name, ordinal_position
LIMIT 20;
