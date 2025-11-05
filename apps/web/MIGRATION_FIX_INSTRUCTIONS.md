# Database Migration Fix Instructions

## Problem Identified

The original migration file (`APPLY_NOW_COMPLETE_MIGRATION.sql`) failed because it tried to create foreign key relationships to tables that don't exist yet:

- ❌ `customers.lead_id` → references `leads(id)` (table doesn't exist)
- ❌ `customer_orders.quote_id` → references `quotes(id)` (table doesn't exist)
- ❌ `ALTER TABLE quotes` → table doesn't exist to alter

**Error**: `relation "quotes" does not exist`

## Solution: 3-Step Migration Process

### Step 1: Check Current Database State (2 minutes)

**Open Supabase SQL Editor:**
```
https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new
```

**Copy and run this SQL:**
```sql
File: CHECK_DATABASE_TABLES.sql
```

This will show you:
- ✅ What tables currently exist
- ❌ What tables are missing
- Helps you understand the current state

### Step 2: Apply Safe Migration (5 minutes)

**Use the safe migration file that has NO external dependencies:**

**File:** `SAFE_MIGRATION_NO_DEPENDENCIES.sql`

**What it creates:**
- ✅ `customers` table (WITHOUT foreign keys to leads/quotes)
- ✅ `customer_communications` table
- ✅ `customer_orders` table (WITHOUT foreign key to quotes)
- ✅ `auth_audit_log` table
- ✅ Enhances `profiles` table (if it exists)
- ✅ All indexes for performance
- ✅ All RLS policies for security
- ✅ Utility functions (search_customers)

**In Supabase SQL Editor:**
1. Copy entire contents of `SAFE_MIGRATION_NO_DEPENDENCIES.sql`
2. Paste into SQL Editor
3. Click "Run"
4. Wait for success message

**Expected Result:**
```
Migration completed successfully!
Tables created: customers, customer_communications, customer_orders, auth_audit_log
RLS policies enabled
Indexes created for performance
```

### Step 3: Verify & Test (3 minutes)

**Test your application:**
```bash
# From your terminal
cd /Users/samfowler/JTH-New/apps/web

# Validate database connection
pnpm validate:db

# Start development server
pnpm dev
```

**Visit operations platform:**
```
http://localhost:3000/ops
```

**Check API endpoints:**
```bash
# Test customers API (should now use real database)
curl http://localhost:3000/api/ops/customers

# Should see real data or empty array (not mock data)
```

## What About Foreign Keys to leads/quotes?

### Option A: Add Foreign Keys Later (Recommended)

When you create `leads` and `quotes` tables in the future, add the foreign keys:

```sql
-- After creating leads table
ALTER TABLE customers
ADD CONSTRAINT fk_customers_lead
FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

-- After creating quotes table
ALTER TABLE customer_orders
ADD CONSTRAINT fk_orders_quote
FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;
```

### Option B: Create leads/quotes Tables First

If you have migrations for `leads` and `quotes` tables, run those FIRST, then re-run the customers migration.

## Troubleshooting

### Issue: "Table already exists"

If you see errors about tables existing:

**Option 1 - Safe:** Skip the migration if tables are already there
```sql
CREATE TABLE IF NOT EXISTS customers (...);
```
(Already in the safe migration file)

**Option 2 - Fresh Start:** Drop and recreate
```sql
DROP TABLE IF EXISTS customer_communications CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
-- Then re-run migration
```

### Issue: "Permission denied"

Check your `.env.local` has the service role key:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Issue: "Profiles table doesn't exist"

The safe migration handles this gracefully:
```sql
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN
        -- Add columns
    END IF;
END $$;
```

If profiles doesn't exist, that part is skipped (no error).

## Sample Data (Optional)

The safe migration includes commented-out sample data. To add test customers:

1. Open `SAFE_MIGRATION_NO_DEPENDENCIES.sql`
2. Scroll to bottom
3. Uncomment the INSERT statements (remove `/*` and `*/`)
4. Re-run the migration

This adds 5 sample customers for testing.

## Migration Files Summary

| File | Purpose | Use When |
|------|---------|----------|
| `CHECK_DATABASE_TABLES.sql` | Check current state | Run FIRST to see what exists |
| `SAFE_MIGRATION_NO_DEPENDENCIES.sql` | Create core tables | Run when quotes/leads don't exist |
| `APPLY_NOW_COMPLETE_MIGRATION.sql` | Original (has errors) | ❌ Don't use - has dependencies |

## Success Criteria

✅ Migration runs without errors
✅ `pnpm validate:db` shows customers table exists
✅ `/api/ops/customers` returns data (not mock)
✅ Operations platform loads without errors
✅ Can create/view customers in the UI

## Next Steps After Successful Migration

1. **Create admin user:**
   - Sign up via Supabase Auth
   - Update profile role to 'admin'

2. **Test operations platform:**
   ```bash
   pnpm dev
   # Navigate to http://localhost:3000/ops
   ```

3. **Run full test suite:**
   ```bash
   pnpm test:ops
   ```

4. **Deploy to production:**
   - Commit changes
   - Deploy to VPS
   - Run migration on production database

## Questions?

- Check migration logs in Supabase dashboard
- Review browser console for errors (F12)
- Run `pnpm validate:db` for detailed status
- Check this guide's troubleshooting section

---

**Ready to proceed?**

1. Run `CHECK_DATABASE_TABLES.sql` first
2. Then run `SAFE_MIGRATION_NO_DEPENDENCIES.sql`
3. Test with `pnpm validate:db`
4. Start your app with `pnpm dev`

Good luck! 🚀
