import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateBlogPostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  featured_image: z.string().url().optional().nullable(),
  meta_title: z.string().max(160).optional(),
  meta_description: z.string().max(320).optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published_at: z.string().datetime().optional(),
})

// GET /api/blog/[slug] - Get a single blog post (public for published, admin for all)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = !!user

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .single()

    // If not admin, only show published posts
    if (!isAdmin) {
      query = supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()
    }

    const { data: post, error } = await query

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      console.error('Error fetching blog post:', error)
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in GET /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/blog/[slug] - Update a blog post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = updateBlogPostSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // If changing slug, check if new slug already exists
    if (updateData.slug && updateData.slug !== params.slug) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', updateData.slug)
        .single()

      if (existingPost) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update published_at if status is changing to published
    if (updateData.status === 'published') {
      const { data: currentPost } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('slug', params.slug)
        .single()

      if (!currentPost?.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('slug', params.slug)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in PATCH /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/blog/[slug] - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', params.slug)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}