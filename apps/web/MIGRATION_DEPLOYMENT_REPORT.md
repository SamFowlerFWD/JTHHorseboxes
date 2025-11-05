# JTH Operations Platform - Database Migration Deployment Report

## Overview
This report provides comprehensive instructions and validation steps for deploying the J Taylor Horseboxes operations platform database migrations.

## Migration Files

The following migrations need to be deployed in sequence:

1. **006_customers_table.sql** - Creates comprehensive customers table with relationships
2. **007_customers_seed_data.sql** - Seeds sample customer data
3. **008_enhance_profiles_auth.sql** - Enhances authentication with missing fields
4. **009_enhance_inventory_table.sql** - Completes inventory management system

## Deployment Methods

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Access Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to SQL Editor

2. **Deploy Main Migration Script**
   - Open `/apps/web/scripts/deploy-migrations.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify Deployment**
   - Open `/apps/web/scripts/validate-migrations.sql`
   - Copy and run in SQL Editor
   - Review the output for any errors

### Method 2: Using Node.js Script

1. **Set Environment Variables**
   ```bash
   # In .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run Deployment Script**
   ```bash
   cd apps/web
   node scripts/deploy-and-validate-migrations.js
   ```

3. **Review Output**
   - Check console for deployment status
   - Review generated `migration-report-*.json` file

### Method 3: Manual Deployment

Deploy each migration file individually in the Supabase SQL Editor:

1. Deploy `006_customers_table.sql`
2. Deploy `007_customers_seed_data.sql`
3. Deploy `008_enhance_profiles_auth.sql`
4. Deploy `009_enhance_inventory_table.sql`

## Validation Checklist

### Tables Created
- [ ] `customers` table with all columns
- [ ] `customer_communications` table
- [ ] `customer_orders` table
- [ ] `auth_audit_log` table
- [ ] `inventory_movements` table

### Enhanced Tables
- [ ] `profiles` table has new auth columns:
  - department
  - is_active
  - locked_until
  - failed_login_attempts
  - last_login_at
  - last_activity_at
- [ ] `inventory` table has new columns:
  - part_number
  - name
  - min_stock
  - max_stock
  - current_stock
  - last_restocked
  - status

### Functions Created
- [ ] `handle_failed_login()`
- [ ] `handle_user_login()`
- [ ] `is_account_locked()`
- [ ] `adjust_inventory_stock()`
- [ ] `search_customers()`
- [ ] `convert_lead_to_customer()`
- [ ] `update_inventory_status()`
- [ ] `update_customer_metrics()`

### Indexes Created
- [ ] Customer search indexes
- [ ] Inventory status indexes
- [ ] Profile authentication indexes
- [ ] Audit log indexes

### RLS Policies
- [ ] Customers table RLS enabled
- [ ] Customer communications RLS enabled
- [ ] Customer orders RLS enabled
- [ ] Auth audit log RLS enabled
- [ ] Inventory movements RLS enabled
- [ ] Profiles table RLS policies updated

### Triggers Active
- [ ] `update_customers_updated_at`
- [ ] `update_customer_orders_updated_at`
- [ ] `update_customer_metrics`
- [ ] `update_inventory_status_trigger`

## Test Queries

Run these queries to verify functionality:

### Test Customer Search
```sql
SELECT * FROM search_customers('Thompson');
```

### Test Inventory Status
```sql
SELECT status, COUNT(*) as count 
FROM inventory 
GROUP BY status;
```

### Test Authentication Functions
```sql
-- Test failed login tracking (replace email)
SELECT handle_failed_login('test@example.com', '192.168.1.1'::INET);

-- Check if account is locked (replace UUID)
SELECT is_account_locked('user-uuid-here');
```

### Test Inventory Adjustment
```sql
-- Adjust inventory stock (replace UUID)
SELECT adjust_inventory_stock(
  'inventory-item-uuid',
  5.0,
  'Test adjustment',
  auth.uid()
);
```

## Data Verification

### Customer Data
```sql
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'prospect' THEN 1 END) as prospects
FROM customers;
```

Expected results:
- Total customers: >= 3
- Active customers: >= 2
- Prospects: >= 1

### Inventory Data
```sql
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical,
  COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock
FROM inventory;
```

Expected results:
- Total items: >= 3
- Critical items: varies
- Out of stock: varies

## Known Issues and Solutions

### Issue 1: RPC function not found
**Solution**: Use the SQL script directly in Supabase SQL Editor instead of the Node.js script.

### Issue 2: Tables already exist
**Solution**: The migrations are idempotent and use `CREATE TABLE IF NOT EXISTS`. They can be run multiple times safely.

### Issue 3: Foreign key constraints fail
**Solution**: The migrations handle missing dependencies gracefully. Ensure the `profiles` table exists before running migrations.

### Issue 4: RLS policies conflict
**Solution**: The migrations drop existing policies before creating new ones to avoid conflicts.

## Post-Deployment Steps

1. **Create Admin User**
   ```sql
   -- After creating user in Supabase Auth, update their profile
   UPDATE profiles 
   SET 
     role = 'admin',
     department = 'Management',
     is_active = true
   WHERE email = 'admin@jtaylorhorseboxes.com';
   ```

2. **Test Login Flow**
   - Navigate to `/ops/login`
   - Test authentication with different roles
   - Verify account locking after 5 failed attempts

3. **Verify Operations Platform**
   - Check Customers tab displays data
   - Check Inventory tab shows stock levels
   - Test search functionality
   - Verify RLS policies by logging in with different roles

4. **Monitor Performance**
   ```sql
   -- Check query performance
   EXPLAIN ANALYZE 
   SELECT * FROM search_customers('test');
   
   -- Check index usage
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan DESC;
   ```

## Rollback Procedure

If issues occur, you can rollback the migrations:

```sql
-- Rollback customers migration
DROP TRIGGER IF EXISTS update_customer_metrics ON customer_orders;
DROP TRIGGER IF EXISTS update_customer_orders_updated_at ON customer_orders;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP FUNCTION IF EXISTS update_customer_metrics() CASCADE;
DROP FUNCTION IF EXISTS convert_lead_to_customer(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_customers(TEXT) CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS customer_communications CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
ALTER TABLE quotes DROP COLUMN IF EXISTS customer_id;

-- Rollback auth enhancements
DROP FUNCTION IF EXISTS handle_failed_login CASCADE;
DROP FUNCTION IF EXISTS handle_user_login CASCADE;
DROP FUNCTION IF EXISTS is_account_locked CASCADE;
DROP TABLE IF EXISTS auth_audit_log CASCADE;
-- Note: Don't drop profile columns as they may contain data

-- Rollback inventory enhancements
DROP TRIGGER IF EXISTS update_inventory_status_trigger ON inventory;
DROP FUNCTION IF EXISTS update_inventory_status() CASCADE;
DROP FUNCTION IF EXISTS adjust_inventory_stock CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
-- Note: Don't drop inventory columns as they may contain data
```

## Success Criteria

The deployment is considered successful when:

1. ✅ All 4 migrations deployed without errors
2. ✅ All validation queries return expected results
3. ✅ All functions execute without errors
4. ✅ Sample data is present in customers and inventory tables
5. ✅ RLS policies are active and working
6. ✅ Operations platform loads without errors
7. ✅ Authentication flow works correctly
8. ✅ Search and filter functions work

## Support and Troubleshooting

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure you're using the service role key for admin operations
4. Check that the profiles table exists before running migrations
5. Review the migration-report-*.json file for detailed error information

## Conclusion

These migrations establish a robust foundation for the J Taylor Horseboxes operations platform with:

- Comprehensive customer relationship management
- Advanced inventory tracking with automatic status updates
- Enhanced authentication with account locking and audit logging
- Full-text search capabilities
- Row-level security for data protection
- Optimized indexes for performance

The system is designed to be maintainable, scalable, and secure, following PostgreSQL and Supabase best practices.