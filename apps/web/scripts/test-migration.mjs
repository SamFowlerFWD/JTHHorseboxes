import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testMigration() {
  console.log('🔍 Testing database connection and existing schema...\n');
  
  try {
    // Test 1: Check if we can query existing tables
    console.log('1️⃣ Checking existing leads table...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    if (leadsError) {
      console.log('❌ Error accessing leads table:', leadsError.message);
    } else {
      console.log('✅ Leads table exists and is accessible');
    }
    
    // Test 2: Check if profiles table exists
    console.log('\n2️⃣ Checking if profiles table exists...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      if (profilesError.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  Profiles table does not exist - needs to be created');
      } else {
        console.log('❌ Error accessing profiles table:', profilesError.message);
      }
    } else {
      console.log('✅ Profiles table already exists');
    }
    
    // Test 3: Check if builds table exists (from production_jobs)
    console.log('\n3️⃣ Checking if production_jobs or builds table exists...');
    const { data: prodJobs, error: prodJobsError } = await supabase
      .from('production_jobs')
      .select('id')
      .limit(1);
    
    if (prodJobsError) {
      if (prodJobsError.message.includes('relation "public.production_jobs" does not exist')) {
        console.log('⚠️  Production_jobs table does not exist');
      } else {
        console.log('✅ Production_jobs table exists - will be replaced with builds table');
      }
    } else {
      console.log('✅ Production_jobs table exists - will be replaced with builds table');
    }
    
    // Test 4: Check if orders table exists
    console.log('\n4️⃣ Checking if orders table exists...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (ordersError) {
      if (ordersError.message.includes('relation "public.orders" does not exist')) {
        console.log('⚠️  Orders table does not exist - needs to be created');
      } else {
        console.log('❌ Error accessing orders table:', ordersError.message);
      }
    } else {
      console.log('✅ Orders table already exists');
    }
    
    // Test 5: List all tables in the public schema
    console.log('\n5️⃣ Listing all tables in the database...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables_list', {});
    
    if (tablesError) {
      // Try alternative approach
      console.log('⚠️  Cannot list tables directly, trying alternative...');
      
      // Test known tables
      const knownTables = [
        'leads', 'blog_posts', 'pricing_options', 'knowledge_base',
        'saved_configurations', 'lead_activities', 'profiles',
        'production_jobs', 'orders', 'builds', 'contracts'
      ];
      
      console.log('\n📋 Testing known tables:');
      for (const table of knownTables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (!error) {
          console.log(`  ✅ ${table}`);
        } else if (error.message.includes('does not exist')) {
          console.log(`  ❌ ${table} (does not exist)`);
        } else {
          console.log(`  ⚠️  ${table} (error: ${error.message})`);
        }
      }
    } else {
      console.log('Tables found:', tables);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Requirements Summary');
    console.log('='.repeat(60));
    console.log(`
Based on the tests above, the migration needs to:
1. Create the profiles table (if it doesn't exist)
2. Add new columns to the leads table
3. Replace production_jobs with the comprehensive builds table
4. Create all the new operations tables (contracts, build_stages, etc.)
5. Set up proper RLS policies for all tables

⚠️  IMPORTANT: 
- The migration should be applied through the Supabase Dashboard SQL editor
- Break it into smaller chunks if needed
- Test each chunk before proceeding to the next
`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMigration();