import { createClient, type SanityClient } from '@sanity/client'

function getSanityClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  if (!projectId) {
    return null
  }

  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  })
}

export interface SanityBlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  category?: string
  tags?: string[]
  featuredImage?: {
    asset: { url: string }
    alt?: string
  }
  content?: string
  body?: any[]
  publishedAt?: string
  updatedAt?: string
  featured?: boolean
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}

export async function getBlogPosts(): Promise<SanityBlogPost[]> {
  const client = getSanityClient()
  if (!client) return []

  try {
    return await client.fetch(
      `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        category,
        tags,
        "featuredImage": mainImage { asset-> { url }, alt },
        publishedAt,
        featured
      }`
    )
  } catch (error) {
    console.error('Failed to fetch blog posts from Sanity:', error)
    return []
  }
}

export async function getBlogPost(slug: string): Promise<SanityBlogPost | null> {
  const client = getSanityClient()
  if (!client) return null

  try {
    return await client.fetch(
      `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
        _id,
        title,
        slug,
        excerpt,
        category,
        tags,
        "featuredImage": mainImage { asset-> { url }, alt },
        content,
        body,
        publishedAt,
        "updatedAt": _updatedAt,
        featured,
        metaTitle,
        metaDescription,
        keywords
      }`,
      { slug }
    )
  } catch (error) {
    console.error('Failed to fetch blog post from Sanity:', error)
    return null
  }
}

export async function getRelatedPosts(category: string, excludeId: string): Promise<SanityBlogPost[]> {
  const client = getSanityClient()
  if (!client) return []

  try {
    return await client.fetch(
      `*[_type == "post" && category == $category && _id != $excludeId && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...3] {
        _id,
        title,
        slug,
        excerpt,
        category,
        "featuredImage": mainImage { asset-> { url }, alt },
        publishedAt
      }`,
      { category, excludeId }
    )
  } catch (error) {
    console.error('Failed to fetch related posts from Sanity:', error)
    return []
  }
}
