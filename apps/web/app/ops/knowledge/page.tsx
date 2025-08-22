"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database,
  Search,
  Plus,
  BookOpen,
  FileText,
  Video,
  Download,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  Tag,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Star
} from "lucide-react"
import { format } from "date-fns"

interface KnowledgeArticle {
  id: string
  title: string
  category: string
  content: string
  summary: string
  author: string
  tags: string[]
  views: number
  helpful: number
  createdAt: Date
  updatedAt: Date
  type: 'article' | 'guide' | 'video' | 'faq'
  featured: boolean
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddArticleOpen, setIsAddArticleOpen] = useState(false)

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/knowledge')
      
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge base')
      }
      
      const result = await response.json()
      
      if (result.success) {
        const parsedArticles = result.data.map((article: any) => ({
          ...article,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt)
        }))
        setArticles(parsedArticles)
      } else {
        throw new Error(result.error || 'Failed to fetch knowledge base')
      }
    } catch (err: any) {
      console.error('Knowledge base error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Get featured articles
  const featuredArticles = articles.filter(a => a.featured).slice(0, 3)

  // Get popular articles
  const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />
      case 'guide': return <BookOpen className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'faq': return <Database className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories', count: articles.length },
    { id: 'getting-started', name: 'Getting Started', count: articles.filter(a => a.category === 'getting-started').length },
    { id: 'sales', name: 'Sales Process', count: articles.filter(a => a.category === 'sales').length },
    { id: 'production', name: 'Production', count: articles.filter(a => a.category === 'production').length },
    { id: 'inventory', name: 'Inventory', count: articles.filter(a => a.category === 'inventory').length },
    { id: 'maintenance', name: 'Maintenance', count: articles.filter(a => a.category === 'maintenance').length },
    { id: 'troubleshooting', name: 'Troubleshooting', count: articles.filter(a => a.category === 'troubleshooting').length }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Documentation, guides, and resources</p>
        </div>
        <Button onClick={() => setIsAddArticleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-lg"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading knowledge base...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted transition-colors ${
                        selectedCategory === category.id ? 'bg-muted' : ''
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-muted-foreground">{category.count}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article)
                        setIsDetailOpen(true)
                      }}
                      className="w-full text-left hover:text-primary transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-2">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.views} views</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && !searchTerm && selectedCategory === 'all' && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Featured Articles</h2>
                <div className="grid grid-cols-3 gap-4">
                  {featuredArticles.map((article) => (
                    <Card 
                      key={article.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedArticle(article)
                        setIsDetailOpen(true)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          {getTypeIcon(article.type)}
                        </div>
                        <h3 className="font-semibold mb-1">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.summary}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Article List */}
            <div>
              <h2 className="text-lg font-semibold mb-3">
                {searchTerm ? 'Search Results' : 'All Articles'}
              </h2>
              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <Card 
                    key={article.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedArticle(article)
                      setIsDetailOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(article.type)}
                            <h3 className="font-semibold">{article.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(article.updatedAt, "dd MMM yyyy")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.views} views
                            </div>
                            <div className="flex gap-1">
                              {article.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredArticles.length === 0 && (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No articles found</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedArticle.type)}
                  <DialogTitle>{selectedArticle.title}</DialogTitle>
                </div>
                <DialogDescription>
                  By {selectedArticle.author} • Updated {format(selectedArticle.updatedAt, "dd MMM yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  {selectedArticle.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div className="prose max-w-none">
                  <p>{selectedArticle.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedArticle.views} views</span>
                    <span>{selectedArticle.helpful} found this helpful</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Article Dialog */}
      <Dialog open={isAddArticleOpen} onOpenChange={setIsAddArticleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Article</DialogTitle>
            <DialogDescription>
              Create a new knowledge base article
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input placeholder="Article Title" />
            </div>
            <div>
              <Input placeholder="Summary" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddArticleOpen(false)}>
                Cancel
              </Button>
              <Button>Create Article</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}