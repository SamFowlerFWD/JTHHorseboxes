"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView, Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Play, Volume2, VolumeX } from 'lucide-react'

interface HeroAdvancedProps {
  title?: string
  subtitle?: string
  description?: string
  primaryCTA?: {
    text: string
    href: string
    variant?: 'solid' | 'glass' | 'outline'
  }
  secondaryCTA?: {
    text: string
    href: string
    variant?: 'solid' | 'glass' | 'outline'
  }
  media?: {
    type: 'image' | 'video'
    src: string
    alt?: string
    poster?: string
  }[]
  overlay?: 'gradient' | 'dark' | 'light' | 'mesh' | 'none'
  height?: 'full' | 'large' | 'medium'
  autoplay?: boolean
  muted?: boolean
  parallax?: boolean
  children?: React.ReactNode
}

const overlayStyles = {
  gradient: 'bg-gradient-to-b from-black/70 via-black/40 to-black/70',
  dark: 'bg-black/60',
  light: 'bg-white/30',
  mesh: 'bg-gradient-to-br from-blue-900/80 via-transparent to-amber-900/40',
  none: ''
}

const heightStyles = {
  full: 'h-screen',
  large: 'h-[85vh] min-h-[700px]',
  medium: 'h-[70vh] min-h-[600px]'
}

export default function HeroAdvanced({
  title = "Premium British Horseboxes",
  subtitle = "3.5t, 4.5t, 7.2t & 7.5t Models",
  description = "Leading UK horsebox manufacturer in Norfolk. Handcrafted luxury horseboxes from £18,500.",
  primaryCTA = { text: "Explore Models", href: "/models" },
  secondaryCTA = { text: "Start Configuring", href: "/configurator" },
  media = [{ type: 'image', src: '/hero.jpg' }],
  overlay = 'gradient',
  height = 'full',
  autoplay = true,
  muted = true,
  parallax = true,
  children
}: HeroAdvancedProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isVideoMuted, setIsVideoMuted] = useState(muted)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.3 })
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', parallax ? '50%' : '0%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.4])
  const scale = useTransform(scrollYProgress, [0, 1], [1, parallax ? 1.2 : 1])

  // Auto-rotate media if multiple items
  useEffect(() => {
    if (media.length > 1 && autoplay) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % media.length)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [media.length, autoplay])

  // Floating animation variants
  const floatingVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Text animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  // Button hover animation
  const buttonVariants: Variants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.98 }
  }

  const toggleVideoSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsVideoMuted(!isVideoMuted)
    }
  }

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section 
      ref={containerRef}
      className={`relative overflow-hidden ${heightStyles[height]}`}
    >
      {/* Background Media */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y, scale }}
      >
        <AnimatePresence mode="wait">
          {media.map((item, index) => (
            index === currentMediaIndex && (
              <motion.div
                key={`media-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.src}
                    alt={item.alt || ''}
                    fill
                    priority={index === 0}
                    quality={90}
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={item.src}
                    poster={item.poster}
                    autoPlay={autoplay}
                    loop
                    muted={isVideoMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Overlay */}
      <motion.div 
        className={`absolute inset-0 ${overlayStyles[overlay]}`}
        style={{ opacity }}
      />

      {/* Gradient Mesh Overlay (Premium Effect) */}
      {overlay === 'mesh' && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-400" />
        </div>
      )}

      {/* Badge - Positioned outside constrained container for perfect viewport centering */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="absolute top-16 z-20"
        style={{ 
          left: '50%',
          x: '-50%' // Use Framer Motion's transform property
        }}
      >
        <motion.span 
          className="inline-flex flex-col items-center gap-6 px-12 py-10 text-white font-medium rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(23, 49, 100, 0.4) 0%, rgba(212, 175, 55, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(23, 49, 100, 0.1)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Image 
            src="/logo.png" 
            alt="JTH Logo" 
            width={320} 
            height={320} 
            className="opacity-95"
          />
          <span className="text-5xl font-semibold">J Taylor Horseboxes</span>
        </motion.span>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {children || (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="max-w-5xl pt-32"
            >

              {/* Title */}
              <motion.h1 
                variants={itemVariants}
                className="text-fluid-5xl md:text-fluid-7xl font-light text-white mb-6 leading-tight"
              >
                {title}
                {subtitle && (
                  <span className="block text-amber-400 mt-2 text-2xl md:text-3xl">{subtitle}</span>
                )}
              </motion.h1>

              {/* Description */}
              <motion.p 
                variants={itemVariants}
                className="text-fluid-lg md:text-fluid-xl text-slate-200 mb-12 max-w-3xl font-light leading-relaxed"
              >
                {description}
              </motion.p>

              {/* CTAs */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap items-center gap-4"
              >
                {primaryCTA && (
                  <Link href={primaryCTA.href}>
                    <motion.button
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      className="group relative inline-flex items-center px-8 py-4 overflow-hidden font-semibold text-white"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="relative flex items-center gap-2">
                        {primaryCTA.text}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                )}
                
                {secondaryCTA && (
                  <Link href={secondaryCTA.href}>
                    <motion.button
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      className="group inline-flex items-center px-8 py-4 glass-light text-white font-semibold hover:bg-white/20 transition-all duration-300"
                    >
                      {secondaryCTA.text}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                )}
              </motion.div>

              {/* Media Controls (for video) */}
              {media.some(m => m.type === 'video') && (
                <motion.div
                  variants={itemVariants}
                  className="absolute bottom-8 right-8 flex gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleVideoPlay}
                    className="p-3 glass-dark text-white rounded-full"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    <Play className={`w-5 h-5 ${isPlaying ? 'hidden' : ''}`} />
                    <span className={`${!isPlaying ? 'hidden' : ''}`}>❚❚</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleVideoSound}
                    className="p-3 glass-dark text-white rounded-full"
                    aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                  >
                    {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex flex-col items-center text-white/70"
        >
          <span className="text-xs uppercase tracking-wider mb-2">Scroll</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </motion.div>
      </motion.div>

      {/* Media Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {media.map((_, index) => (
            <motion.button
              key={`indicator-${index}`}
              onClick={() => setCurrentMediaIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentMediaIndex 
                  ? 'w-8 bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}