#!/usr/bin/env node

/**
 * Apply Blog Posts Migration Script
 * This script applies the blog_posts table seed migration (011_seed_blog_posts.sql)
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  }
});

async function checkBlogPostsTable() {
  console.log('\n📊 Checking blog_posts table status...\n');

  try {
    // First check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (tableError && tableError.message.includes('relation "public.blog_posts" does not exist')) {
      console.log('❌ blog_posts table does not exist');
      return { exists: false, count: 0 };
    }

    // If table exists, count records
    const { data: countData, error: countError } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.log('⚠️  Error counting blog posts:', countError.message);
      return { exists: true, count: 0, error: countError };
    }

    const count = countData?.length || 0;
    console.log(`✅ blog_posts table exists with ${count} records`);
    return { exists: true, count };

  } catch (err) {
    console.log('❌ Error checking blog_posts table:', err.message);
    return { exists: false, count: 0, error: err };
  }
}

async function applyMigration() {
  console.log('\n🚀 Applying blog posts migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_seed_blog_posts.sql');
    const migrationSql = await fs.readFile(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('   Path:', migrationPath);
    console.log('   Size:', migrationSql.length, 'bytes');

    // Execute the migration via RPC (using raw SQL execution)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSql
    }).single();

    if (error) {
      // If RPC doesn't exist, try using the SQL Editor approach
      if (error.message.includes('function public.exec_sql does not exist')) {
        console.log('\n⚠️  Direct SQL execution not available via API');
        console.log('\nPlease apply the migration manually:');
        console.log('\n1. Open the Supabase SQL Editor:');
        console.log(`   ${supabaseUrl}/project/nsbybnsmhvviofzfgphb/sql/new\n`);
        console.log('2. Copy the migration file contents:');
        console.log(`   ${migrationPath}\n`);
        console.log('3. Paste into the SQL Editor and click "Run"\n');
        console.log('4. Run this script again to verify the migration\n');
        return false;
      }

      console.error('❌ Migration failed:', error.message);
      return false;
    }

    console.log('✅ Migration SQL executed successfully');
    return true;

  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying blog posts migration...\n');

  try {
    // Get all blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, status, published_at')
      .order('published_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching blog posts:', error.message);
      return false;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️  No blog posts found after migration');
      return false;
    }

    console.log(`✅ Successfully inserted ${posts.length} blog posts:\n`);

    // Display the posts
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Published: ${new Date(post.published_at).toLocaleDateString()}`);
      console.log('');
    });

    // Check categories distribution
    const categories = {};
    posts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });

    console.log('📊 Posts by category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} posts`);
    });

    return true;

  } catch (err) {
    console.error('❌ Error verifying migration:', err.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('   J TAYLOR HORSEBOXES - BLOG POSTS MIGRATION');
  console.log('='.repeat(60));

  // Check current status
  const initialStatus = await checkBlogPostsTable();

  if (initialStatus.exists && initialStatus.count > 0) {
    console.log('\n⚠️  Blog posts already exist in the database');
    console.log(`   Current count: ${initialStatus.count} posts`);

    // Still verify what we have
    await verifyMigration();

    console.log('\n💡 To re-apply the migration, you may need to:');
    console.log('   1. Delete existing posts first');
    console.log('   2. Or modify the migration to use INSERT ... ON CONFLICT');

  } else {
    // Try to apply the migration
    console.log('\n📝 Blog posts table needs seeding, attempting migration...');

    const migrationApplied = await applyMigration();

    if (migrationApplied) {
      // Verify the migration worked
      const verified = await verifyMigration();

      if (verified) {
        console.log('\n🎉 Blog posts migration completed successfully!');
      } else {
        console.log('\n⚠️  Migration may have partially succeeded, please check manually');
      }
    } else {
      // Manual migration required
      console.log('\n📋 Manual migration required - see instructions above');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('   Migration process complete');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);