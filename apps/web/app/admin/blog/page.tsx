'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import DataTable, { Column } from '@/components/admin/DataTable'
import SearchBar from '@/components/admin/SearchBar'
import Modal from '@/components/admin/Modal'
import { ToastProvider, useToast } from '@/components/admin/Toast'
import { BlogPost, BlogStatus } from '@/lib/supabase/database.types'
import { Edit, Trash2, Eye, Plus, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function BlogPageContent() {
  const { showToast } = useToast()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BlogStatus | 'all'>('all')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<BlogPost>>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, statusFilter])

  const fetchPosts = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      showToast('error', 'Failed to fetch blog posts')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]

    if (searchQuery) {
      filtered = filtered.filter((post) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
          post.category?.toLowerCase().includes(searchLower) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        )
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((post) => post.status === statusFilter)
    }

    setFilteredPosts(filtered)
  }

  const handleStatusChange = async (postId: string, newStatus: BlogStatus) => {
    const supabase = createClient()
    
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'published' && !posts.find(p => p.id === postId)?.published_at) {
        updateData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)

      if (error) throw error

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, ...updateData } : post
        )
      )
      
      showToast('success', 'Post status updated')
    } catch (error) {
      console.error('Error updating post status:', error)
      showToast('error', 'Failed to update post status')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      setPosts((prev) => prev.filter((post) => post.id !== postId))
      showToast('success', 'Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      showToast('error', 'Failed to delete post')
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditForm(post)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: editForm.title,
          slug: editForm.slug,
          excerpt: editForm.excerpt,
          content: editForm.content,
          category: editForm.category,
          tags: editForm.tags,
          meta_title: editForm.meta_title,
          meta_description: editForm.meta_description,
          keywords: editForm.keywords,
          featured: editForm.featured,
        })
        .eq('id', editForm.id)

      if (error) throw error

      setPosts((prev) =>
        prev.map((post) =>
          post.id === editForm.id ? { ...post, ...editForm } as BlogPost : post
        )
      )
      
      setIsEditModalOpen(false)
      showToast('success', 'Post updated successfully')
    } catch (error) {
      console.error('Error updating post:', error)
      showToast('error', 'Failed to update post')
    }
  }

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      header: 'Title',
      accessor: (post) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {post.title}
            {post.featured && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{post.slug}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (post) => post.category || '-',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (post) => (
        <select
          value={post.status}
          onChange={(e) => handleStatusChange(post.id, e.target.value as BlogStatus)}
          className="text-sm rounded-full px-3 py-1 font-semibold border-0 focus:ring-2 focus:ring-indigo-500"
          style={{
            backgroundColor:
              post.status === 'draft' ? '#f3f4f6' :
              post.status === 'review' ? '#fef3c7' :
              post.status === 'published' ? '#d1fae5' :
              '#fee2e2',
            color:
              post.status === 'draft' ? '#374151' :
              post.status === 'review' ? '#92400e' :
              post.status === 'published' ? '#065f46' :
              '#991b1b',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      ),
    },
    {
      key: 'published',
      header: 'Published',
      accessor: (post) => (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-1" />
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (post) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500"
          >
            <Eye className="h-5 w-5" />
          </a>
          <button
            onClick={() => handleEdit(post)}
            className="text-gray-400 hover:text-gray-500"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(post.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blog Posts</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your blog content and SEO
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/admin/blog/new">
              <Button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="col-span-2">
              <SearchBar
                placeholder="Search by title, category, or tags..."
                value={searchQuery}
                onSearch={setSearchQuery}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BlogStatus | 'all')}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <DataTable
            data={filteredPosts}
            columns={columns}
            loading={isLoading}
            emptyMessage="No blog posts found"
          />
        </div>
      </div>

      {/* Edit Post Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Post"
        size="2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug
            </label>
            <input
              type="text"
              value={editForm.slug || ''}
              onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Excerpt
            </label>
            <textarea
              value={editForm.excerpt || ''}
              onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <textarea
              value={editForm.content || ''}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editForm.tags?.join(', ') || ''}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meta Title
            </label>
            <input
              type="text"
              value={editForm.meta_title || ''}
              onChange={(e) => setEditForm({ ...editForm, meta_title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meta Description
            </label>
            <textarea
              value={editForm.meta_description || ''}
              onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={editForm.featured || false}
              onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Featured Post
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default function BlogPage() {
  return (
    <ToastProvider>
      <BlogPageContent />
    </ToastProvider>
  )
}