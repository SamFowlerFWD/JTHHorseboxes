
### Comprehensive SEO Implementation Guide for J Taylor Horseboxes (2025)

This guide translates the provided SEO plan into concrete tasks, code, and measurement. It reflects 2024–2025 Google updates with emphasis on people-first content, E‑E‑A‑T, and Core Web Vitals.

## 1) Technical SEO with Next.js 14
- Headers, rewrites, sitemap, robots endpoints
- Image pipeline (AVIF/WebP, responsive sizes)
- Metadata via `generateMetadata`

Code snippets:

```ts
// app/api/sitemap/route.ts
import { NextResponse } from 'next/server'
export async function GET() {
  const urls = [
    '/',
    '/horseboxes/3-5-tonne',
    '/horseboxes/4-5-tonne',
    '/horseboxes/7-2-tonne',
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map(u => `<url><loc>https://jthltd.co.uk${u}</loc></url>`) 
    .join('')}</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}
```

```ts
// app/api/robots/route.ts
import { NextResponse } from 'next/server'
export async function GET() {
  const body = `User-agent: *\nAllow: /\nSitemap: https://jthltd.co.uk/sitemap.xml\n`
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } })
}
```

```ts
// app/(site)/horseboxes/[model]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.model)
  return {
    title: `${product.name} | Custom ${product.weight} Horseboxes | JTH`,
    description: product.seoDescription,
    openGraph: { images: [product.heroImage], type: 'product' },
    alternates: { canonical: `https://jthltd.co.uk/horseboxes/${params.model}` },
    other: { 'product:price:amount': product.price, 'product:price:currency': 'GBP' },
  }
}
```

## 2) Schema Markup
- Product + Vehicle, FAQPage, Organization, Review/AggregateRating
- Render via `Schema` component with `schema-dts`

```tsx
// components/Schema.tsx
import { WithContext, Product, Vehicle } from 'schema-dts'
export function Schema({ schema }: { schema: WithContext<Product | Vehicle> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
```

## 3) Content & E‑E‑A‑T
- Author profiles, credentials, manufacturing process pages
- Case studies with before/after galleries and testimonials
- Editorial guidelines and review dates

Checklist:
- [ ] Author pages with Organization schema
- [ ] Review schema on testimonials
- [ ] Last reviewed dates, editor names

## 4) Local SEO (UK focus)
- GBP optimization, NAP consistency, local citations
- Location page with driving directions, service area schema

## 5) Core Web Vitals targets
- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Techniques: Preload hero image/font, lazy-load below-fold, code-split configurator

```tsx
<link rel="preload" as="image" href="/hero-horsebox.webp" />
<link rel="preload" as="font" href="/fonts/inter.woff2" />
```

## 6) Configurator SEO
- `Product` schema for presets; `hasVariant` for common builds
- Canonical URLs for shared configurations; block private share tokens

## 7) Internationalization (UK/IE)
- `i18n` config with domains, hreflang tags

## 8) Analytics & Monitoring
- Plausible events: configurator_started, option_selected, configuration_completed, quote_requested
- GSC, Rich Results Test, Lighthouse CI in CI pipeline

## 9) Image SEO
- Naming: `premium-xl-3-5-tonne-silver-front-1200x800.webp`
- Alt text policy focused on scene and feature description

## 10) Roadmap & KPIs
- 0–2 months: technical + schema complete
- 3–4 months: content hubs + backlinks
- 5–6 months: video + international roll-out

KPIs: 60% organic growth in 6 months; 40–60% impressions with rich snippets; top 3 local pack for primary terms.
