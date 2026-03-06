const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev')

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
}

// Enable Cloudflare bindings in local dev (e.g. KV, D1)
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(() => {
    // Cloudflare dev platform setup is optional in local dev
  })
}

module.exports = nextConfig
