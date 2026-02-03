# Model Gallery Images

This directory contains gallery images for each horsebox model. Each model has its own subdirectory with numbered images (01.webp, 02.webp, etc.).

## Current Image Inventory

| Model Slug | Images | Status |
|------------|--------|--------|
| jth-principle-45 | 41 images (01-41.webp) | ✅ Complete |
| jth-professional-45 | 37 images (01-37.webp) | ✅ Complete |
| jth-progeny-45 | 19 images (01-19.webp) | ✅ Complete |
| principle-35 | 41 images (01-41.webp) | ✅ Complete |
| professional-35 | 37 images (01-37.webp) | ✅ Complete |
| progeny-35 | 19 images (01-19.webp) | ✅ Complete |
| aeos-discovery-45 | 15 images (01-15.webp) | ✅ Complete |
| aeos-discovery-72 | 8 images (01-08.webp) | ✅ Complete |
| aeos-freedom-45 | 10 images (01-10.webp) | ✅ Complete |
| aeos-edge-45 | 0 images | ⏳ Pending |
| aeos-edge-st-45 | 0 images | ⏳ Pending |
| zenos-72 | 0 images | ⏳ Pending |
| zenos-xl-72 | 0 images | ⏳ Pending |
| helios-75 | 0 images | ⏳ Pending |

## Image Format

All images are now in **WebP format** for optimal performance:
- Up to 30% smaller file size than JPEG
- Better quality at same file size
- Supported by all modern browsers

## Image Requirements

### Gallery Display
- Each model page displays its images in a grid layout (2-3 columns)
- Images are referenced as `/models/[slug]/[number].webp`
- Images should be high-quality WebP optimized for web
- Recommended resolution: 1200x800px minimum
- File size: Keep under 200KB per image for optimal loading

### Adding New Images

To add images for a model:
1. Create a folder: `/public/models/[model-slug]/`
2. Add numbered images: `01.webp`, `02.webp`, etc.
3. Update the gallery array in `/app/(site)/models/[slug]/page.tsx`

Example:
```typescript
gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp']
```

## Image Naming Convention

Always use:
- Lowercase filenames
- Two-digit numbering: `01.webp`, `02.webp`, etc.
- WebP format (.webp)
- No spaces or special characters in filenames

## Models Pending Images

The following models need professional photos:
- Aeos Edge 45
- Aeos Edge ST 45
- Zenos 72
- Zenos XL 72
- Helios 75
