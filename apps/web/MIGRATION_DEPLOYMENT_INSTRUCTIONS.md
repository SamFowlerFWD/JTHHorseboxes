# Migration Deployment Instructions

## Quick Deployment (Recommended)

The migration script has been fixed to handle non-existent tables properly. It can now be safely run on any database state.

### Option 1: Direct SQL Editor Deployment

1. **Open Supabase SQL Editor**
   ```
   https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new
   ```

2. **Copy the Safe Migration Script**
   - File location: `/apps/web/scripts/safe-complete-migration.sql`
   - This script includes all necessary checks and won't fail on non-existent tables

3. **Paste and Run**
   - Paste the entire script into the SQL editor
   - Click "Run" to execute
   - Check the results at the bottom - you should see validation checks

### Option 2: Using the Deployment Script

1. **Set your Supabase Service Role Key**
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```
   
   You can find this in Supabase Dashboard > Settings > API > Service Role Key

2. **Run the deployment script**
   ```bash
   cd apps/web
   npm install @supabase/supabase-js  # If not already installed
   node scripts/deploy-safe-migration.js
   ```

## What Was Fixed

### The Problem
The original migration tried to drop triggers on tables that might not exist:
```sql
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
```

In PostgreSQL, even with `IF EXISTS`, this fails if the table `customers` doesn't exist.

### The Solution
The fixed migration uses DO blocks to check table existence first:
```sql
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'customers') THEN
        DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
    END IF;
END $$;
```

## What the Migration Creates

The migration will create or update:

1. **Customer Management**
   - `customers` table - Complete customer records
   - `customer_communications` - Track all interactions
   - `customer_orders` - Order management

2. **Enhanced Inventory**
   - Additional columns for stock management
   - `inventory_changelog` - Track all inventory changes

3. **Auth & Security**
   - Enhanced `profiles` table with roles and permissions
   - `auth_audit_log` - Security audit trail
   - Helper functions: `auth.is_admin()`, `auth.user_role()`, `auth.has_permission()`

4. **Automated Features**
   - Triggers for updating timestamps
   - Customer metrics auto-calculation
   - Inventory change logging
   - New user profile creation

5. **Row Level Security**
   - Policies for all tables
   - Role-based access control
   - Admin/Manager/User permissions

## Validation

After running the migration, the script automatically runs validation checks. You should see:

```
 check_name                    | status  | details
-------------------------------|---------|-------------------------
 Customers table               | SUCCESS | Table creation check
 Customer communications table | SUCCESS | Table creation check
 Customer orders table         | SUCCESS | Table creation check
 Auth audit log table          | SUCCESS | Table creation check
 Sample customers              | SUCCESS | Sample data check
 RLS on customers              | SUCCESS | Row Level Security check
 Auth functions                | SUCCESS | Auth helper functions check
```

## Rollback Instructions

If you need to rollback the migration:

1. Open the SQL editor
2. Run the following:

```sql
-- Rollback customers and related tables
DROP TRIGGER IF EXISTS update_customer_metrics ON customer_orders CASCADE;
DROP TRIGGER IF EXISTS update_customer_orders_updated_at ON customer_orders CASCADE;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers CASCADE;
DROP FUNCTION IF EXISTS update_customer_metrics() CASCADE;
DROP FUNCTION IF EXISTS convert_lead_to_customer(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_customers(TEXT) CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS customer_communications CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Rollback inventory enhancements
DROP TABLE IF EXISTS inventory_changelog CASCADE;
DROP TRIGGER IF EXISTS log_inventory_changes ON inventory CASCADE;
DROP FUNCTION IF EXISTS log_inventory_change() CASCADE;

-- Rollback auth enhancements
DROP TABLE IF EXISTS auth_audit_log CASCADE;
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;
DROP FUNCTION IF EXISTS auth.user_role() CASCADE;
DROP FUNCTION IF EXISTS auth.has_permission(text) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Remove customer_id from quotes if it was added
ALTER TABLE quotes DROP COLUMN IF EXISTS customer_id;
```

## Troubleshooting

### If you see "permission denied" errors
- Make sure you're using the Service Role key, not the Anon key
- The Service Role key has full database access

### If tables already exist
- The migration is idempotent - it can be run multiple times safely
- It will skip creating tables that already exist
- It will add missing columns to existing tables

### If you need to check current database state
Run this query to see what tables exist:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify your Supabase Service Role key is correct
3. Try running the migration directly in the SQL editor
4. The migration is saved in `/apps/web/scripts/safe-complete-migration.sql`