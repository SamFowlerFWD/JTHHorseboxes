import { Metadata } from 'next'
import { getBlogPosts } from '@/lib/sanity/client'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { Calendar, Tag } from 'lucide-react'
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
  const posts = await getBlogPosts()

  const featuredPost = posts.find(p => p.featured) || posts[0]
  const regularPosts = posts.filter(p => p._id !== featuredPost?._id)

  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean))) as string[]

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
        primarySrc="/images/blog/kph-helios-75-horsebox-2023-full-ramp.webp"
        height="md"
        overlay="gradient"
      >
        <div className="w-full self-end pb-14 md:pb-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl text-white leading-[1.06]">
              Horsebox Advice &amp; Tips
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed">
              Expert guidance from decades of horsebox manufacturing experience.
            </p>
            <div className="mt-10 flex flex-col gap-[4px]">
              <span className="block h-[2px] w-32 bg-brass-light" />
              <span className="block h-px w-20 bg-brass-light/60" />
            </div>
          </div>
        </div>
      </Hero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* No posts state */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <h2 className="font-display text-2xl text-ink mb-4">Content Coming Soon</h2>
            <p className="text-lg text-slate-600 mb-2">
              We're preparing expert horsebox advice and tips for you.
            </p>
            <p className="text-slate-500">
              Check back soon, or <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">contact us</Link> for immediate help.
            </p>
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-ink">Featured Article</h2>
            </div>
            <Link
              href={`/blog/${featuredPost.slug.current}`}
              className="group block bg-white border border-line shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="md:flex">
                {featuredPost.featuredImage?.asset?.url && (
                  <div className="md:w-1/2 relative h-64 md:h-auto">
                    <Image
                      src={featuredPost.featuredImage.asset.url}
                      alt={featuredPost.featuredImage.alt || featuredPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className={`${featuredPost.featuredImage?.asset?.url ? 'md:w-1/2' : 'w-full'} p-8`}>
                  {featuredPost.category && (
                    <span className="inline-flex items-center border border-line bg-paper px-2.5 py-1 text-sm text-slate-600 mb-4">
                      {featuredPost.category}
                    </span>
                  )}
                  <h3 className="font-display text-3xl text-ink mb-4 group-hover:text-blue-700 transition-colors leading-[1.1]">
                    {featuredPost.title}
                  </h3>
                  {featuredPost.excerpt && (
                    <p className="text-lg text-slate-600 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    {featuredPost.publishedAt && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    Read Article
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
                className="bg-blue-900 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-800"
              >
                All Posts
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="border border-line px-4 py-2 font-medium text-slate-700 transition-colors hover:border-ink/30 hover:text-ink"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {regularPosts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug.current}`}
                className="group bg-white border border-line shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {post.featuredImage?.asset?.url && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featuredImage.asset.url}
                      alt={post.featuredImage.alt || post.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  {post.category && (
                    <span className="inline-flex items-center border border-line bg-paper px-2.5 py-1 text-xs text-slate-600 mb-3">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {post.publishedAt && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.publishedAt).toLocaleDateString('en-GB', {
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
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-blue-900 p-12 text-center text-white">
          <h2 className="font-display text-3xl mb-4 leading-[1.1]">Need Expert Advice?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Our team is here to help you choose the perfect horsebox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-on-dark"
            >
              Contact Us
            </Link>
            <Link
              href="/contact"
              className="btn-on-dark-outline"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
