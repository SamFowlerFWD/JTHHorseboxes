import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'
import Schema, { generateBreadcrumbSchema } from '@/components/Schema'

export const metadata: Metadata = {
  title: 'Horsebox Advice & Tips | J Taylor Horseboxes Blog',
  description: 'Expert advice on horsebox ownership, maintenance, safety, and buying guides. Learn from the JTH team\'s decades of experience building quality horseboxes.',
  keywords: ['horsebox advice', 'horsebox tips', 'horsebox maintenance', 'horsebox safety', 'horsebox buying guide', 'JTH blog'],
  openGraph: {
    title: 'Horsebox Advice & Tips | J Taylor Horseboxes',
    description: 'Expert advice on horsebox ownership, maintenance, and safety from the JTH team.',
    type: 'website',
    url: 'https://jthltd.co.uk/blog',
  },
}

export default async function BlogPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch published posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, tags, featured_image, published_at, author_id, featured')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Get featured post
  const featuredPost = posts?.find(p => p.featured) || posts?.[0]
  const regularPosts = posts?.filter(p => p.id !== featuredPost?.id) || []

  // Get unique categories
  const categories = Array.from(new Set(posts?.map(p => p.category).filter(Boolean))) as string[]

  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Blog', url: 'https://jthltd.co.uk/blog' }
  ]

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      <Schema schema={breadcrumbSchema} />

      {/* Hero Section */}
      <Hero
        primarySrc="/hero/blog-hero.jpg"
        height="md"
        overlay="gradient"
      >
        <div className="text-center w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Horsebox Advice & Tips
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Expert guidance from decades of horsebox manufacturing experience
          </p>
        </div>
      </Hero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Featured Article</h2>
            </div>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="md:flex">
                {featuredPost.featured_image && (
                  <div className="md:w-1/2 relative h-64 md:h-auto">
                    <Image
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className={`${featuredPost.featured_image ? 'md:w-1/2' : 'w-full'} p-8`}>
                  {featuredPost.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                      {featuredPost.category}
                    </span>
                  )}
                  <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {featuredPost.title}
                  </h3>
                  {featuredPost.excerpt && (
                    <p className="text-lg text-slate-600 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    {featuredPost.published_at && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(featuredPost.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    Read Article
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                All Posts
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {post.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  {post.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {post.published_at && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-xs text-slate-500"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !featuredPost && (
            <div className="text-center py-16">
              <p className="text-xl text-slate-600">No blog posts available yet.</p>
              <p className="text-slate-500 mt-2">Check back soon for expert horsebox advice!</p>
            </div>
          )
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Expert Advice?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Our team is here to help you choose the perfect horsebox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contact Us
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/configurator"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              Configure Your Horsebox
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
