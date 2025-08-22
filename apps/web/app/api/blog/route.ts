import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const blogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featured_image: z.string().url().optional(),
  meta_title: z.string().max(160).optional(),
  meta_description: z.string().max(320).optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published_at: z.string().datetime().optional(),
})

// Sample blog data for development/testing
const SAMPLE_BLOG_POSTS = [
  {
    id: '1',
    title: 'Choosing the Right Horsebox for Your Needs',
    slug: 'choosing-right-horsebox',
    excerpt: 'A comprehensive guide to selecting the perfect horsebox based on your requirements, budget, and horse care needs.',
    content: 'When it comes to choosing a horsebox, there are several factors to consider...',
    featured_image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a',
    meta_title: 'How to Choose the Right Horsebox | J Taylor Horseboxes',
    meta_description: 'Expert guide on selecting the perfect horsebox. Learn about size, features, and budget considerations.',
    keywords: ['horsebox', 'buying guide', 'horse transport'],
    status: 'published',
    featured: true,
    category: 'Buying Guide',
    tags: ['horseboxes', 'guide', 'tips'],
    published_at: '2024-01-15T10:00:00Z',
    author_id: 'author-1',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Essential Horsebox Maintenance Tips',
    slug: 'horsebox-maintenance-tips',
    excerpt: 'Keep your horsebox in top condition with these essential maintenance tips and regular check routines.',
    content: 'Regular maintenance is crucial for the longevity and safety of your horsebox...',
    featured_image: 'https://images.unsplash.com/photo-1561127220-6b1f0c3f137a',
    meta_title: 'Horsebox Maintenance Guide | J Taylor Horseboxes',
    meta_description: 'Essential maintenance tips to keep your horsebox in perfect condition. Regular checks and servicing guide.',
    keywords: ['maintenance', 'horsebox care', 'servicing'],
    status: 'published',
    featured: false,
    category: 'Maintenance',
    tags: ['maintenance', 'care', 'tips'],
    published_at: '2024-01-20T14:30:00Z',
    author_id: 'author-1',
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    title: 'New 3.5t Model Launch: Pioneer Edition',
    slug: 'new-35t-pioneer-edition',
    excerpt: 'Introducing our latest 3.5t Pioneer Edition with enhanced features and exceptional value.',
    content: 'We are excited to announce the launch of our new 3.5t Pioneer Edition horsebox...',
    featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    meta_title: 'New 3.5t Pioneer Edition Horsebox | J Taylor',
    meta_description: 'Discover our new 3.5t Pioneer Edition horsebox with premium features at an exceptional price.',
    keywords: ['3.5t', 'pioneer', 'new model'],
    status: 'published',
    featured: true,
    category: 'News',
    tags: ['launch', 'pioneer', '3.5t'],
    published_at: '2024-02-01T09:00:00Z',
    author_id: 'author-2',
    created_at: '2024-01-28T10:00:00Z',
    updated_at: '2024-02-01T09:00:00Z'
  }
]

// GET /api/blog - Get blog posts (public for published, admin for all)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // For development, check for a simple admin token
    const authHeader = request.headers.get('authorization')
    const isAdmin = authHeader === 'Bearer admin-token'
    
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Filter posts based on parameters
    let posts = [...SAMPLE_BLOG_POSTS]
    
    // If not admin, only show published posts
    if (!isAdmin) {
      posts = posts.filter(post => post.status === 'published')
    } else if (status) {
      posts = posts.filter(post => post.status === status)
    }

    if (category) {
      posts = posts.filter(post => post.category.toLowerCase() === category.toLowerCase())
    }

    if (featured === 'true') {
      posts = posts.filter(post => post.featured === true)
    }

    // Apply pagination
    const total = posts.length
    const offset = (page - 1) * limit
    const paginatedPosts = posts.slice(offset, offset + limit)

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/blog:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/blog - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = blogPostSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const postData = {
      ...validationResult.data,
      author_id: user.id,
      published_at: validationResult.data.status === 'published' 
        ? validationResult.data.published_at || new Date().toISOString()
        : null
    }

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postData.slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/blog:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}