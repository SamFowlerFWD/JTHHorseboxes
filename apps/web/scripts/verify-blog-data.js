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

async function verifyBlogData() {
  try {
    console.log('🔍 Verifying blog posts data integrity...\n');

    // Get all blog posts with full details
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }

    console.log(`✅ Total blog posts: ${posts.length}\n`);

    // Verify each post
    posts.forEach((post, index) => {
      console.log(`📄 Article ${index + 1}: ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Featured: ${post.featured ? 'Yes' : 'No'}`);
      console.log(`   Tags: ${post.tags ? post.tags.join(', ') : 'None'}`);
      console.log(`   Published: ${post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not set'}`);
      console.log(`   Excerpt: ${post.excerpt ? post.excerpt.substring(0, 100) + '...' : 'None'}`);
      console.log(`   Content length: ${post.content ? post.content.length + ' characters' : 'No content'}`);
      console.log(`   Meta title: ${post.meta_title ? '✓' : '✗'}`);
      console.log(`   Meta description: ${post.meta_description ? '✓' : '✗'}`);
      console.log(`   Keywords: ${post.keywords ? post.keywords.length + ' keywords' : 'None'}`);
      console.log(`   Featured image: ${post.featured_image || 'None'}`);
      console.log('');
    });

    // Data integrity checks
    console.log('📊 Data Integrity Report:');
    console.log('─────────────────────────');

    const checks = {
      'All posts have titles': posts.every(p => p.title),
      'All posts have slugs': posts.every(p => p.slug),
      'All posts have content': posts.every(p => p.content && p.content.length > 0),
      'All posts have excerpts': posts.every(p => p.excerpt),
      'All posts have categories': posts.every(p => p.category),
      'All posts have status': posts.every(p => p.status),
      'All posts have meta titles': posts.every(p => p.meta_title),
      'All posts have meta descriptions': posts.every(p => p.meta_description),
      'All published posts have dates': posts.filter(p => p.status === 'published').every(p => p.published_at),
      'Unique slugs': new Set(posts.map(p => p.slug)).size === posts.length,
    };

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });

    // Category distribution
    console.log('\n📂 Category Distribution:');
    const categories = {};
    posts.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} posts`);
    });

    // Featured posts
    const featuredPosts = posts.filter(p => p.featured);
    console.log(`\n⭐ Featured Posts: ${featuredPosts.length}`);
    featuredPosts.forEach(p => {
      console.log(`  - ${p.title}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run verification
verifyBlogData();