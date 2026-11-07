"use client"

import { useState, useCallback } from 'react'
import Image from 'next/image'

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

  // A flat black wash dulls the paintwork and still leaves type fighting the
  // photo. These are ink-tinted and weighted towards the edges the copy sits
  // against, so the vehicle keeps its colour and the type keeps its contrast.
  const overlayClasses = {
    light: 'bg-[linear-gradient(to_top,rgba(13,31,45,0.55)_0%,rgba(13,31,45,0.12)_55%,rgba(13,31,45,0)_100%)]',
    dark: 'bg-[linear-gradient(to_top,rgba(13,31,45,0.92)_0%,rgba(13,31,45,0.6)_45%,rgba(13,31,45,0.35)_100%)]',
    // Two scrims multiply, so each is lighter than it would be alone: the
    // vertical one anchors the copy, the horizontal one below guarantees
    // contrast on the left. Copy fills more of a phone frame, so the vertical
    // scrim carries more weight there and eases off at md.
    gradient: 'bg-[linear-gradient(to_top,rgba(13,31,45,0.88)_0%,rgba(13,31,45,0.62)_45%,rgba(13,31,45,0.45)_100%)] md:bg-[linear-gradient(to_top,rgba(13,31,45,0.6)_0%,rgba(13,31,45,0.45)_25%,rgba(13,31,45,0.2)_55%,rgba(13,31,45,0.12)_100%)]'
  }


  return (
    <section className={`relative ${heightClasses[height]} ${className || ''}`}>
      {!failed && (
        <Image
          src={src}
          alt="JTH Horsebox"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
          onError={onError}
          unoptimized
        />
      )}
      <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      {/* The hero copy sits bottom-left, so the left edge carries its own
          scrim. Much of the photography is portrait phone work cropped to a
          landscape frame, which can land pale sky exactly where the heading
          falls; this keeps the type legible whatever the crop, and leaves the
          right of the frame — where the vehicle usually sits — clear. */}
      {overlay === 'gradient' && (
        <div className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,rgba(13,31,45,0.68)_0%,rgba(13,31,45,0.34)_42%,rgba(13,31,45,0)_72%)]" />
      )}
      <div className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center ${heightClasses[height]}`}>
        {children}
      </div>
    </section>
  )
}
