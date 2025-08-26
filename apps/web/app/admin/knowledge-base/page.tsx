'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import DataTable, { Column } from '@/components/admin/DataTable'
import SearchBar from '@/components/admin/SearchBar'
import Modal from '@/components/admin/Modal'
import { ToastProvider, useToast } from '@/components/admin/Toast'
import { KnowledgeBase, KnowledgeSource } from '@/lib/supabase/database.types'
import { Plus, Edit, Trash2, Search, Upload, BookOpen, Tag, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function KnowledgeBasePageContent() {
  const { showToast } = useToast()
  const [entries, setEntries] = useState<KnowledgeBase[]>([])
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTestSearchModalOpen, setIsTestSearchModalOpen] = useState(false)
  const [testSearchQuery, setTestSearchQuery] = useState('')
  const [testSearchResults, setTestSearchResults] = useState<any[]>([])
  const [form, setForm] = useState<Partial<KnowledgeBase>>({
    title: '',
    content: '',
    category: '',
    tags: [],
    source: 'manual' as KnowledgeSource,
    source_url: '',
    is_published: true,
    search_keywords: '',
    relevance_score: 1.0,
  })
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery, categoryFilter])

  const fetchEntries = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setEntries(data || [])
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(entry => entry.category).filter(Boolean))] as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching knowledge base entries:', error)
      showToast('error', 'Failed to fetch knowledge base entries')
    } finally {
      setIsLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = [...entries]

    if (searchQuery) {
      filtered = filtered.filter((entry) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.category?.toLowerCase().includes(searchLower) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
          entry.search_keywords?.toLowerCase().includes(searchLower)
        )
      })
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.category === categoryFilter)
    }

    setFilteredEntries(filtered)
  }

  const handleAdd = async () => {
    const supabase = createClient()
    
    try {
      // Generate embedding if needed (would require API call to embedding service)
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert([form])
        .select()
        .single()

      if (error) throw error

      setEntries([data, ...entries])
      setIsAddModalOpen(false)
      setForm({
        title: '',
        content: '',
        category: '',
        tags: [],
        source: 'manual' as KnowledgeSource,
        source_url: '',
        is_published: true,
        search_keywords: '',
        relevance_score: 1.0,
      })
      showToast('success', 'Knowledge base entry added successfully')
    } catch (error) {
      console.error('Error adding entry:', error)
      showToast('error', 'Failed to add entry')
    }
  }

  const handleEdit = async () => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update(form)
        .eq('id', form.id)

      if (error) throw error

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === form.id ? { ...entry, ...form } as KnowledgeBase : entry
        )
      )
      
      setIsEditModalOpen(false)
      showToast('success', 'Entry updated successfully')
    } catch (error) {
      console.error('Error updating entry:', error)
      showToast('error', 'Failed to update entry')
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', entryId)

      if (error) throw error

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      showToast('success', 'Entry deleted successfully')
    } catch (error) {
      console.error('Error deleting entry:', error)
      showToast('error', 'Failed to delete entry')
    }
  }

  const handleTogglePublished = async (entryId: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ is_published: !currentStatus })
        .eq('id', entryId)

      if (error) throw error

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, is_published: !currentStatus } : entry
        )
      )
      
      showToast('success', `Entry ${!currentStatus ? 'published' : 'unpublished'}`)
    } catch (error) {
      console.error('Error toggling published status:', error)
      showToast('error', 'Failed to update status')
    }
  }

  const handleTestSearch = async () => {
    // This would typically call an API endpoint that uses the search functions
    // For now, we'll do a simple text search
    const results = entries.filter((entry) => {
      const searchLower = testSearchQuery.toLowerCase()
      return (
        entry.title.toLowerCase().includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower)
      )
    }).slice(0, 5)

    setTestSearchResults(results)
  }

  const handleBulkImport = () => {
    // This would open a file dialog for CSV import
    showToast('info', 'Bulk import feature coming soon')
  }

  const columns: Column<KnowledgeBase>[] = [
    {
      key: 'title',
      header: 'Title',
      accessor: (entry) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {entry.title}
          </div>
          {entry.category && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <Tag className="inline h-3 w-3 mr-1" />
              {entry.category}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'source',
      header: 'Source',
      accessor: (entry) => (
        <div className="flex items-center text-sm">
          {entry.source_url ? (
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              <Link2 className="h-4 w-4 mr-1" />
              {entry.source}
            </a>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{entry.source}</span>
          )}
        </div>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      accessor: (entry) => (
        <div className="flex flex-wrap gap-1">
          {entry.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'relevance',
      header: 'Relevance',
      accessor: (entry) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${(entry.relevance_score || 0) * 100}%` }}
            />
          </div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {((entry.relevance_score || 0) * 100).toFixed(0)}%
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (entry) => (
        <button
          onClick={() => handleTogglePublished(entry.id, entry.is_published)}
          className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium ${
            entry.is_published
              ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {entry.is_published ? 'Published' : 'Draft'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (entry) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setForm(entry)
              setIsEditModalOpen(true)
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(entry.id)}
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Knowledge Base</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage FAQ content and search embeddings
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <Link href="/admin/knowledge-base/gallery">
              <Button
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Image Gallery
              </Button>
            </Link>
            <Link href="/admin/knowledge-base/upload">
              <Button
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </Link>
            <Button
              onClick={handleBulkImport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button
              onClick={() => setIsTestSearchModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Test Search
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="col-span-2">
              <SearchBar
                placeholder="Search by title, content, or tags..."
                value={searchQuery}
                onSearch={setSearchQuery}
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <DataTable
            data={filteredEntries}
            columns={columns}
            loading={isLoading}
            emptyMessage="No knowledge base entries found"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setForm({
            title: '',
            content: '',
            category: '',
            tags: [],
            source: 'manual' as KnowledgeSource,
            source_url: '',
            is_published: true,
            search_keywords: '',
            relevance_score: 1.0,
          })
        }}
        title={isEditModalOpen ? 'Edit Entry' : 'Add Entry'}
        size="2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content *
            </label>
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                placeholder="e.g., Technical, Pricing, Features"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags?.join(', ') || ''}
                onChange={(e) => setForm({ 
                  ...form, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Source
              </label>
              <select
                value={form.source || 'manual'}
                onChange={(e) => setForm({ ...form, source: e.target.value as KnowledgeSource })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              >
                <option value="manual">Manual</option>
                <option value="faq">FAQ</option>
                <option value="documentation">Documentation</option>
                <option value="product">Product</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Source URL
              </label>
              <input
                type="url"
                value={form.source_url || ''}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Keywords
            </label>
            <input
              type="text"
              value={form.search_keywords || ''}
              onChange={(e) => setForm({ ...form, search_keywords: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              placeholder="Additional keywords to help with search"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published || false}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Published
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Relevance Score
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={form.relevance_score || 1}
                onChange={(e) => setForm({ ...form, relevance_score: Number(e.target.value) })}
                className="w-20 rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={isEditModalOpen ? handleEdit : handleAdd}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isEditModalOpen ? 'Save Changes' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Test Search Modal */}
      <Modal
        isOpen={isTestSearchModalOpen}
        onClose={() => {
          setIsTestSearchModalOpen(false)
          setTestSearchQuery('')
          setTestSearchResults([])
        }}
        title="Test Knowledge Base Search"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Query
            </label>
            <input
              type="text"
              value={testSearchQuery}
              onChange={(e) => setTestSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              placeholder="Enter a search query..."
            />
          </div>
          <Button
            onClick={handleTestSearch}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Search
          </Button>
          {testSearchResults.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Results ({testSearchResults.length})
              </h4>
              <div className="space-y-2">
                {testSearchResults.map((result) => (
                  <div key={result.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h5 className="font-medium text-gray-900 dark:text-white">{result.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.content.substring(0, 150)}...
                    </p>
                    {result.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mt-2">
                        {result.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default function KnowledgeBasePage() {
  return (
    <ToastProvider>
      <KnowledgeBasePageContent />
    </ToastProvider>
  )
}