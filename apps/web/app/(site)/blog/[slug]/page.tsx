import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Tag, ArrowLeft } from 'lucide-react'
import Schema, { generateBreadcrumbSchema, generateArticleSchema } from '@/components/Schema'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const supabase = await createServerSupabaseClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, keywords, featured_image')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: 'Post Not Found | J Taylor Horseboxes',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.keywords || [],
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
      url: `https://jthltd.co.uk/blog/${params.slug}`,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const supabase = await createServerSupabaseClient()

  // Fetch the blog post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    notFound()
  }

  // Fetch related posts (same category, exclude current)
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, featured_image, published_at')
    .eq('status', 'published')
    .eq('category', post.category)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3)

  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Blog', url: 'https://jthltd.co.uk/blog' },
    { name: post.title, url: `https://jthltd.co.uk/blog/${post.slug}` }
  ]

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)
  const articleSchema = generateArticleSchema({
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: post.featured_image || '',
    author: 'J Taylor Horseboxes',
    publisher: 'J Taylor Horseboxes',
  })

  return (
    <>
      <Schema schema={breadcrumbSchema} />
      <Schema schema={articleSchema} />

      <article className="min-h-screen bg-slate-50">
        {/* Header with Featured Image */}
        <div className="relative">
          {post.featured_image ? (
            <div className="relative h-96 md:h-[500px] w-full">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
            </div>
          ) : (
            <div className="h-64 md:h-80 bg-gradient-to-br from-blue-600 to-blue-800" />
          )}

          {/* Title Overlay */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              {post.category && (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-4"
                >
                  {post.category}
                </Link>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                {post.published_at && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                )}
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span>JTH Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back to Blog Link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-12">
              <p className="text-xl text-slate-700 leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div
            className="prose prose-lg prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-slate-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700
              prose-strong:text-slate-900 prose-strong:font-semibold
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-slate-700 prose-li:my-2
              prose-img:rounded-lg prose-img:shadow-lg
              prose-blockquote:border-l-4 prose-blockquote:border-blue-600
              prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6
              prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-code:text-sm prose-code:font-mono prose-code:text-slate-800
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Tag className="w-3 h-3 mr-2" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Share this article</h3>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://jthltd.co.uk/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://jthltd.co.uk/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://jthltd.co.uk/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-slate-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {relatedPost.featured_image && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {relatedPost.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
                          {relatedPost.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-slate-500">
                        {relatedPost.published_at && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(relatedPost.published_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-slate-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Horsebox?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Explore our range or get in touch with our expert team
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/configurator"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Configure Your Horsebox
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
