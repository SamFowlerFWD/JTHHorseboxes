# Customers Table Migration Guide

## Overview
This migration creates a comprehensive customers table for the J Taylor Horseboxes operations platform, replacing the mock data with a proper database-backed solution.

## Migration Files
1. **006_customers_table.sql** - Main table structure, indexes, and RLS policies
2. **007_customers_seed_data.sql** - Initial seed data (converted from mock data)

## Features Implemented

### Core Customer Table
- Complete customer information management
- Address tracking for deliveries
- Business classification (individual, business, dealer)
- Customer acquisition source tracking
- Financial metrics (orders, value, average)
- Flexible tagging system
- Customer service notes

### Related Tables
- **customer_communications** - Track all customer interactions
- **customer_orders** - Order history (placeholder for future implementation)

### Database Features
- Full-text search on customer names, company, and email
- Automatic metrics calculation via triggers
- Lead-to-customer conversion function
- Comprehensive Row Level Security policies
- Optimized indexes for performance

### Integration Points
- Links with existing `leads` table for conversion tracking
- Links with existing `quotes` table for quote management
- Future integration with builds and inventory systems

## How to Apply Migrations

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `006_customers_table.sql`
4. Paste and run the migration
5. Copy the contents of `007_customers_seed_data.sql`
6. Paste and run to add seed data

### Option 2: Via Supabase CLI
```bash
# From the project root
cd apps/web

# Apply the customers table migration
supabase db push --file supabase/migrations/006_customers_table.sql

# Apply the seed data
supabase db push --file supabase/migrations/007_customers_seed_data.sql
```

### Option 3: Direct PostgreSQL Connection
```bash
# Connect to your database
psql postgresql://[connection-string]

# Run migrations
\i supabase/migrations/006_customers_table.sql
\i supabase/migrations/007_customers_seed_data.sql
```

## Verification

After applying the migrations, verify everything is working:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'customer_communications', 'customer_orders');

-- Check customer count
SELECT COUNT(*) as total_customers FROM customers;

-- Check customer distribution
SELECT status, COUNT(*) FROM customers GROUP BY status;

-- Test search function
SELECT * FROM search_customers('Thompson');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('customers', 'customer_communications', 'customer_orders');
```

## Application Changes Required

### 1. Update Frontend Types
The migration includes a TypeScript types file at `lib/types/customer.ts` with:
- Customer interface matching the database schema
- Helper functions for mapping between database and frontend formats
- Type-safe field definitions

### 2. API Route Updates
The `app/api/ops/customers/route.ts` has been updated to:
- Use real database queries instead of mock data
- Support filtering by status and type
- Implement search functionality
- Handle customer creation, updates, and deletion
- Support communication tracking
- Enable lead-to-customer conversion

### 3. Frontend Component Updates
The existing `app/ops/customers/page.tsx` should work without changes as it already uses the correct field names. The API will automatically map between database snake_case and frontend camelCase.

## Rollback Instructions

If you need to rollback the migration:

```sql
-- Rollback script
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
```

## Security Considerations

### Row Level Security
- Authenticated users can view and manage all customers
- Admins have full access via `auth.is_admin()` function
- All tables have RLS enabled by default

### Data Validation
- Email format validation at database level
- Phone number format validation
- Status and type enums enforced
- Required fields enforced with NOT NULL constraints

## Performance Optimization

### Indexes Created
- Email (unique index for fast lookups)
- Status and type (for filtering)
- Created date (for sorting)
- Full-text search index (for name/company search)
- Foreign key indexes (for joins)

### Query Performance
- Use the `search_customers` function for text searches
- Filters are applied at database level for efficiency
- Pagination should be added for large datasets

## Future Enhancements

### Planned Features
1. Customer segmentation and grouping
2. Automated email campaigns
3. Customer portal with self-service
4. Integration with accounting systems
5. Advanced analytics and reporting

### API Endpoints to Add
- `/api/ops/customers/[id]` - Individual customer operations
- `/api/ops/customers/export` - Data export functionality
- `/api/ops/customers/import` - Bulk import from CSV
- `/api/ops/customers/merge` - Duplicate management

## Support

For issues or questions about this migration:
1. Check the migration logs in Supabase dashboard
2. Verify RLS policies are not blocking access
3. Ensure the auth.is_admin() function exists
4. Check that UUID extension is enabled

## Migration Status Checklist

- [x] Create customers table structure
- [x] Add indexes for performance
- [x] Implement RLS policies
- [x] Create helper functions
- [x] Add seed data migration
- [x] Update API routes
- [x] Create TypeScript types
- [x] Document migration process
- [ ] Apply to production database
- [ ] Verify in production environment