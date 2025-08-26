"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Expand, 
  X, 
  ZoomIn, 
  ZoomOut,
  Info,
  Download,
  Share2,
  Heart,
  Grid3X3
} from 'lucide-react'

interface GalleryImage {
  src: string
  alt: string
  title?: string
  description?: string
  hotspots?: Array<{
    x: number // percentage
    y: number // percentage
    label: string
    description: string
  }>
}

interface DissolveGalleryProps {
  images: GalleryImage[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showThumbnails?: boolean
  thumbnailPosition?: 'bottom' | 'right'
  enableZoom?: boolean
  enableFullscreen?: boolean
  enableHotspots?: boolean
  enableDownload?: boolean
  transitionDuration?: number
  transitionType?: 'dissolve' | 'crossfade' | 'slide' | 'scale'
  className?: string
}

export default function DissolveGallery({
  images,
  autoPlay = true,
  autoPlayInterval = 4000,
  showThumbnails = true,
  thumbnailPosition = 'bottom',
  enableZoom = true,
  enableFullscreen = true,
  enableHotspots = true,
  enableDownload = false,
  transitionDuration = 800,
  transitionType = 'dissolve',
  className = ''
}: DissolveGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showInfo, setShowInfo] = useState(false)
  const [isLiked, setIsLiked] = useState<boolean[]>(new Array(images.length).fill(false))
  const [showHotspots, setShowHotspots] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(new Array(images.length).fill(false))
  const galleryRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Embla carousel for thumbnails
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  })

  // Preload images
  useEffect(() => {
    images.forEach((image, index) => {
      const img = new window.Image()
      img.src = image.src
      img.onload = () => {
        setImageLoaded(prev => {
          const newState = [...prev]
          newState[index] = true
          return newState
        })
      }
    })
  }, [images])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isPaused && !isFullscreen) {
      intervalRef.current = setInterval(() => {
        handleNext()
      }, autoPlayInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentIndex, autoPlay, autoPlayInterval, isPaused, isFullscreen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
      if (e.key === 'f' && enableFullscreen) setIsFullscreen(!isFullscreen)
      if (e.key === 'i') setShowInfo(!showInfo)
      if (e.key === 'h' && enableHotspots) setShowHotspots(!showHotspots)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, showInfo, showHotspots, enableFullscreen, enableHotspots])

  // Update Embla when current index changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(currentIndex)
    }
  }, [currentIndex, emblaApi])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000) // Resume after 5 seconds
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
    setIsZoomed(true)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1)
    setZoomLevel(newZoom)
    if (newZoom === 1) setIsZoomed(false)
  }

  const handleLike = (index: number) => {
    setIsLiked(prev => {
      const newState = [...prev]
      newState[index] = !newState[index]
      return newState
    })
  }

  const handleDownload = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = image.title || 'jth-horsebox-image.jpg'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title || 'JTH Horsebox',
          text: image.description || 'Check out this amazing horsebox',
          url: window.location.href
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
  }

  // Animation variants
  const transitionVariants = {
    dissolve: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: transitionDuration / 1000 }
    },
    crossfade: {
      initial: { opacity: 0, filter: 'blur(4px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(4px)' },
      transition: { duration: transitionDuration / 1000 }
    },
    slide: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
      transition: { duration: transitionDuration / 1000 }
    },
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
      transition: { duration: transitionDuration / 1000 }
    }
  }

  const currentVariant = transitionVariants[transitionType]
  const currentImage = images[currentIndex]

  return (
    <>
      <div 
        ref={galleryRef}
        className={`relative ${className} ${
          thumbnailPosition === 'right' ? 'flex gap-4' : ''
        }`}
      >
        {/* Main Image Container */}
        <div className={`relative group flex-1 ${
          isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-[16/10] overflow-hidden bg-slate-100'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              {...currentVariant}
              className="absolute inset-0 w-full h-full"
            >
              {imageLoaded[currentIndex] ? (
                <Image
                  src={currentImage.src}
                  alt={currentImage.alt}
                  fill
                  quality={95}
                  priority={currentIndex === 0}
                  className={`object-contain transition-transform duration-300 ${
                    isZoomed ? 'cursor-move' : 'cursor-pointer'
                  }`}
                  style={{
                    transform: `scale(${zoomLevel})`
                  }}
                  sizes={isFullscreen ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"}
                  onClick={() => !isZoomed && setIsFullscreen(!isFullscreen)}
                />
              ) : (
                <div className="absolute inset-0 shimmer" />
              )}

              {/* Hotspots */}
              {enableHotspots && showHotspots && currentImage.hotspots && (
                <div className="absolute inset-0">
                  {currentImage.hotspots.map((hotspot, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="absolute group/hotspot"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 animate-ping bg-amber-400 rounded-full opacity-75" />
                        <div className="relative w-4 h-4 bg-amber-500 rounded-full cursor-pointer" />
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/hotspot:opacity-100 transition-opacity glass-dark text-white p-2 rounded-lg text-sm whitespace-nowrap">
                        <div className="font-semibold">{hotspot.label}</div>
                        <div className="text-xs text-gray-300">{hotspot.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls Overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
            isFullscreen ? 'opacity-100' : ''
          }`}>
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass-dark text-white rounded-full pointer-events-auto hover:scale-110 transition-transform"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass-dark text-white rounded-full pointer-events-auto hover:scale-110 transition-transform"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
              {enableZoom && (
                <>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                aria-label="Toggle info"
              >
                <Info className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handleLike(currentIndex)}
                className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                aria-label="Like image"
              >
                <Heart className={`w-5 h-5 ${isLiked[currentIndex] ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              
              {enableDownload && (
                <button
                  onClick={() => handleDownload(currentImage)}
                  className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                  aria-label="Download image"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => handleShare(currentImage)}
                className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                aria-label="Share image"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {enableFullscreen && !isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                  aria-label="Fullscreen"
                >
                  <Expand className="w-5 h-5" />
                </button>
              )}
              
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
                  aria-label="Exit fullscreen"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Image Info */}
            {showInfo && currentImage.title && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-0 left-0 right-0 p-6 glass-dark text-white pointer-events-auto"
              >
                <h3 className="text-xl font-semibold mb-2">{currentImage.title}</h3>
                {currentImage.description && (
                  <p className="text-sm text-gray-300">{currentImage.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm">
                    {currentIndex + 1} / {images.length}
                  </span>
                  {enableHotspots && currentImage.hotspots && (
                    <button
                      onClick={() => setShowHotspots(!showHotspots)}
                      className="text-sm text-amber-400 hover:text-amber-300"
                    >
                      {showHotspots ? 'Hide' : 'Show'} Hotspots
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && !isFullscreen && (
          <div className={`${
            thumbnailPosition === 'bottom' 
              ? 'mt-4 w-full' 
              : 'w-32 flex-shrink-0'
          }`}>
            <div 
              ref={emblaRef} 
              className={`overflow-hidden ${
                thumbnailPosition === 'bottom' ? '' : 'h-full'
              }`}
            >
              <div className={`flex ${
                thumbnailPosition === 'bottom' 
                  ? 'gap-2' 
                  : 'flex-col gap-2'
              }`}>
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative flex-shrink-0 overflow-hidden transition-all duration-300 ${
                      thumbnailPosition === 'bottom'
                        ? 'w-24 h-16'
                        : 'w-full h-20'
                    } ${
                      currentIndex === index 
                        ? 'ring-2 ring-amber-500 ring-offset-2' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image.src}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      quality={50}
                      className="object-cover"
                      sizes="(max-width: 768px) 80px, 96px"
                    />
                    {currentIndex === index && (
                      <motion.div
                        layoutId="thumbnail-indicator"
                        className="absolute inset-0 bg-gradient-to-t from-amber-500/40 to-transparent"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid View Toggle */}
        {images.length > 4 && !isFullscreen && (
          <button
            className="absolute top-4 left-4 p-2 glass-dark text-white rounded-full hover:scale-110 transition-transform"
            aria-label="Grid view"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  )
}