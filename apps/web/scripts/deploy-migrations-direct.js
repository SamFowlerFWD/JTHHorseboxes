#!/usr/bin/env node

/**
 * Direct SQL Migration Deployment Script
 * Executes migrations directly via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Migration files in order
const migrations = [
  '006_customers_table.sql',
  '007_customers_seed_data.sql',
  '008_enhance_profiles_auth.sql',
  '009_enhance_inventory_table.sql'
];

async function executeSQLFile(filePath) {
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    
    // Split by semicolons but preserve those within strings
    const statements = sql
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const results = [];
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Use the Supabase SQL endpoint
          const { data, error } = await supabase.rpc('exec_sql', {
            query: statement + ';'
          }).catch(err => ({ data: null, error: err }));
          
          // If RPC doesn't exist, try direct query
          if (error && error.message && error.message.includes('exec_sql')) {
            // For now, we'll need to use the Supabase dashboard
            results.push({ 
              statement: statement.substring(0, 50) + '...', 
              status: 'pending',
              note: 'Requires manual execution in Supabase SQL Editor'
            });
          } else if (error) {
            results.push({ 
              statement: statement.substring(0, 50) + '...', 
              error: error.message 
            });
          } else {
            results.push({ 
              statement: statement.substring(0, 50) + '...', 
              status: 'success' 
            });
          }
        } catch (err) {
          results.push({ 
            statement: statement.substring(0, 50) + '...', 
            error: err.message 
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    throw new Error(`Failed to read migration file: ${error.message}`);
  }
}

async function validateMigrations() {
  const validations = [];
  
  // Check if customers table exists
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id')
    .limit(1);
  
  validations.push({
    test: 'Customers Table',
    success: !customersError,
    error: customersError?.message
  });
  
  // Check if inventory table exists
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .select('id')
    .limit(1);
  
  validations.push({
    test: 'Inventory Table',
    success: !inventoryError,
    error: inventoryError?.message
  });
  
  // Check if profiles table has new columns
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, department, is_active')
    .limit(1);
  
  validations.push({
    test: 'Profiles Enhanced',
    success: !profilesError,
    error: profilesError?.message
  });
  
  // Check if auth_audit_log table exists
  const { data: auditLog, error: auditError } = await supabase
    .from('auth_audit_log')
    .select('id')
    .limit(1);
  
  validations.push({
    test: 'Auth Audit Log',
    success: !auditError,
    error: auditError?.message
  });
  
  return validations;
}

async function main() {
  console.log('\n🚀 DATABASE MIGRATION DEPLOYMENT\n');
  console.log('================================\n');
  
  // Since we can't execute SQL directly, create a combined migration file
  console.log('📝 Creating combined migration file...\n');
  
  let combinedSQL = `-- =====================================================
-- COMBINED MIGRATION SCRIPT FOR J TAYLOR HORSEBOXES
-- Generated: ${new Date().toISOString()}
-- =====================================================
-- 
-- IMPORTANT: Run this script in your Supabase SQL Editor
-- Navigate to: ${supabaseUrl}/project/nsbybnsmhvviofzfgphb/sql/new
-- 
-- This script combines all migrations in the correct order
-- =====================================================

`;
  
  for (const migration of migrations) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
    
    try {
      const sql = await fs.readFile(filePath, 'utf8');
      combinedSQL += `\n-- =====================================================\n`;
      combinedSQL += `-- MIGRATION: ${migration}\n`;
      combinedSQL += `-- =====================================================\n\n`;
      combinedSQL += sql;
      combinedSQL += `\n\n`;
      
      console.log(`✅ Added: ${migration}`);
    } catch (error) {
      console.error(`❌ Failed to read ${migration}: ${error.message}`);
    }
  }
  
  // Save combined migration
  const outputPath = path.join(__dirname, '..', 'APPLY_NOW_COMPLETE_MIGRATION.sql');
  await fs.writeFile(outputPath, combinedSQL);
  
  console.log(`\n✅ Combined migration saved to: ${outputPath}`);
  
  // Run validation
  console.log('\n🔍 Running validation tests...\n');
  const validations = await validateMigrations();
  
  let allPassed = true;
  for (const validation of validations) {
    if (validation.success) {
      console.log(`✅ ${validation.test}`);
    } else {
      console.log(`❌ ${validation.test}: ${validation.error || 'Not found'}`);
      allPassed = false;
    }
  }
  
  if (!allPassed) {
    console.log('\n⚠️  MANUAL ACTION REQUIRED\n');
    console.log('================================\n');
    console.log('The migrations have not been applied yet.\n');
    console.log('Please follow these steps:\n');
    console.log(`1. Open Supabase SQL Editor: ${supabaseUrl}/project/nsbybnsmhvviofzfgphb/sql/new`);
    console.log(`2. Copy the contents of: ${outputPath}`);
    console.log('3. Paste and execute in the SQL Editor');
    console.log('4. Run this script again to validate\n');
    
    // Also create a simpler quick setup for critical tables only
    const quickSetup = `-- QUICK SETUP: Essential tables only
-- Run this if you need to get started quickly

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure profiles table has required columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create customers table (simplified)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  total_orders INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table (simplified)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number VARCHAR(100),
  name VARCHAR(255),
  category VARCHAR(50),
  description TEXT,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  max_stock DECIMAL(10,2) DEFAULT 100,
  reorder_point DECIMAL(10,2) DEFAULT 10,
  unit VARCHAR(20) DEFAULT 'units',
  location VARCHAR(100),
  unit_cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_stock',
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Allow authenticated read" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON inventory FOR SELECT TO authenticated USING (true);

-- Insert sample data
INSERT INTO customers (name, email, phone, company, status) VALUES
('Lehel International Ltd', 'info@lehelinternational.com', '01524 851500', 'Lehel International', 'active'),
('Bloomfields Horseboxes', 'sales@bloomfields.co', '01487 831100', 'Bloomfields', 'active'),
('Private Customer', 'john.smith@email.com', '07700 900000', NULL, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (part_number, name, category, current_stock, min_stock, max_stock) VALUES
('CHK-001', 'Chassis Main Beam', 'chassis', 12, 5, 50),
('ELC-045', 'LED Tail Light Assembly', 'electrical', 3, 10, 40),
('PLB-012', 'Water Tank 100L', 'plumbing', 8, 5, 20)
ON CONFLICT DO NOTHING;

SELECT 'Quick setup complete!' as status;`;
    
    const quickSetupPath = path.join(__dirname, '..', 'supabase', 'quick-setup.sql');
    await fs.writeFile(quickSetupPath, quickSetup);
    console.log(`\n💡 Alternative: For a quick start, use: ${quickSetupPath}`);
  } else {
    console.log('\n✅ All validations passed!');
    console.log('The operations platform database is ready.');
  }
}

main().catch(console.error);