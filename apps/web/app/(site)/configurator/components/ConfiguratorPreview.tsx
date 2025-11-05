'use client'

import { useState, useEffect } from 'react'
import { buildConfiguratorPreviewUrl, getPlaceholderUrl } from '@/lib/cloudinary/image-builder'
import { useConfiguratorStore } from '@/lib/configurator/store'
import { ChevronLeft, ChevronRight, RotateCw, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ViewAngle = '3-4-front' | 'side' | '3-4-rear' | 'front' | 'rear'

const VIEW_ANGLES: Array<{ id: ViewAngle; label: string }> = [
  { id: '3-4-front', label: 'Front 3/4' },
  { id: 'side', label: 'Side' },
  { id: '3-4-rear', label: 'Rear 3/4' },
  { id: 'front', label: 'Front' },
  { id: 'rear', label: 'Rear' },
]

export default function ConfiguratorPreview() {
  const { selectedModel, selectedOptions, isLoading } = useConfiguratorStore()
  const [currentAngle, setCurrentAngle] = useState<ViewAngle>('3-4-front')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const modelId = selectedModel?.id || ''

  // Generate the preview URL
  const previewUrl = selectedModel
    ? buildConfiguratorPreviewUrl(
        {
          modelId,
          selectedOptions: selectedOptions.map((opt) => ({
            id: opt.id,
            category: opt.category,
          })),
          angle: currentAngle,
        },
        {
          width: 1200,
          height: 800,
          quality: 'auto:good',
        }
      )
    : ''

  const placeholderUrl = getPlaceholderUrl(modelId)

  // Reset image loaded state when URL changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [previewUrl])

  // Cycle through angles with arrow keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePreviousAngle()
      } else if (e.key === 'ArrowRight') {
        handleNextAngle()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentAngle])

  const handleNextAngle = () => {
    const currentIndex = VIEW_ANGLES.findIndex((a) => a.id === currentAngle)
    const nextIndex = (currentIndex + 1) % VIEW_ANGLES.length
    setCurrentAngle(VIEW_ANGLES[nextIndex].id)
  }

  const handlePreviousAngle = () => {
    const currentIndex = VIEW_ANGLES.findIndex((a) => a.id === currentAngle)
    const previousIndex = (currentIndex - 1 + VIEW_ANGLES.length) % VIEW_ANGLES.length
    setCurrentAngle(VIEW_ANGLES[previousIndex].id)
  }

  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `${modelId}_configuration_${currentAngle}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${selectedModel?.name} Configuration`,
          text: 'Check out my horsebox configuration!',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Configuration link copied to clipboard!')
    }
  }

  if (!selectedModel) {
    return (
      <Card className="relative aspect-[3/2] bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <RotateCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a model to preview your configuration</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Preview */}
      <Card className="relative aspect-[3/2] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden group">
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <RotateCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-4">🏗️</div>
              <p className="font-semibold">Preview Coming Soon</p>
              <p className="text-sm mt-2">
                Images are being prepared for this configuration
              </p>
            </div>
          </div>
        )}

        {/* Main Image */}
        <img
          src={imageError ? placeholderUrl : previewUrl}
          alt={`${selectedModel.name} - ${VIEW_ANGLES.find((a) => a.id === currentAngle)?.label} view`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.log('Image failed to load, showing placeholder')
            setImageError(true)
            setImageLoaded(true)
          }}
        />

        {/* Navigation Controls */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={handlePreviousAngle}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={handleNextAngle}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-lg"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="shadow-lg"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Current Angle Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="shadow-lg">
            {VIEW_ANGLES.find((a) => a.id === currentAngle)?.label}
          </Badge>
        </div>

        {/* Keyboard Hint */}
        <div className="absolute bottom-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Use ← → keys to rotate
          </p>
        </div>
      </Card>

      {/* Angle Selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {VIEW_ANGLES.map((angle) => (
          <Button
            key={angle.id}
            variant={currentAngle === angle.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentAngle(angle.id)}
          >
            {angle.label}
          </Button>
        ))}
      </div>

      {/* Selected Options Summary */}
      {selectedOptions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2 text-sm">Selected Options ({selectedOptions.length})</h3>
          <div className="flex flex-wrap gap-1">
            {selectedOptions.slice(0, 10).map((option) => (
              <Badge key={option.id} variant="secondary" className="text-xs">
                {option.name}
              </Badge>
            ))}
            {selectedOptions.length > 10 && (
              <Badge variant="outline" className="text-xs">
                +{selectedOptions.length - 10} more
              </Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
