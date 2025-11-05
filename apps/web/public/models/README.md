# Model Gallery Images

This directory contains gallery images for each horsebox model. Each model has its own subdirectory with numbered images (01.jpg, 02.jpg, etc.).

## Current Image Inventory

| Model Slug | Images | Status |
|------------|--------|--------|
| principle-35 | 8 images (01-08.jpg) | ✅ Complete |
| professional-35 | 5 images (01-05.jpg) | ✅ Complete |
| progeny-35 | 5 images (01-05.jpg) | ✅ Complete |
| aeos-edge-45 | 3 images (01-03.jpg) | ✅ Complete |
| aeos-freedom-45 | 4 images (01-04.jpg) | ✅ Complete |
| aeos-discovery-45 | 6 images (01-06.jpg) | ✅ Complete |
| aeos-edge-st-45 | 3 images (01-03.jpg) | ✅ Complete |
| aeos-discovery-72 | 8 images (01-08.jpg) | ✅ Complete |
| jth-principle-45 | 4 images (01-04.jpg) | ✅ Complete |
| jth-professional-45 | 5 images (01-05.jpg) | ✅ Complete |
| jth-progeny-45 | 5 images (01-05.jpg) | ✅ Complete |
| zenos-72 | 4 images (01-04.jpg) | ✅ Complete |
| zenos-xl-72 | 5 images (01-05.jpg) | ✅ Complete |
| helios-75 | 3 images (01-03.jpg) | ✅ Complete |

## Image Requirements

### Gallery Display
- Each model page displays its images in a grid layout (2-3 columns)
- Images are referenced as `/models/[slug]/[number].jpg`
- Images should be high-quality JPEGs optimized for web
- Recommended resolution: 1200x800px minimum
- File size: Keep under 300KB per image for optimal loading

### Adding New Images

To add images for a model:
1. Create a folder: `/public/models/[model-slug]/`
2. Add numbered images: `01.jpg`, `02.jpg`, etc.
3. Update the gallery array in `/app/(site)/models/[slug]/page.tsx`

Example:
```typescript
gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg']
```

### Current Placeholders

⚠️ **Note**: Current images are placeholders copied from the Principle 35 model. Replace with actual professional photos of each specific model before production launch.

## TODO: Production Images

Before launch, replace placeholder images with:
- Professional exterior shots (front, side, rear angles)
- Interior living area photos
- Horse area with partitions and flooring
- Detail shots of key features
- Action shots with horses loaded

## Image Naming Convention

Always use:
- Lowercase filenames
- Two-digit numbering: `01.jpg`, `02.jpg`, etc.
- JPEG format (.jpg)
- No spaces or special characters in filenames
