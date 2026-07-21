const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev')

/**
 * Legacy WordPress (jthltd.co.uk) -> Next.js redirect map.
 *
 * Keys are the legacy paths WITHOUT a trailing slash. Next.js compiles each
 * source to a regex with an optional trailing slash (`(?:/)?$`), so a single
 * entry matches both `/foo` and `/foo/` — no duplicate entries needed.
 *
 * NOTE: `/contact/` and `/privacy-policy/` are deliberately absent. Those paths
 * are unchanged in the new site, so an explicit rule would be a self-redirect
 * loop. Next's built-in trailing-slash normalisation (trailingSlash: false)
 * already 308s `/contact/` -> `/contact`.
 *
 * These are static config redirects (Vercel Build Output API routes), which
 * @cloudflare/next-on-pages supports natively. Do NOT move them to middleware.
 */
const legacyRedirects = {
  // --- Model pages with a direct 1:1 equivalent ---
  '/aeos-edge-45-horsebox': '/models/aeos-edge-45',
  '/aeos-edge-st-45-horsebox': '/models/aeos-edge-st-45',
  '/aeos-freedom-45-horsebox': '/models/aeos-freedom-45',
  '/aeos-discovery-45-horsebox': '/models/aeos-discovery-45',
  '/aeos-discovery-72-horsebox': '/models/aeos-discovery-72',
  '/helios-75-horsebox': '/models/helios-75',
  '/aeos-3-5-tonne-horseboxes/jth-35-principle': '/models/principle-35',
  '/aeos-3-5-tonne-horseboxes/jth-35-professional': '/models/professional-35',

  // --- Discontinued models: no content page exists, fall back to the range ---
  // aeos-qv-45 / aeos-qv-st-45 / aeos-freedom-st-45 appear in pricing.json but
  // have no entry in modelContent, so /models/<slug> would 404.
  '/aeos-qv-45-horsebox': '/models',
  '/aeos-qv-st-45-horsebox': '/models',
  '/aeos-freedom-st-45-horsebox': '/models',
  '/aeos-3-5-tonne-horseboxes/qv-3-5': '/models',
  '/helios-compact-75-horseboxes': '/models',

  // Helios HGV: only one Helios exists now (7.5t, HGV-class licence).
  '/helios-hgv': '/models/helios-75',

  // --- Category / range pages ---
  '/aeos-3-5-tonne-horseboxes': '/models',
  '/aeos-4-5-tonne-horseboxes': '/models',
  '/helios-7-5-tonne-horseboxes': '/models',

  // --- Company / informational pages ---
  '/about-jth': '/about',
  '/kph-information': '/about',
  '/kph-transition': '/about',
  '/coming-soon': '/',

  // No finance page in the new site; finance enquiries route through contact.
  '/horsebox-finance': '/contact',

  // No eco range in the new site.
  '/jth-eco': '/models',

  // --- Editorial / advice pages ---
  // The new /blog is literally titled "Horsebox Advice & Tips".
  '/horsebox-advice': '/blog',
  '/horse-safety-first': '/blog',
  // Buying-guide intent -> the range it was guiding towards.
  '/picking-the-right-horsebox': '/models',
}

/**
 * Legacy blog posts (19).
 *
 * PLACEHOLDER: the new /blog has no migrated posts, so every post collapses to
 * the blog index. This preserves link equity into the domain but loses all
 * topical relevance — these URLs rank for specific long-tail queries and the
 * many-to-one mapping is liable to be treated as a soft 404 by search engines.
 * REVISIT once posts are migrated: point each legacy slug at its real
 * /blog/<slug>.
 */
const legacyBlogPosts = [
  '/horsebox-durability',
  '/horsebox-load-height',
  '/horsebox-dog-gates',
  '/horse-transport-stress',
  '/horse-heat-and-ventilation',
  '/horsebox-ramp-grip',
  '/horsebox-strength',
  '/horses-hearing',
  '/horses-and-vibration',
  '/problematic-horses',
  '/horsebox-safety-checks',
  '/before-you-buy-a-horsebox',
  '/horsebox-air-brakes',
  '/the-first-horsebox-a-tale-of-guile-invention-and-ingenuity',
  '/horses-vision',
  '/horsebox-passenger-seatbelts',
  '/horsebox-payloads',
  '/horsebox-ventilation',
  '/horsebox-aluminium',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare Pages doesn't support next/image optimization natively;
    // use unoptimized images (Cloudflare Images or a loader can be added later)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  async redirects() {
    return [
      ...Object.entries(legacyRedirects).map(([source, destination]) => ({
        source,
        destination,
        statusCode: 301,
      })),
      ...legacyBlogPosts.map((source) => ({
        source,
        destination: '/blog',
        statusCode: 301,
      })),
    ]
  },
}

// Enable Cloudflare bindings in local dev (e.g. KV, D1)
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(() => {
    // Cloudflare dev platform setup is optional in local dev
  })
}

module.exports = nextConfig
