'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Image, Folder, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface FileWithPreview extends File {
  preview?: string
  category?: string
  description?: string
  tags?: string[]
}

interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  category: string
  description?: string
  tags?: string[]
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function KnowledgeBaseUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('3.5t')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const { toast } = useToast()
  const supabase = createClient()

  const vehicleCategories = [
    { value: '3.5t', label: 'JTH Professional 3.5t' },
    { value: '4.5t', label: 'JTH Elite 4.5t' },
    { value: '7.2t', label: 'JTH Supreme 7.2t' },
    { value: 'interior', label: 'Interior Features' },
    { value: 'exterior', label: 'Exterior Features' },
    { value: 'technical', label: 'Technical Diagrams' },
    { value: 'gallery', label: 'Customer Gallery' },
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      category: selectedCategory,
      status: 'pending',
      tags: extractTagsFromFilename(file.name),
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [selectedCategory])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.avif'],
    },
    multiple: true,
  })

  const extractTagsFromFilename = (filename: string): string[] => {
    // Extract potential tags from filename
    const name = filename.replace(/\.[^/.]+$/, '') // Remove extension
    const words = name.split(/[-_\s]+/)
    return words.filter(word => word.length > 2).map(word => word.toLowerCase())
  }

  const generateDescription = async (file: File, category: string): Promise<string> => {
    // In a real implementation, this would call an AI service to analyze the image
    // For now, we'll generate a simple description based on filename and category
    const filename = file.name.replace(/\.[^/.]+$/, '')
    const categoryLabel = vehicleCategories.find(c => c.value === category)?.label || category
    
    return `Image of ${categoryLabel} - ${filename.replace(/[-_]/g, ' ')}`
  }

  const uploadFile = async (file: UploadedFile, originalFile: File) => {
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ))

      // Generate AI description if not already set
      if (!file.description) {
        file.description = await generateDescription(originalFile, file.category)
      }

      // Upload to Supabase Storage
      const fileName = `${file.category}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, originalFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName)

      // Save metadata to knowledge base
      const { error: dbError } = await supabase
        .from('knowledge_base')
        .insert({
          title: file.name,
          content: file.description,
          category: 'vehicle_image',
          tags: file.tags,
          source: 'image_upload',
          source_url: publicUrl,
          is_published: true,
          metadata: {
            image_category: file.category,
            file_size: file.size,
            file_type: file.type,
            original_filename: file.name,
          }
        })

      if (dbError) throw dbError

      // Update status to success
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'success', url: publicUrl } 
          : f
      ))

      return true
    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Update status to error
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'error', error: error.message } 
          : f
      ))

      return false
    }
  }

  const handleUploadAll = async () => {
    setIsUploading(true)

    const pendingFiles = files.filter(f => f.status === 'pending')
    const fileInputs = document.querySelectorAll('input[type="file"]')
    
    let successCount = 0
    let errorCount = 0

    for (const file of pendingFiles) {
      // Find the original File object
      let originalFile: File | null = null
      
      // This is a simplified approach - in production, you'd store the File objects properly
      const response = await fetch(file.url)
      const blob = await response.blob()
      originalFile = new File([blob], file.name, { type: file.type })

      if (originalFile) {
        const success = await uploadFile(file, originalFile)
        if (success) successCount++
        else errorCount++
      }
    }

    setIsUploading(false)

    toast({
      title: 'Upload Complete',
      description: `Successfully uploaded ${successCount} files${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
    })
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileDetails = (id: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Vehicle Images</h1>
          <p className="text-gray-600 mt-2">
            Upload images to the knowledge base for vehicle models and features
          </p>
        </div>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {vehicleCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Dropzone */}
        <Card>
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors duration-200 ease-in-out
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                {isDragActive ? (
                  <>
                    <Folder className="h-12 w-12 text-blue-500" />
                    <p className="text-lg font-medium">Drop the files here...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">
                        Drag & drop images here, or click to select
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Support for folders and multiple files. Accepts JPEG, PNG, WebP, AVIF
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Files to Upload ({files.length})</CardTitle>
                <Button 
                  onClick={handleUploadAll}
                  disabled={isUploading || files.every(f => f.status !== 'pending')}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload All
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      {/* Preview */}
                      <div className="flex-shrink-0">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      </div>

                      {/* File Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{file.name}</span>
                            {file.status === 'success' && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            {file.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            {file.status === 'uploading' && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            )}
                          </div>
                          {file.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.category}
                        </div>

                        {file.status === 'pending' && (
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor={`desc-${file.id}`}>Description</Label>
                              <Textarea
                                id={`desc-${file.id}`}
                                placeholder="Add a description for this image..."
                                value={file.description || ''}
                                onChange={(e) => updateFileDetails(file.id, { description: e.target.value })}
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`tags-${file.id}`}>Tags</Label>
                              <Input
                                id={`tags-${file.id}`}
                                placeholder="Enter tags separated by commas"
                                value={file.tags?.join(', ') || ''}
                                onChange={(e) => updateFileDetails(file.id, { 
                                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                                })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}

                        {file.status === 'error' && (
                          <p className="text-sm text-red-500">{file.error}</p>
                        )}
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