import type { Metadata } from 'next'

// SEO constants
export const SITE_NAME = 'JTH Horseboxes'
export const SITE_URL = 'https://jthltd.co.uk'
export const SITE_DESCRIPTION = 'Leading British horsebox manufacturer in Norfolk. Premium 3.5t, 4.5t & 7.2t horseboxes from £18,500.'

// Common keywords for different page types
export const KEYWORDS = {
  general: [
    '3.5t horsebox',
    '3.5 tonne horsebox', 
    '4.5t horsebox',
    '4.5 tonne horsebox',
    '7.2t horsebox', 
    '7.2 tonne horsebox',
    'British horsebox manufacturer',
    'luxury horsebox UK',
    'horsebox for sale Norfolk',
    'custom horsebox builder UK',
    'JTH horseboxes',
    'J Taylor Horseboxes',
    'horse lorry UK',
    'equine transport'
  ],
  models: {
    '35t': [
      '3.5 tonne horsebox',
      '3.5t horsebox for sale',
      'lightweight horsebox',
      'car license horsebox',
      'two horse horsebox',
      'small horsebox UK'
    ],
    '45t': [
      '4.5 tonne horsebox',
      '4.5t horsebox for sale',
      'medium horsebox',
      'C1 license horsebox',
      'three horse horsebox',
      'family horsebox'
    ],
    '72t': [
      '7.2 tonne horsebox',
      '7.2t horsebox for sale',
      'large horsebox',
      'luxury horsebox',
      'professional horsebox',
      'competition horsebox'
    ]
  },
  local: [
    'horsebox Norfolk',
    'horsebox East Anglia',
    'horsebox manufacturer Norwich',
    'horsebox showroom Norfolk',
    'horsebox dealer UK',
    'horsebox sales England'
  ],
  competitors: [
    'JTH vs Bloomfields',
    'JTH vs Stephex',
    'JTH vs Owens',
    'JTH vs Central England',
    'best UK horsebox manufacturer',
    'premium horsebox builder'
  ]
}

// Generate page-specific metadata
export function generatePageMetadata(options: {
  title: string
  description: string
  keywords?: string[]
  path?: string
  image?: string
  noindex?: boolean
}): Metadata {
  const { title, description, keywords = [], path = '', image, noindex = false } = options
  const url = `${SITE_URL}${path}`
  
  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`
    },
    description,
    keywords: [...KEYWORDS.general, ...keywords].join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_GB',
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
    robots: noindex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Generate JSON-LD structured data for articles/blog posts
export function generateArticleSchema(article: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": `${SITE_URL}/about/team#${article.author.toLowerCase().replace(/\s+/g, '-')}`
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "image": article.image || `${SITE_URL}/og-image.jpg`
  }
}

// Generate sitemap entry
export function generateSitemapEntry(options: {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}) {
  return {
    url: options.url,
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency || 'weekly',
    priority: options.priority || 0.5,
  }
}

// Generate hreflang tags for international SEO
export function generateHreflangTags(path: string) {
  return {
    'en-GB': `${SITE_URL}${path}`,
    'en-IE': `https://jthltd.ie${path}`,
    'x-default': `${SITE_URL}${path}`,
  }
}

// Generate meta tags for social media
export function generateSocialMetaTags(options: {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'product'
}) {
  return {
    openGraph: {
      title: options.title,
      description: options.description,
      type: options.type || 'website',
      images: options.image ? [
        {
          url: options.image,
          width: 1200,
          height: 630,
          alt: options.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: options.image ? [options.image] : [],
      creator: '@jthhorseboxes',
      site: '@jthhorseboxes',
    },
  }
}

// Helper to generate model-specific keywords
export function getModelKeywords(modelSlug: string): string[] {
  const baseKeywords = []
  
  if (modelSlug.includes('35')) {
    baseKeywords.push(...KEYWORDS.models['35t'])
  } else if (modelSlug.includes('45')) {
    baseKeywords.push(...KEYWORDS.models['45t'])
  } else if (modelSlug.includes('72')) {
    baseKeywords.push(...KEYWORDS.models['72t'])
  }
  
  // Add model-specific keywords
  const modelSpecific: Record<string, string[]> = {
    'professional-35': ['professional horsebox', 'luxury 3.5t horsebox', 'competition horsebox'],
    'principle-35': ['affordable horsebox', 'value horsebox', 'entry level horsebox'],
    'progeny-35': ['premium horsebox', 'pioneer package', 'top spec horsebox'],
    'aeos-edge-45': ['professional 4.5t', 'competition ready', 'edge horsebox'],
    'aeos-freedom-45': ['family horsebox', 'versatile horsebox', 'freedom horsebox'],
    'aeos-discovery-45': ['luxury living horsebox', 'apartment horsebox', 'discovery horsebox'],
    'zenos-72': ['flagship horsebox', 'ultimate horsebox', 'luxury 7.2t horsebox'],
  }
  
  if (modelSpecific[modelSlug]) {
    baseKeywords.push(...modelSpecific[modelSlug])
  }
  
  return baseKeywords
}

// Helper to generate location-based title variations
export function generateLocationTitle(baseTitle: string, location?: string): string {
  const locations = location ? [location] : ['Norfolk', 'East Anglia', 'UK']
  return `${baseTitle} | ${locations.join(' | ')}`
}

// Helper to generate comparison content
export function generateComparisonKeywords(): string[] {
  return [
    'JTH vs Bloomfields horseboxes',
    'JTH vs Stephex comparison',
    'JTH vs Owens horsebox review',
    'best UK horsebox manufacturer 2025',
    'compare horsebox builders UK',
    'horsebox manufacturer comparison',
    'which horsebox brand is best',
    'top rated horsebox companies UK'
  ]
}

// Helper for long-tail keywords
export function generateLongTailKeywords(model: string): string[] {
  return [
    `how much does a ${model} horsebox cost`,
    `${model} horsebox finance options`,
    `${model} horsebox for sale near me`,
    `best ${model} horsebox UK`,
    `${model} horsebox reviews`,
    `${model} horsebox specifications`,
    `${model} horsebox warranty`,
    `custom ${model} horsebox builder`,
    `${model} horsebox delivery time`,
    `${model} horsebox insurance cost`
  ]
}