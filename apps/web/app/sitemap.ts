import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jthltd.co.uk'

  // Model slugs that have pages via the dynamic [slug] route
  const modelSlugs = [
    'professional-35',
    'principle-35',
    'progeny-35',
    'aeos-edge-45',
    'aeos-freedom-45',
    'aeos-discovery-45',
    'aeos-edge-st-45',
    'zenos-72',
    'jth-professional-35',
    'jth-principle-35',
    'jth-progeny-35',
  ]

  // Core pages that have matching page.tsx files
  const corePages = [
    {
      url: baseUrl,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/showcase`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ireland`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Individual model pages (served by the dynamic [slug] route)
  const modelPages = modelSlugs.map(slug => ({
    url: `${baseUrl}/models/${slug}`,
    lastModified: new Date('2025-01-15'),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Legal pages
  const legalPages = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  return [
    ...corePages,
    ...modelPages,
    ...legalPages,
  ]
}
