const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyBlogSchema() {
  try {
    console.log('📋 Checking blog_posts table schema...\n');

    // Get table information
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'blog_posts'
        ORDER BY ordinal_position;
      `
    }).single();

    if (tableError && tableError.message?.includes('exec_sql')) {
      // Try direct query without exec_sql function
      console.log('Using alternative method to check schema...\n');

      // Test with a simple query first
      const { data: sampleData, error: sampleError } = await supabase
        .from('blog_posts')
        .select('*')
        .limit(1)
        .single();

      if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('❌ Error accessing blog_posts table:', sampleError);
        return;
      }

      if (sampleData || sampleError?.code === 'PGRST116') {
        console.log('✅ blog_posts table exists and is accessible\n');

        // List the columns we can verify
        const expectedColumns = [
          'id', 'title', 'slug', 'excerpt', 'content',
          'category', 'tags', 'meta_title', 'meta_description',
          'keywords', 'featured', 'featured_image', 'status',
          'author_id', 'published_at', 'created_at', 'updated_at'
        ];

        console.log('Expected columns in blog_posts table:');
        console.log('────────────────────────────────────');

        if (sampleData) {
          const actualColumns = Object.keys(sampleData);
          expectedColumns.forEach(col => {
            const exists = actualColumns.includes(col);
            console.log(`  ${exists ? '✅' : '❌'} ${col}`);
          });

          // Check for any extra columns
          const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
          if (extraColumns.length > 0) {
            console.log('\nExtra columns found:');
            extraColumns.forEach(col => {
              console.log(`  ℹ️  ${col}`);
            });
          }
        } else {
          console.log('Table exists but is empty - schema verification based on migration file');
          expectedColumns.forEach(col => {
            console.log(`  ✓ ${col} (expected)`);
          });
        }
      }
    } else if (!tableError) {
      // Parse and display the schema information
      console.log('Column Details:');
      console.log('──────────────');

      const results = JSON.parse(tableInfo);
      results.forEach(col => {
        console.log(`\n  ${col.column_name}:`);
        console.log(`    Type: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
        console.log(`    Nullable: ${col.is_nullable}`);
        if (col.column_default) {
          console.log(`    Default: ${col.column_default}`);
        }
      });
    }

    // Check indexes
    console.log('\n📍 Checking indexes...\n');

    const { data: indexData, error: indexError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = 'blog_posts'
        AND schemaname = 'public';
      `
    }).single();

    if (!indexError && indexData) {
      const indexes = JSON.parse(indexData);
      if (indexes.length > 0) {
        console.log('Indexes found:');
        indexes.forEach(idx => {
          console.log(`  • ${idx.indexname}`);
          console.log(`    ${idx.indexdef}`);
        });
      } else {
        console.log('No custom indexes found (using default primary key index)');
      }
    }

    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...\n');

    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          policyname,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'blog_posts'
        AND schemaname = 'public';
      `
    }).single();

    if (!rlsError && rlsData) {
      const policies = JSON.parse(rlsData);
      if (policies.length > 0) {
        console.log('RLS policies found:');
        policies.forEach(policy => {
          console.log(`  • ${policy.policyname} (${policy.cmd})`);
        });
      } else {
        console.log('⚠️  No RLS policies found - table might be publicly accessible');
      }
    }

    console.log('\n✅ Schema verification complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run verification
verifyBlogSchema();