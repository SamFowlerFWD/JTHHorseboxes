// Region-aware pricing hook for configurator components

'use client'

import { useState, useEffect } from 'react'
import { type Region, type RegionConfig, getRegionConfig, getRegionFromCookie } from './region'

/**
 * Returns the current region and its config.
 * Reads the cookie on mount; defaults to 'GB' during SSR.
 */
export function useRegionPricing(): { region: Region; config: RegionConfig } {
  const [region, setRegion] = useState<Region>('GB')

  useEffect(() => {
    setRegion(getRegionFromCookie())
  }, [])

  return { region, config: getRegionConfig(region) }
}
