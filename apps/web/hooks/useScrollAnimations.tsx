"use client"

import { useEffect, useRef, useState, ReactNode, createContext, useContext } from 'react'
import { useInView, useAnimation, Variants } from 'framer-motion'

// Animation variants library
export const scrollAnimationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  fadeDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  fadeLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  fadeRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  scaleOut: {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  rotateIn: {
    hidden: { opacity: 0, rotate: -10 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  slideInLeft: {
    hidden: { x: '-100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  slideInRight: {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  blurIn: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    }
  },
  
  stagger: {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  springIn: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  },
  
  bounceIn: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
        bounce: 0.5
      }
    }
  }
}

// Custom hook for scroll-triggered animations
interface UseScrollAnimationOptions {
  variant?: keyof typeof scrollAnimationVariants
  threshold?: number
  once?: boolean
  delay?: number
  duration?: number
  customVariants?: Variants
}

export function useScrollAnimation({
  variant = 'fadeUp',
  threshold = 0.2,
  once = true,
  delay = 0,
  duration,
  customVariants
}: UseScrollAnimationOptions = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        controls.start('visible')
      }, delay * 1000)
    } else if (!once) {
      controls.start('hidden')
    }
  }, [isInView, controls, delay, once])

  const variants = customVariants || scrollAnimationVariants[variant]

  return {
    ref,
    controls,
    variants,
    isInView
  }
}

// Parallax scrolling hook
export function useParallaxScroll(speed: number = 0.5) {
  const [scrollY, setScrollY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const elementTop = rect.top
        const elementHeight = rect.height
        
        // Calculate parallax offset
        const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight)
        const offset = scrollProgress * speed * 100
        
        setScrollY(offset)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { ref, scrollY }
}

// Counter animation hook
export function useCountAnimation(
  end: number,
  duration: number = 2,
  start: number = 0,
  decimals: number = 0
) {
  const [count, setCount] = useState(start)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
      const increment = (end - start) / (duration * 60) // 60fps
      let current = start
      
      const timer = setInterval(() => {
        current += increment
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(current)
        }
      }, 1000 / 60)
      
      return () => clearInterval(timer)
    }
  }, [isInView, hasAnimated, start, end, duration])

  const formattedCount = count.toFixed(decimals)
  
  return { ref, count: formattedCount }
}

// Text reveal animation hook
export function useTextReveal(text: string, speed: number = 50) {
  const [revealedText, setRevealedText] = useState('')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
      let currentIndex = 0
      
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setRevealedText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, speed)
      
      return () => clearInterval(interval)
    }
  }, [isInView, hasAnimated, text, speed])

  return { ref, revealedText }
}

// Magnetic hover effect hook
export function useMagneticHover(strength: number = 0.3) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    
    const x = distanceX * strength
    const y = distanceY * strength
    
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength])

  return { ref, x: position.x, y: position.y }
}

// Cursor follow effect hook
export function useCursorFollow() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return { cursorPosition, isHovering, setIsHovering }
}

// Scroll progress hook
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.scrollY
      const scrollProgress = (currentScroll / totalHeight) * 100
      
      setProgress(Math.min(100, Math.max(0, scrollProgress)))
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return progress
}

// Sticky element hook
export function useStickyElement(offset: number = 0) {
  const [isSticky, setIsSticky] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [originalPosition, setOriginalPosition] = useState(0)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const rect = element.getBoundingClientRect()
    setOriginalPosition(rect.top + window.scrollY)
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset
      setIsSticky(scrollPosition >= originalPosition)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [offset])
  
  return { ref, isSticky }
}

// Scroll direction hook
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      
      if (scrollY > lastScrollY) {
        setScrollDirection('down')
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up')
      }
      
      setLastScrollY(scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])
  
  return scrollDirection
}

// Intersection Observer hook for multiple elements
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([])
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)
  
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => setEntries(entries),
      options
    )
    setObserver(obs)
    
    return () => obs.disconnect()
  }, [])
  
  const observe = (element: Element) => {
    observer?.observe(element)
  }
  
  const unobserve = (element: Element) => {
    observer?.unobserve(element)
  }
  
  return { entries, observe, unobserve }
}

// Global scroll animations context
interface ScrollAnimationsContextType {
  scrollY: number
  scrollProgress: number
  scrollDirection: 'up' | 'down' | null
}

const ScrollAnimationsContext = createContext<ScrollAnimationsContextType>({
  scrollY: 0,
  scrollProgress: 0,
  scrollDirection: null
})

export function ScrollAnimationsProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0)
  const scrollProgress = useScrollProgress()
  const scrollDirection = useScrollDirection()
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <ScrollAnimationsContext.Provider value={{ scrollY, scrollProgress, scrollDirection }}>
      {children}
    </ScrollAnimationsContext.Provider>
  )
}

export function useScrollAnimationsContext() {
  return useContext(ScrollAnimationsContext)
}