# Remaining Tables Migration Guide

## Overview

This migration creates the **complete operations platform database** for J Taylor Horseboxes.

**File:** `REMAINING_TABLES_MIGRATION.sql`

## What This Migration Creates

### 📋 New Tables (7 tables)

1. **`profiles`** - User profiles and authentication
   - Roles: admin, sales, manager, viewer, user
   - Account lockout tracking
   - Login history

2. **`leads`** - Lead management system
   - Full contact information
   - Lead qualification and scoring
   - Source tracking (UTM, campaigns)
   - Budget and timeline tracking
   - Assignment and follow-up scheduling

3. **`lead_activities`** - Lead interaction tracking
   - Emails, calls, meetings, notes
   - Status changes history
   - Follow-up scheduling

4. **`quotes`** - Quote generation and management
   - Full pricing breakdown (base, options, VAT)
   - Finance calculations (if applicable)
   - Configuration from 2D configurator
   - PDF generation tracking
   - Quote versioning (revisions)
   - Status tracking (draft → sent → viewed → accepted/rejected)

5. **`quote_items`** - Itemized quote line items
   - Individual options and extras
   - Categorized breakdown
   - Quantity and pricing per item

6. **`inventory`** - Horsebox and parts inventory
   - Stock tracking with reservations
   - Available quantity (auto-calculated)
   - Horsebox-specific fields (registration, chassis, year)
   - Parts and accessories
   - Location tracking
   - Reorder level management

7. **`inventory_movements`** - Stock movement audit trail
   - All stock changes logged
   - Purchase, sales, adjustments, transfers
   - Quantity before/after tracking
   - Reference to orders/quotes/builds

### 🔗 Relationships Added

**Now that `leads` and `quotes` tables exist:**

- ✅ `customers.lead_id` → `leads.id` (foreign key added)
- ✅ `customer_orders.quote_id` → `quotes.id` (foreign key added)

This completes the data model relationships!

## What You Get

### ✨ Complete Operations Platform Features

1. **Lead Management**
   - Capture leads from website, phone, events
   - Track UTM campaigns and source
   - Qualify and score leads
   - Assign to sales team
   - Schedule follow-ups
   - Convert leads to customers

2. **Quote System**
   - Generate quotes from configurator
   - Itemized pricing breakdown
   - VAT calculations
   - Finance options
   - Quote versioning (revisions)
   - PDF generation
   - Track views and acceptances
   - Expiry management

3. **Inventory Management**
   - Track horseboxes in stock
   - Parts and accessories
   - Reserve stock for quotes/orders
   - Location tracking
   - Reorder level alerts
   - Stock movement history
   - Multi-location support

4. **Full CRM Integration**
   - Lead → Quote → Customer → Order flow
   - Activity tracking across all stages
   - Assignment and team management
   - Reporting and analytics ready

### 🚀 Performance Features

- **45+ indexes** for fast queries
- **Full-text search** on leads, inventory, customers
- **Generated columns** (available_quantity auto-calculated)
- **Optimized for 10,000+ records** per table

### 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **Audit trails** for all stock movements
- **Role-based access** via profiles
- **Account lockout** after failed login attempts

### 🛠️ Utility Functions

1. **`adjust_inventory_stock()`** - Safely adjust stock levels with audit trail
2. **`convert_lead_to_customer()`** - Convert won leads to customers automatically

## How to Apply This Migration

### Step 1: Backup (Recommended)

Take a snapshot of your database first:
- Go to Supabase Dashboard → Settings → Database
- Click "Create backup"

### Step 2: Apply Migration

**Open Supabase SQL Editor:**
```
https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new
```

**Copy and run:**
```
REMAINING_TABLES_MIGRATION.sql
```

**Expected time:** 30-60 seconds

### Step 3: Verify Success

Run this verification query:

```sql
SELECT
    'profiles' AS table_name, COUNT(*) AS row_count FROM profiles
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'lead_activities', COUNT(*) FROM lead_activities
UNION ALL
SELECT 'quotes', COUNT(*) FROM quotes
UNION ALL
SELECT 'quote_items', COUNT(*) FROM quote_items
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'inventory_movements', COUNT(*) FROM inventory_movements;
```

Should show all tables with 0 rows (empty but created).

### Step 4: Test Application

```bash
# Stop current server (Ctrl+C)
# Restart to reload with new tables
pnpm dev
```

Visit: `http://localhost:3000/ops`

## Sample Data (Optional)

Want to add test data? Run these in SQL Editor:

### Sample Lead
```sql
INSERT INTO leads (first_name, last_name, email, phone, status, stage, source, horsebox_type, budget_min, budget_max)
VALUES ('Emma', 'Thompson', 'emma@example.com', '+44 7700 900111', 'new', 'inquiry', 'website', '4.5t', 80000, 120000);
```

### Sample Quote
```sql
INSERT INTO quotes (
    quote_number,
    customer_name,
    customer_email,
    horsebox_model,
    horsebox_type,
    base_price,
    subtotal,
    vat_rate,
    vat_amount,
    total_amount,
    net_total,
    status
) VALUES (
    'Q-2025-001',
    'John Smith',
    'john@example.com',
    'JTH Professional 4.5T',
    '4.5t',
    95000.00,
    95000.00,
    20.00,
    19000.00,
    114000.00,
    95000.00,
    'draft'
);
```

### Sample Inventory Item
```sql
INSERT INTO inventory (
    sku,
    name,
    description,
    category,
    horsebox_type,
    model,
    status,
    stock_quantity,
    sale_price
) VALUES (
    'JTH-PRO-45-001',
    'JTH Professional 4.5T',
    'Professional specification horsebox, 4.5 tonne',
    'horsebox',
    '4.5t',
    'Professional',
    'available',
    3,
    95000.00
);
```

## Database Schema Complete! 🎉

After this migration, you'll have:

| Table | Purpose | Records |
|-------|---------|---------|
| ✅ profiles | User management | Ready |
| ✅ customers | Customer database | Ready |
| ✅ leads | Lead tracking | Ready |
| ✅ lead_activities | Lead interactions | Ready |
| ✅ quotes | Quote management | Ready |
| ✅ quote_items | Quote line items | Ready |
| ✅ inventory | Stock management | Ready |
| ✅ inventory_movements | Stock audit | Ready |
| ✅ customer_communications | CRM tracking | Ready |
| ✅ customer_orders | Order management | Ready |
| ✅ auth_audit_log | Security audit | Ready |

**Total: 11 tables** covering the entire operations platform!

## Using the New Features

### Lead Management
```typescript
// Create a lead (API endpoint exists)
POST /api/ops/leads
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  source: 'website',
  horseboxType: '4.5t'
}

// Convert lead to customer
SELECT convert_lead_to_customer('lead-uuid-here');
```

### Quote Generation
```typescript
// Create quote from configurator
POST /api/ops/quotes
{
  customerName: 'John Doe',
  horseboxModel: 'JTH Professional 4.5T',
  configuration: { /* configurator state */ },
  basePrice: 95000,
  vatRate: 20
}
```

### Inventory Tracking
```typescript
// Adjust stock
SELECT adjust_inventory_stock(
  'inventory-uuid',
  -1,  -- reduce by 1
  'sale',
  'Sold to customer',
  'order',
  'order-uuid'
);

// Check available stock
SELECT name, available_quantity
FROM inventory
WHERE status = 'available';
```

## Next Steps

1. **Create Admin User** (if not done yet)
   ```sql
   -- After signup via Supabase Auth UI
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@jth.com'),
     'admin@jth.com',
     'Admin User',
     'admin'
   );
   ```

2. **Test All API Endpoints**
   ```bash
   # After logging in
   curl http://localhost:3000/api/ops/leads
   curl http://localhost:3000/api/ops/quotes
   curl http://localhost:3000/api/ops/inventory
   ```

3. **Add Sample Data** (use queries above)

4. **Deploy to Production**
   - Run migration on production database
   - Test all features
   - Go live! 🚀

## Troubleshooting

### "Function already exists"
This is OK - the migration uses `CREATE OR REPLACE` so it's safe to re-run.

### "Relation already exists"
Tables were created successfully. If you need to start fresh:
```sql
-- CAREFUL: This drops all data
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS lead_activities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
-- Then re-run migration
```

### "Foreign key violation"
The migration handles this - it adds foreign keys AFTER creating all tables.

## Summary

✅ **All tables created**
✅ **All relationships connected**
✅ **Security enabled (RLS)**
✅ **Performance optimized (indexes)**
✅ **Utility functions ready**

**Your operations platform is now complete!** 🎉

You have a production-ready database for:
- Lead management
- Quote generation
- Customer relationship management
- Inventory tracking
- Order processing
- Complete audit trails

Ready to apply? Open Supabase SQL Editor and run `REMAINING_TABLES_MIGRATION.sql`! 🚀
