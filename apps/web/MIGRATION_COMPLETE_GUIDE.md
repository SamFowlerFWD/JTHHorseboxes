# Complete Database Migration & Testing Guide

## 🚀 Quick Start

### Option 1: Apply Complete Migration (5 minutes)

1. **Open Supabase SQL Editor**
   ```
   https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new
   ```

2. **Copy & Execute Migration**
   - Open: `apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql`
   - Copy entire contents
   - Paste in SQL Editor
   - Click "Run"

3. **Verify Success**
   ```bash
   npm run validate:db
   ```

### Option 2: Run Without Database (Instant)

The application automatically uses mock data when tables are missing:

```bash
npm run dev
# Navigate to http://localhost:3000/ops
```

## 📊 Database Validation

### Check Current Status

```bash
# Run validation script
npm run validate:db
```

This will show:
- ✅ Tables that exist
- ❌ Missing required tables
- ⚠️ Missing optional tables
- Database connection status

### Expected Output

```
═══════════════════════════════════════════════════════
       DATABASE VALIDATION REPORT
═══════════════════════════════════════════════════════

▶ Checking Tables
───────────────────────────────────────────────────────
✅ inventory                   Inventory management table
❌ customers                   Customer management table
❌ auth_audit_log              Authentication audit logging
⚠️ customer_communications    Customer communication tracking

▶ Checking Functions
───────────────────────────────────────────────────────
⚠️ convert_lead_to_customer    Converts a lead to a customer
⚠️ search_customers            Full-text search for customers
```

## 🧪 Testing Suite

### Run Comprehensive Tests

```bash
# Full operations platform validation
npm run test:ops

# Interactive test UI
npm run test:ui

# All tests
npm run test
```

### Test Coverage

The test suite validates:

1. **Authentication Flow**
   - Login page accessibility
   - Error handling
   - Session management

2. **API Endpoints**
   - Customer API with fallback
   - Inventory API with fallback
   - Authentication checks

3. **Error Pages**
   - Unauthorized access
   - Locked accounts
   - Inactive accounts

4. **Main Site**
   - Homepage loading
   - Model pages
   - Configurator

## 🔧 Manual Migration (If Automated Fails)

### Step 1: Customers Table

```sql
-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_county VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United Kingdom',
    status VARCHAR(50) DEFAULT 'active',
    customer_type VARCHAR(50) DEFAULT 'individual',
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0.00,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can view customers" ON customers
    FOR SELECT
    TO authenticated
    USING (true);
```

### Step 2: Enhanced Profiles

```sql
-- Add missing columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
```

### Step 3: Auth Audit Log

```sql
-- Create audit log table
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Permission denied" Error
```bash
# Ensure you have the service role key
# Check .env.local:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 2. "Table already exists" Error
```sql
-- This is OK - table was already created
-- Continue with next migration
```

#### 3. Authentication Not Working
```bash
# Check Supabase Auth settings
# Ensure profiles table exists
# Verify RLS policies
```

#### 4. Mock Data Not Loading
```bash
# API routes automatically fall back to mock data
# Check browser console for errors
# Verify API routes are accessible
```

## 📝 Environment Setup

### Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://nsbybnsmhvviofzfgphb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional but recommended
```

### Verify Connection

```bash
# Test database connection
npm run validate:db

# Check API health
curl http://localhost:3000/api/health
```

## 🎯 Fallback Mode Features

When database tables are missing:

### ✅ Available
- Full UI functionality
- Mock customer data (12 samples)
- Mock inventory data (10 items)
- Search and filtering
- Read operations
- UI component testing

### ❌ Limited
- No data persistence
- No authentication
- No audit logging
- Read-only operations

## 📊 API Endpoints

All endpoints automatically fall back to mock data:

### Customer API
```bash
GET /api/ops/customers
POST /api/ops/customers (limited in fallback)
```

### Inventory API
```bash
GET /api/ops/inventory
POST /api/ops/inventory (limited in fallback)
```

### Auth Check
```bash
GET /api/auth/check
```

## 🔐 Security Notes

1. **Never commit credentials**
   - Use environment variables
   - Add `.env.local` to `.gitignore`

2. **RLS Policies**
   - All tables have Row Level Security
   - Policies restrict access by role

3. **Account Protection**
   - Lockout after 5 failed attempts
   - 30-minute lock period
   - Audit logging for security events

## 📚 Next Steps

After successful setup:

1. **Create Admin User**
   - Sign up in Supabase Auth
   - Update profile role to 'admin'

2. **Test Operations Platform**
   ```bash
   npm run dev
   # Navigate to /ops
   ```

3. **Run Full Test Suite**
   ```bash
   npm run test:ops
   ```

4. **Monitor Database**
   - Check Supabase dashboard
   - Review logs for errors
   - Monitor performance

## 💡 Tips

- The app works without a database (uses mock data)
- Migrations can be applied incrementally
- Test in development before production
- Use validation script to verify status
- Check browser console for detailed errors

## 📞 Support

If you encounter issues:

1. Run validation: `npm run validate:db`
2. Check test results: `npm run test:ops`
3. Review browser console (F12)
4. Check Supabase logs
5. Contact: support@jtaylorhorseboxes.com

## ✅ Success Criteria

Your setup is complete when:

1. `npm run validate:db` shows all required tables ✅
2. `/ops` loads without errors
3. API endpoints return data (mock or real)
4. Tests pass: `npm run test:ops`

---

**Remember:** The application is designed to work with or without a fully configured database. Choose the approach that fits your needs!