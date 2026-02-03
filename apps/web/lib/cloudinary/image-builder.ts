/**
 * Configurator preview URL builder.
 * Placeholder implementation - returns static model images.
 * Replace with Cloudinary integration when image assets are ready.
 */

interface PreviewConfig {
  modelId: string
  selectedOptions: Array<{ id: string; category: string }>
  angle: string
}

interface ImageOptions {
  width?: number
  height?: number
  quality?: string
}

export function buildConfiguratorPreviewUrl(
  config: PreviewConfig,
  options?: ImageOptions
): string {
  // Return a static model image based on the model ID
  const modelSlug = config.modelId.toLowerCase().replace(/\s+/g, '-')
  return `/models/${modelSlug}/01.webp`
}

export function getPlaceholderUrl(modelId: string): string {
  const modelSlug = modelId.toLowerCase().replace(/\s+/g, '-')
  return `/models/${modelSlug}/01.webp`
}
