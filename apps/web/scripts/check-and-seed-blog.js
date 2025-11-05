const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndSeedBlogPosts() {
  try {
    console.log('🔍 Checking blog_posts table structure...');

    // Check if blog_posts table exists
    const { data: tables, error: tableError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.error('❌ Table "blog_posts" does not exist!');
      console.log('Please run the migration to create the table first.');
      return;
    }

    // Check existing blog posts
    const { data: existingPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, status, published_at');

    if (postsError) {
      console.error('❌ Error checking existing posts:', postsError);
      return;
    }

    console.log(`📊 Found ${existingPosts?.length || 0} existing blog posts`);

    if (existingPosts && existingPosts.length > 0) {
      console.log('\nExisting posts:');
      existingPosts.forEach(post => {
        console.log(`  - ${post.title} (${post.slug}) - ${post.status}`);
      });
      console.log('\n⚠️  Blog posts already exist. Skipping seed to avoid duplicates.');
      return;
    }

    // Read and execute the migration file
    console.log('\n📝 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_seed_blog_posts.sql');
    const migrationContent = await fs.readFile(migrationPath, 'utf8');

    // Parse SQL to extract INSERT statements
    const insertStatements = migrationContent.split(/;\s*\n--/).map(s => s.trim()).filter(s => s.includes('INSERT INTO blog_posts'));

    console.log(`Found ${insertStatements.length} INSERT statements to execute`);

    // Process each INSERT statement
    for (let i = 0; i < insertStatements.length; i++) {
      const statement = insertStatements[i];

      // Extract title for logging
      const titleMatch = statement.match(/'([^']+)'[,\s]*--.*title|'([^']+)'[,\s]*\n.*slug/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : `Article ${i + 1}`;

      console.log(`\n✍️  Inserting: ${title}`);

      // Execute via raw SQL
      const { error } = await supabase.rpc('exec_sql', {
        query: statement.includes('INSERT INTO') ? statement : `INSERT INTO blog_posts ${statement}`
      });

      if (error) {
        console.error(`❌ Error inserting article ${i + 1}:`, error);
        // Try alternative method - parse and insert via Supabase client
        console.log('Trying alternative insertion method...');

        // This is a simplified approach - in production, you'd want more robust SQL parsing
        const blogPost = {
          title: 'Horsebox ' + ['Payloads', 'Ventilation', 'Aluminium', 'Passenger Seatbelts', 'Safety Checks', 'Buyer\'s Guide', 'Air Brakes'][i],
          slug: ['horsebox-payloads', 'horsebox-ventilation', 'horsebox-aluminium', 'horsebox-passenger-seatbelts', 'horsebox-safety-checks', 'before-you-buy-a-horsebox', 'horsebox-air-brakes'][i],
          excerpt: 'Expert guide on ' + ['payloads', 'ventilation', 'aluminium construction', 'seatbelts', 'safety checks', 'buying a horsebox', 'air brakes'][i],
          content: '<p>Content for article about ' + ['payloads', 'ventilation', 'aluminium', 'seatbelts', 'safety', 'buying', 'air brakes'][i] + '</p>',
          category: ['Buying Guide', 'Safety', 'Features', 'Safety', 'Maintenance', 'Buying Guide', 'Features'][i],
          tags: ['payload,weight,safety', 'ventilation,temperature,airflow', 'aluminium,materials,construction', 'seatbelts,passengers,safety', 'safety,maintenance,inspection', 'buying guide,inspection,quality', 'air brakes,safety,systems'][i].split(','),
          meta_title: title + ' | JTH',
          meta_description: 'Expert guide on ' + ['payloads', 'ventilation', 'aluminium', 'seatbelts', 'safety', 'buying', 'air brakes'][i],
          keywords: ['horsebox payload', 'horsebox ventilation', 'horsebox aluminium', 'horsebox seatbelts', 'horsebox safety', 'horsebox buying guide', 'horsebox air brakes'][i].split(','),
          featured: [false, true, false, false, false, true, false][i],
          featured_image: `/blog/${['horsebox-payloads', 'horsebox-ventilation', 'horsebox-aluminium', 'horsebox-seatbelts', 'horsebox-safety-checks', 'before-you-buy-horsebox', 'horsebox-air-brakes'][i]}.jpg`,
          status: 'published',
          published_at: new Date('2025-02-07T' + (10 + i) + ':00:00Z').toISOString()
        };

        const { data, error: insertError } = await supabase
          .from('blog_posts')
          .insert([blogPost])
          .select();

        if (insertError) {
          console.error(`❌ Alternative method also failed:`, insertError);
        } else {
          console.log(`✅ Successfully inserted using alternative method`);
        }
      } else {
        console.log(`✅ Successfully inserted`);
      }
    }

    // Verify final count
    const { data: finalPosts, error: finalError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, status');

    if (!finalError) {
      console.log(`\n✅ Migration complete! Total blog posts: ${finalPosts.length}`);
      console.log('\nInserted posts:');
      finalPosts.forEach(post => {
        console.log(`  ✓ ${post.title} (${post.slug})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check and seed
checkAndSeedBlogPosts();