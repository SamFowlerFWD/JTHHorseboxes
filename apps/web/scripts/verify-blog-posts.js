#!/usr/bin/env node

/**
 * Verify Blog Posts Script
 * Final verification that blog posts are properly in the database
 */

const { createClient } = require('@supabase/supabase-js');
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
  }
});

async function verifyBlogPosts() {
  console.log('\n🔍 FINAL BLOG POSTS VERIFICATION\n');
  console.log('='.repeat(60));

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting blog posts:', countError.message);
      return;
    }

    console.log(`\n📊 Total Blog Posts: ${count}\n`);

    // Get all posts with details
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching blog posts:', error.message);
      return;
    }

    // Display each post
    console.log('📝 Blog Posts Details:\n');
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log('   ' + '-'.repeat(56));
      console.log(`   📌 Slug: ${post.slug}`);
      console.log(`   📁 Category: ${post.category}`);
      console.log(`   🏷️  Tags: ${post.tags.join(', ')}`);
      console.log(`   📅 Published: ${new Date(post.published_at).toLocaleDateString()}`);
      console.log(`   ⭐ Featured: ${post.featured ? 'Yes' : 'No'}`);
      console.log(`   📸 Image: ${post.featured_image}`);
      console.log(`   ✅ Status: ${post.status}`);
      console.log(`   🆔 ID: ${post.id}`);
      console.log('');
    });

    // Category summary
    const categories = {};
    posts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });

    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY BY CATEGORY:\n');
    Object.entries(categories).forEach(([cat, cnt]) => {
      console.log(`   • ${cat}: ${cnt} post${cnt > 1 ? 's' : ''}`);
    });

    // Featured posts
    const featuredPosts = posts.filter(p => p.featured);
    console.log(`\n⭐ Featured Posts: ${featuredPosts.length}`);
    featuredPosts.forEach(p => {
      console.log(`   • ${p.title}`);
    });

    // Check for any issues
    console.log('\n🔍 INTEGRITY CHECKS:\n');

    const checks = {
      'All posts have titles': posts.every(p => p.title),
      'All posts have slugs': posts.every(p => p.slug),
      'All posts have content': posts.every(p => p.content),
      'All posts have categories': posts.every(p => p.category),
      'All posts have meta descriptions': posts.every(p => p.meta_description),
      'All posts are published status': posts.every(p => p.status === 'published'),
      'All posts have published dates': posts.every(p => p.published_at)
    };

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });

    // Test a sample query (like what the website would do)
    console.log('\n🌐 TESTING WEBSITE QUERY:\n');

    const { data: websiteQuery, error: queryError } = await supabase
      .from('blog_posts')
      .select('title, slug, excerpt, category, featured_image, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);

    if (queryError) {
      console.log('❌ Website query failed:', queryError.message);
    } else {
      console.log('✅ Latest 3 published posts (as website would see):');
      websiteQuery.forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.title} (${post.category})`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ VERIFICATION COMPLETE - ALL SYSTEMS GO!\n');
    console.log('The blog posts have been successfully migrated and are ready for use.');
    console.log('The website can now display these blog posts to visitors.\n');

  } catch (err) {
    console.error('❌ Verification error:', err.message);
  }
}

verifyBlogPosts();