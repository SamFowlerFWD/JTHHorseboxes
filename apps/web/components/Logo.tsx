"use client"

import Image from 'next/image'
import { useCallback, useState } from 'react'

type LogoProps = {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export default function Logo({ className, width = 160, height = 44, priority }: LogoProps) {
  const [src, setSrc] = useState('/logo.png')
  const handleError = useCallback(() => setSrc('/logo.jpg'), [])

  return (
    <Image
      src={src}
      alt="J Taylor Horseboxes"
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={priority}
    />
  )
}
