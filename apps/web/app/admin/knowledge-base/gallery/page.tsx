import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Image as ImageIcon, Upload, Search, Filter, Grid3x3, List } from 'lucide-react'

async function getVehicleImages(category?: string, search?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('knowledge_base')
    .select('*')
    .eq('source', 'image_upload')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('metadata->image_category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data: images, error } = await query

  if (error) {
    console.error('Error fetching images:', error)
    return []
  }

  return images || []
}

export default async function KnowledgeBaseGalleryPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; view?: string }
}) {
  const images = await getVehicleImages(searchParams.category, searchParams.search)
  const viewMode = searchParams.view || 'grid'

  const vehicleCategories = [
    { value: 'all', label: 'All Categories' },
    { value: '3.5t', label: 'JTH Professional 3.5t' },
    { value: '4.5t', label: 'JTH Elite 4.5t' },
    { value: '7.2t', label: 'JTH Supreme 7.2t' },
    { value: 'interior', label: 'Interior Features' },
    { value: 'exterior', label: 'Exterior Features' },
    { value: 'technical', label: 'Technical Diagrams' },
    { value: 'gallery', label: 'Customer Gallery' },
  ]

  const getCategoryLabel = (value: string) => {
    return vehicleCategories.find(c => c.value === value)?.label || value
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Image Gallery</h1>
            <p className="text-gray-600 mt-2">
              Browse and manage vehicle images in the knowledge base
            </p>
          </div>
          <Link href="/admin/knowledge-base/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <form className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search images..."
                    defaultValue={searchParams.search}
                    className="pl-10"
                  />
                </form>
              </div>
              
              <form className="flex gap-2">
                <Select name="category" defaultValue={searchParams.category || 'all'}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  <Button
                    type="submit"
                    name="view"
                    value="grid"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    name="view"
                    value="list"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Image Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Image Grid/List */}
        {images.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No images found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchParams.search || searchParams.category
                    ? 'Try adjusting your filters'
                    : 'Get started by uploading some vehicle images'}
                </p>
                <Link href="/admin/knowledge-base/upload">
                  <Button className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  {image.source_url ? (
                    <img
                      src={image.source_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {image.metadata?.image_category && (
                    <Badge className="absolute top-2 right-2">
                      {getCategoryLabel(image.metadata.image_category)}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm truncate">{image.title}</h3>
                  {image.content && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {image.content}
                    </p>
                  )}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {image.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <Link href={`/admin/knowledge-base/${image.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {images.map((image) => (
                  <div key={image.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {image.source_url ? (
                          <img
                            src={image.source_url}
                            alt={image.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{image.title}</h3>
                            {image.content && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {image.content}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              {image.metadata?.image_category && (
                                <Badge variant="outline">
                                  {getCategoryLabel(image.metadata.image_category)}
                                </Badge>
                              )}
                              {image.metadata?.file_size && (
                                <span className="text-xs text-gray-500">
                                  {(image.metadata.file_size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(image.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {image.tags && image.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {image.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Link href={`/admin/knowledge-base/${image.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}