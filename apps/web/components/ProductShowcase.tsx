"use client"

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Award,
  Eye,
  Heart,
  Share2
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProductFeature {
  label: string
  value: string
  icon?: React.ReactNode
}

interface ProductSpec {
  category: string
  items: Array<{
    label: string
    value: string
  }>
}

interface Product {
  id: string
  title: string
  subtitle?: string
  description: string
  price: string
  priceNote?: string
  images: string[]
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  rating?: number
  reviews?: number
  features: ProductFeature[]
  specifications?: ProductSpec[]
  availability?: 'In Stock' | 'Pre-Order' | 'Sold Out' | 'Limited'
  deliveryTime?: string
  warranty?: string
}

interface ProductShowcaseProps {
  products: Product[]
  layout?: 'grid' | 'carousel' | 'featured' | 'comparison'
  showFilters?: boolean
  className?: string
}

export default function ProductShowcase({
  products,
  layout = 'grid',
  showFilters = false,
  className = ''
}: ProductShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
  const [selectedImageIndex, setSelectedImageIndex] = useState<{ [key: string]: number }>({})
  
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.2 })

  const handleLike = (productId: string) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleShare = async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: `/models/${product.id}`
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
  }

  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const isHovered = hoveredProduct === product.id
    const isLiked = likedProducts.has(product.id)
    const currentImageIndex = selectedImageIndex[product.id] || 0
    
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useSpring(0, { stiffness: 500, damping: 100 })
    const mouseY = useSpring(0, { stiffness: 500, damping: 100 })
    
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10])
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const x = (e.clientX - centerX) / rect.width
      const y = (e.clientY - centerY) / rect.height
      
      mouseX.set(x)
      mouseY.set(y)
    }
    
    const handleMouseLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }

    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        whileHover={{ y: -8 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setHoveredProduct(product.id)}
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: 'preserve-3d'
        }}
        className="group relative bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 rounded-lg"
      >
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-20">
            <Badge 
              variant={product.badge.variant}
              className="px-3 py-1 font-semibold shadow-lg"
            >
              {product.badge.text}
            </Badge>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLike(product.id)}
            className="p-2 glass-light rounded-full hover:bg-white/80"
            aria-label="Like product"
          >
            <Heart className={`w-5 h-5 ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'
            }`} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleShare(product)}
            className="p-2 glass-light rounded-full hover:bg-white/80"
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5 text-slate-600" />
          </motion.button>
        </div>

        {/* Image Container */}
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={product.images[currentImageIndex]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Gradient Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
          </motion.div>

          {/* Image Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex({ 
                    ...selectedImageIndex, 
                    [product.id]: idx 
                  })}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex 
                      ? 'w-6 bg-white' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* View Details Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-4 left-4 right-4 z-10"
          >
            <Link href={`/models/${product.id}`}>
              <Button className="w-full glass-dark text-white hover:bg-black/80">
                <Eye className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Price */}
          <div className="mb-4">
            <h3 className="text-xl font-light text-slate-900 mb-1">
              {product.title}
            </h3>
            {product.subtitle && (
              <p className="text-sm text-slate-500">{product.subtitle}</p>
            )}
            
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-semibold text-blue-700">
                {product.price}
              </span>
              {product.priceNote && (
                <span className="text-sm text-slate-500">{product.priceNote}</span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  {product.rating} ({product.reviews || 0} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-4">
            {product.features.slice(0, 3).map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isHovered ? 1 : 0.8, x: isHovered ? 0 : -5 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 text-blue-700 flex-shrink-0">
                  {feature.icon || <Check className="w-4 h-4" />}
                </div>
                <span className="text-sm text-slate-700">
                  <span className="font-medium">{feature.label}:</span> {feature.value}
                </span>
              </motion.div>
            ))}
            
            {product.features.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-sm text-blue-700 hover:text-blue-800 font-medium">
                      +{product.features.length - 3} more features
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {product.features.slice(3).map((feature, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{feature.label}:</span> {feature.value}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Availability & Delivery */}
          {(product.availability || product.deliveryTime) && (
            <div className="flex items-center justify-between text-sm mb-4">
              {product.availability && (
                <Badge 
                  variant={
                    product.availability === 'In Stock' ? 'default' :
                    product.availability === 'Limited' ? 'secondary' :
                    product.availability === 'Sold Out' ? 'destructive' :
                    'outline'
                  }
                  className="font-medium"
                >
                  {product.availability}
                </Badge>
              )}
              {product.deliveryTime && (
                <span className="text-slate-500">
                  <Zap className="w-3 h-3 inline mr-1" />
                  {product.deliveryTime}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/models/${product.id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-medium">
                View Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/configurator/${product.id}`}>
              <Button variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-50">
                <Sparkles className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Warranty */}
          {product.warranty && (
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
              <Shield className="w-3 h-3" />
              {product.warranty}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Different layout renderers
  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )

  const renderFeatured = () => {
    const [featuredProduct, ...otherProducts] = products
    
    return (
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Featured Product */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="relative"
        >
          <div className="sticky top-24">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={featuredProduct.images[0]}
                alt={featuredProduct.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <Badge className="mb-4 bg-amber-500 text-white">
                  Featured Model
                </Badge>
                <h2 className="text-3xl font-light mb-2">{featuredProduct.title}</h2>
                <p className="text-lg mb-4 text-white/90">{featuredProduct.description}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold">{featuredProduct.price}</span>
                  {featuredProduct.priceNote && (
                    <span className="text-sm text-white/70">{featuredProduct.priceNote}</span>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Link href={`/models/${featuredProduct.id}`}>
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                      Explore Model
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href={`/configurator/${featuredProduct.id}`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Configure
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Feature List */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {featuredProduct.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-md"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                    {feature.icon || <Check className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{feature.label}</div>
                    <div className="font-medium text-slate-900">{feature.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Other Products */}
        <div className="space-y-6">
          {otherProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index + 1} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={className}>
      {/* Filters (if enabled) */}
      {showFilters && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="font-medium"
          >
            All Models
          </Button>
          <Button
            variant={selectedCategory === '3.5t' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('3.5t')}
            className="font-medium"
          >
            3.5 Tonne
          </Button>
          <Button
            variant={selectedCategory === '4.5t' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('4.5t')}
            className="font-medium"
          >
            4.5 Tonne
          </Button>
          <Button
            variant={selectedCategory === '7.2t' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('7.2t')}
            className="font-medium"
          >
            7.2 Tonne
          </Button>
        </div>
      )}

      {/* Products Display */}
      {layout === 'grid' && renderGrid()}
      {layout === 'featured' && renderFeatured()}
    </div>
  )
}