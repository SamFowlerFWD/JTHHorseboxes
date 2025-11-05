/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization for VPS without sharp
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}

module.exports = nextConfig
