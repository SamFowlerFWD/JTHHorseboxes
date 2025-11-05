'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/Toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  meta_title: string
  meta_description: string
  keywords: string[]
  featured: boolean
  featured_image: string
  status: 'draft' | 'review' | 'published' | 'archived'
}

function NewBlogPostContent() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    keywords: [],
    featured: false,
    featured_image: '',
    status: 'draft',
  })

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      meta_title: prev.meta_title || title, // Auto-fill meta_title if empty
    }))
  }

  const handleSubmit = async (status: BlogFormData['status']) => {
    // Validation
    if (!formData.title.trim()) {
      showToast('error', 'Title is required')
      return
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Slug is required')
      return
    }
    if (!formData.content.trim()) {
      showToast('error', 'Content is required')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const postData = {
        ...formData,
        status,
        author_id: user?.id || null,
        published_at: status === 'published' ? new Date().toISOString() : null,
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error

      showToast('success', `Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)

      // Redirect to blog management page after a short delay
      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)
    } catch (error: any) {
      console.error('Error creating post:', error)
      showToast('error', error.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(kw => kw.trim()).filter(Boolean)
    setFormData((prev) => ({ ...prev, keywords }))
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create New Blog Post
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Write and publish content for your blog
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter your blog post title..."
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-slug"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of your post (shown in listings)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 120-160 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog post content here... (Supports HTML and Markdown)"
                  rows={20}
                  className="w-full px-4 py-3 text-sm font-mono border-0 focus:ring-0 dark:bg-gray-900 dark:text-white resize-none"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;)
              </p>
            </div>

            {/* SEO Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                SEO & Metadata
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO title (defaults to post title)"
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Brief description for search engines..."
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Comma-separated keywords for SEO
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Publish
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Now'}
                </Button>
                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full"
                >
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  onClick={() => handleSubmit('review')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full"
                >
                  {isSubmitting ? 'Saving...' : 'Submit for Review'}
                </Button>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select category...</option>
                    <option value="Horsebox Advice">Horsebox Advice</option>
                    <option value="Safety">Safety</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Buying Guide">Buying Guide</option>
                    <option value="Features">Features</option>
                    <option value="News">News</option>
                    <option value="Case Studies">Case Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Featured Image
              </h3>
              <input
                type="text"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                placeholder="Image URL or path"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter the URL or path to the featured image
              </p>
            </div>

            {/* Options */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Options
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured Post
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Show this post prominently on the blog homepage
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function NewBlogPostPage() {
  return (
    <ToastProvider>
      <NewBlogPostContent />
    </ToastProvider>
  )
}
