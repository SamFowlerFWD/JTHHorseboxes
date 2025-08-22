"use client"

import { useState, useCallback } from 'react'

type HeroProps = {
  primarySrc: string
  fallbackSrc?: string
  children?: React.ReactNode
  className?: string
  overlay?: 'light' | 'dark' | 'gradient'
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function Hero({ 
  primarySrc, 
  fallbackSrc, 
  children, 
  className,
  overlay = 'gradient',
  height = 'lg'
}: HeroProps) {
  const [src, setSrc] = useState(primarySrc)
  const [failed, setFailed] = useState(false)

  const onError = useCallback(() => {
    if (fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc)
    } else {
      setFailed(true)
    }
  }, [fallbackSrc, src])

  const heightClasses = {
    sm: 'h-[40vh] min-h-[350px]',
    md: 'h-[50vh] min-h-[400px]',
    lg: 'h-[70vh] min-h-[500px]',
    xl: 'h-[85vh] min-h-[600px]',
    full: 'h-screen'
  }

  const overlayClasses = {
    light: 'bg-black/20',
    dark: 'bg-black/50',
    gradient: 'bg-gradient-to-b from-black/60 via-black/40 to-black/60'
  }

  return (
    <section className={`relative ${heightClasses[height]} ${className || ''}`}>
      {!failed && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={onError}
        />
      )}
      <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      <div className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center ${heightClasses[height]}`}>
        {children}
      </div>
    </section>
  )
}
