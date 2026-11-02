import type { SanityBlogPost } from '@/lib/sanity/client'
import postsData from './posts.json'

/**
 * The 19 articles migrated from the legacy WordPress site (jthltd.co.uk).
 *
 * They live in the repo rather than a CMS because there is no Sanity project
 * configured, and these URLs carry the old site's search traffic — they need a
 * real destination the moment jthltd.co.uk points at this app. Sanity still
 * wins when it is configured; see lib/sanity/client.ts.
 *
 * Regenerate with the migration script if the source posts ever change:
 * the content is cleaned Elementor output, so hand-editing posts.json is fine
 * for a typo but a re-import would overwrite it.
 */
const posts = postsData as unknown as SanityBlogPost[]

/** Newest first, matching the Sanity query's ordering. */
export function getLocalBlogPosts(): SanityBlogPost[] {
  return [...posts].sort((a, b) =>
    (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
  )
}

export function getLocalBlogPost(slug: string): SanityBlogPost | null {
  return posts.find((post) => post.slug.current === slug) ?? null
}

export function getLocalRelatedPosts(
  category: string,
  excludeId: string
): SanityBlogPost[] {
  return getLocalBlogPosts()
    .filter((post) => post.category === category && post._id !== excludeId)
    .slice(0, 3)
}

/** Slugs for the sitemap and for the legacy redirect map in next.config.js. */
export const localBlogSlugs = posts.map((post) => post.slug.current)
