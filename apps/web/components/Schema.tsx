import Script from 'next/script'

interface SchemaProps {
  schema: Record<string, any> | Record<string, any>[]
}

export default function Schema({ schema }: SchemaProps) {
  return (
    <Script
      id="schema-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
      strategy="beforeInteractive"
    />
  )
}

// Reusable schema generators
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://jthltd.co.uk/#organization",
  "name": "J Taylor Horseboxes",
  "alternateName": ["JTH Horseboxes", "JTH", "J Taylor Horseboxes Ltd"],
  "url": "https://jthltd.co.uk",
  "logo": "https://jthltd.co.uk/logo.png",
  "description": "Leading British horsebox manufacturer specializing in premium 3.5t, 4.5t & 7.2t horseboxes. Based in Norfolk with 30+ years experience.",
  "foundingDate": "1993",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Beeston",
    "addressLocality": "Norfolk",
    "addressCountry": "GB",
    "postalCode": "NR12"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+44-1603-552109",
    "contactType": "sales",
    "areaServed": ["GB", "IE"],
    "availableLanguage": "English"
  },
  "sameAs": [
    "https://www.facebook.com/JTHHorseboxes",
    "https://www.instagram.com/jthhorseboxes"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  }
}

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "J Taylor Horseboxes Showroom",
  "image": "https://jthltd.co.uk/showroom.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Beeston",
    "addressLocality": "Norfolk",
    "addressRegion": "Norfolk",
    "postalCode": "NR12",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 52.7598,
    "longitude": 1.2152
  },
  "url": "https://jthltd.co.uk",
  "telephone": "+441603552109",
  "priceRange": "£££",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "16:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "00:00",
      "closes": "00:00",
      "description": "By appointment only"
    }
  ],
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 52.7598,
      "longitude": 1.2152
    },
    "geoRadius": "300000"
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  price: number
  sku: string
  category?: string
  brand?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "Vehicle"],
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "JTH Horseboxes"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "J Taylor Horseboxes",
      "url": "https://jthltd.co.uk"
    },
    "category": product.category || "Horsebox",
    "vehicleConfiguration": "Horsebox",
    "vehicleSpecialUsage": "Horse Transportation",
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "GBP",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "J Taylor Horseboxes"
      },
      "warranty": "2 years structural warranty"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "42"
    }
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

export function generateServiceSchema(service: {
  name: string
  description: string
  provider?: string
  areaServed?: string[]
  serviceType?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": service.provider || "J Taylor Horseboxes",
      "url": "https://jthltd.co.uk"
    },
    "areaServed": service.areaServed || ["GB", "IE"],
    "serviceType": service.serviceType || "Horsebox Manufacturing",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Horsebox Models",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "3.5 Tonne Horseboxes"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "4.5 Tonne Horseboxes"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "7.2 Tonne Horseboxes"
          }
        }
      ]
    }
  }
}

export function generateVideoSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  embedUrl?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.name,
    "description": video.description,
    "thumbnailUrl": video.thumbnailUrl,
    "uploadDate": video.uploadDate,
    "duration": video.duration || "PT5M",
    "embedUrl": video.embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": "J Taylor Horseboxes",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jthltd.co.uk/logo.png"
      }
    }
  }
}

export function generateReviewSchema(review: {
  author: string
  reviewBody: string
  reviewRating: number
  datePublished: string
  itemReviewed: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewBody": review.reviewBody,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.reviewRating,
      "bestRating": 5,
      "worstRating": 1
    },
    "datePublished": review.datePublished,
    "itemReviewed": {
      "@type": "Product",
      "name": review.itemReviewed,
      "brand": {
        "@type": "Brand",
        "name": "JTH Horseboxes"
      }
    }
  }
}

export function generateEventSchema(event: {
  name: string
  description: string
  startDate: string
  endDate: string
  location: {
    name: string
    address: string
  }
  organizer?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "Place",
      "name": event.location.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.location.address
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer || "J Taylor Horseboxes",
      "url": "https://jthltd.co.uk"
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  }
}

export function generateArticleSchema(article: {
  headline: string
  description: string
  datePublished: string
  dateModified: string
  image: string
  author: string
  publisher: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": article.image,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": article.publisher,
      "logo": {
        "@type": "ImageObject",
        "url": "https://jthltd.co.uk/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://jthltd.co.uk"
    }
  }
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://jthltd.co.uk/#website",
  "url": "https://jthltd.co.uk",
  "name": "JTH Horseboxes",
  "description": "Leading British horsebox manufacturer specializing in 3.5t, 4.5t & 7.2t luxury horseboxes",
  "publisher": {
    "@id": "https://jthltd.co.uk/#organization"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://jthltd.co.uk/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "en-GB"
}