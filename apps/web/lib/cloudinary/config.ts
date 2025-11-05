import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
}

// Configure Cloudinary (server-side only)
if (typeof window === 'undefined' && CLOUDINARY_CONFIG.api_key) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CONFIG.cloud_name,
    api_key: CLOUDINARY_CONFIG.api_key,
    api_secret: CLOUDINARY_CONFIG.api_secret,
    secure: true,
  })
}

export { cloudinary }

// Base folders for different asset types
export const CLOUDINARY_FOLDERS = {
  models: 'jth/models',           // Base horsebox images
  options: 'jth/options',         // Option overlay images
  chassis: 'jth/chassis',         // Chassis images
  interiors: 'jth/interiors',     // Interior images
  exteriors: 'jth/exteriors',     // Exterior color variations
}

// Default transformations
export const DEFAULT_TRANSFORMATIONS = {
  quality: 'auto:good',
  fetch_format: 'auto',
  flags: 'progressive',
}
