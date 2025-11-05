import { CLOUDINARY_CONFIG, CLOUDINARY_FOLDERS, DEFAULT_TRANSFORMATIONS } from './config'

export interface ImageLayer {
  publicId: string
  folder?: string
  opacity?: number
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west'
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}

export interface BuildImageUrlOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  quality?: string | number
  format?: string
  angle?: number
  gravity?: string
  effect?: string
}

/**
 * Build a Cloudinary URL for a single image
 */
export function buildImageUrl(
  publicId: string,
  options: BuildImageUrlOptions = {}
): string {
  if (!CLOUDINARY_CONFIG.cloud_name) {
    console.warn('Cloudinary cloud name not configured')
    return `/placeholder-horsebox.jpg` // Fallback to local placeholder
  }

  const {
    width,
    height,
    crop = 'fit',
    quality = DEFAULT_TRANSFORMATIONS.quality,
    format = DEFAULT_TRANSFORMATIONS.fetch_format,
    angle,
    gravity,
    effect,
  } = options

  // Build transformation string
  const transformations = []

  if (width || height) {
    const sizeParams = []
    if (width) sizeParams.push(`w_${width}`)
    if (height) sizeParams.push(`h_${height}`)
    sizeParams.push(`c_${crop}`)
    transformations.push(sizeParams.join(','))
  }

  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)
  if (angle) transformations.push(`a_${angle}`)
  if (gravity) transformations.push(`g_${gravity}`)
  if (effect) transformations.push(`e_${effect}`)

  const transformString = transformations.length > 0 ? transformations.join('/') + '/' : ''

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/${transformString}${publicId}`
}

/**
 * Build a layered Cloudinary URL with multiple overlays
 * Perfect for configurator preview with base model + selected options
 */
export function buildLayeredImageUrl(
  baseImage: ImageLayer,
  overlays: ImageLayer[] = [],
  options: BuildImageUrlOptions = {}
): string {
  if (!CLOUDINARY_CONFIG.cloud_name) {
    console.warn('Cloudinary cloud name not configured')
    return `/placeholder-horsebox.jpg`
  }

  const {
    width = 1200,
    height = 800,
    crop = 'fit',
    quality = DEFAULT_TRANSFORMATIONS.quality,
    format = DEFAULT_TRANSFORMATIONS.fetch_format,
  } = options

  // Start with base transformations
  const transformations = []

  // Base size and crop
  transformations.push(`w_${width},h_${height},c_${crop}`)

  // Quality and format
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  // Add overlay transformations
  overlays.forEach((overlay) => {
    const overlayParams = []

    // Layer identifier
    const layerPath = overlay.folder
      ? `${overlay.folder}:${overlay.publicId}`
      : overlay.publicId

    overlayParams.push(`l_${layerPath.replace(/\//g, ':')}`)

    // Layer transformations
    if (overlay.opacity !== undefined) {
      overlayParams.push(`o_${overlay.opacity}`)
    }

    if (overlay.width || overlay.height) {
      const layerSize = []
      if (overlay.width) layerSize.push(`w_${overlay.width}`)
      if (overlay.height) layerSize.push(`h_${overlay.height}`)
      overlayParams.push(layerSize.join(','))
    }

    if (overlay.gravity) {
      overlayParams.push(`g_${overlay.gravity}`)
    }

    if (overlay.x !== undefined || overlay.y !== undefined) {
      const position = []
      if (overlay.x !== undefined) position.push(`x_${overlay.x}`)
      if (overlay.y !== undefined) position.push(`y_${overlay.y}`)
      overlayParams.push(position.join(','))
    }

    overlayParams.push('fl_layer_apply')

    transformations.push(overlayParams.join(','))
  })

  const transformString = transformations.join('/')
  const baseImagePath = baseImage.folder
    ? `${baseImage.folder}/${baseImage.publicId}`
    : baseImage.publicId

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/${transformString}/${baseImagePath}`
}

/**
 * Build configurator preview URL based on selected model and options
 */
export interface ConfiguratorSelection {
  modelId: string
  selectedOptions: Array<{
    id: string
    category?: string
  }>
  angle?: '3-4-front' | 'side' | '3-4-rear' | 'front' | 'rear'
}

export function buildConfiguratorPreviewUrl(
  selection: ConfiguratorSelection,
  options: BuildImageUrlOptions = {}
): string {
  const { modelId, selectedOptions, angle = '3-4-front' } = selection

  // Base model image
  const baseImage: ImageLayer = {
    publicId: `${modelId}_${angle}_base`,
    folder: CLOUDINARY_FOLDERS.models,
  }

  // Build overlays from selected options
  const overlays: ImageLayer[] = selectedOptions.map((option) => ({
    publicId: `${modelId}_${angle}_${option.id}`,
    folder: CLOUDINARY_FOLDERS.options,
    opacity: 100,
    gravity: 'center',
  }))

  return buildLayeredImageUrl(baseImage, overlays, {
    width: 1200,
    height: 800,
    crop: 'fit',
    ...options,
  })
}

/**
 * Get placeholder image URL while assets are loading
 */
export function getPlaceholderUrl(modelId?: string): string {
  if (!modelId || !CLOUDINARY_CONFIG.cloud_name) {
    return '/placeholder-horsebox.jpg'
  }

  return buildImageUrl(`${CLOUDINARY_FOLDERS.models}/${modelId}_3-4-front_base`, {
    width: 1200,
    height: 800,
    quality: 'auto:low',
    effect: 'blur:1000',
  })
}

/**
 * Generate srcset for responsive images
 */
export function buildResponsiveSrcSet(
  publicId: string,
  sizes: number[] = [640, 768, 1024, 1280, 1536]
): string {
  return sizes
    .map((width) => {
      const url = buildImageUrl(publicId, { width, quality: 'auto:good' })
      return `${url} ${width}w`
    })
    .join(', ')
}
