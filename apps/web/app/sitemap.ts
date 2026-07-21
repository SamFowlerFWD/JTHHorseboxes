import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jthltd.co.uk'
  const now = new Date()

  // Model slugs (canonical versions only, no jth- prefix duplicates)
  const modelSlugs = [
    'professional-35',
    'principle-35',
    'progeny-35',
    'aeos-edge-45',
    'aeos-freedom-45',
    'aeos-discovery-45',
    'aeos-edge-st-45',
    'aeos-discovery-72',
    'helios-75',
    'jth-principle-45',
    'jth-professional-45',
    'jth-progeny-45',
  ]

  // Ireland-specific model slugs
  const irelandModelSlugs = [
    'principle-35',
    'professional-35',
  ]

  // Core pages
  const corePages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/coat-x`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/showcase`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]

  // Ireland pages
  const irelandPages = [
    {
      url: 'https://jthltd.ie',
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://jthltd.ie/ireland/in-stock',
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    ...irelandModelSlugs.map(slug => ({
      url: `https://jthltd.ie/ireland/models/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  // UK model pages
  const modelPages = modelSlugs.map(slug => ({
    url: `${baseUrl}/models/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Legal pages
  const legalPages = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  return [
    ...corePages,
    ...irelandPages,
    ...modelPages,
    ...legalPages,
  ]
}
