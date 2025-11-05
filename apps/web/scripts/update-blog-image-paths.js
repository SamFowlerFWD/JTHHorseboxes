#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateImagePaths() {
  console.log('Updating blog post image paths...\n')

  const updates = [
    { slug: 'horsebox-payloads', new_path: '/images/blog/horsebox-payloads.jpg' },
    { slug: 'horsebox-ventilation', new_path: '/images/blog/horsebox-ventilation.jpg' },
    { slug: 'horsebox-aluminium', new_path: '/images/blog/horsebox-aluminium.jpg' },
    { slug: 'horsebox-passenger-seatbelts', new_path: '/images/blog/horsebox-seatbelts.jpg' },
    { slug: 'horsebox-safety-checks', new_path: '/images/blog/horsebox-safety-checks.jpg' },
    { slug: 'before-you-buy-a-horsebox', new_path: '/images/blog/before-you-buy-horsebox.jpg' },
    { slug: 'horsebox-air-brakes', new_path: '/images/blog/horsebox-air-brakes.jpg' },
  ]

  for (const update of updates) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ featured_image: update.new_path })
      .eq('slug', update.slug)
      .select('title, featured_image')

    if (error) {
      console.error(`❌ Error updating ${update.slug}:`, error.message)
    } else if (data && data.length > 0) {
      console.log(`✅ Updated: ${data[0].title}`)
      console.log(`   New path: ${data[0].featured_image}\n`)
    } else {
      console.log(`⚠️  No post found with slug: ${update.slug}\n`)
    }
  }

  console.log('✨ Image path updates complete!')
}

updateImagePaths().catch(console.error)
