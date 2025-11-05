# Cloudinary Setup Guide for JTH Configurator

This guide explains how to set up Cloudinary for the horsebox configurator image layering system.

## Overview

The configurator uses Cloudinary's image transformation and layering capabilities to dynamically generate preview images based on the customer's configuration. This allows real-time visual feedback as options are selected.

## Account Setup

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up for a free account (supports up to 25GB storage and 25GB bandwidth/month)
3. Verify your email address
4. Log in to your dashboard at https://cloudinary.com/console

### 2. Get Your Credentials

From the Cloudinary dashboard, copy these values:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Add them to your `.env.local` file.

## Asset Organization

### Folder Structure

The configurator expects assets organized in the following structure:

```
jth/
├── models/          # Base horsebox images
│   ├── principle-35_3-4-front_base.jpg
│   ├── principle-35_side_base.jpg
│   ├── principle-35_3-4-rear_base.jpg
│   ├── professional-35_3-4-front_base.jpg
│   └── ...
├── options/         # Option overlay images (transparent PNGs)
│   ├── principle-35_3-4-front_side-door.png
│   ├── principle-35_3-4-front_roof-vent.png
│   ├── principle-35_3-4-front_window-upgrade.png
│   └── ...
├── chassis/         # Chassis variations
│   └── ...
├── interiors/       # Interior views
│   └── ...
└── exteriors/       # Exterior color variations
    └── ...
```

### Image Requirements

#### Base Model Images (`jth/models/`)

- **Format**: JPG
- **Resolution**: 2400x1600px minimum
- **Background**: Clean, neutral background (white or light gray)
- **Angles**:
  - `3-4-front` (Three-quarter front view)
  - `side` (Direct side view)
  - `3-4-rear` (Three-quarter rear view)
  - `front` (Direct front view)
  - `rear` (Direct rear view)

**Naming Convention**: `{model-id}_{angle}_base.jpg`

Examples:
- `principle-35_3-4-front_base.jpg`
- `professional-35_side_base.jpg`
- `progeny-35_3-4-rear_base.jpg`

#### Option Overlay Images (`jth/options/`)

- **Format**: PNG with transparency
- **Resolution**: Must match base model resolution (2400x1600px)
- **Content**: Only the option element (e.g., door, window, vent)
- **Alignment**: Must align perfectly with base model image
- **Background**: Fully transparent (alpha channel)

**Naming Convention**: `{model-id}_{angle}_{option-id}.png`

Examples:
- `principle-35_3-4-front_side-door.png`
- `principle-35_3-4-front_roof-vent.png`
- `principle-35_side_window-upgrade.png`

### Creating Overlay Images

#### Using Photoshop

1. Open the base model image
2. Create a new layer
3. Add the option element (door, window, etc.)
4. Delete the background layer
5. Export as PNG with transparency:
   - File → Export → Export As...
   - Format: PNG
   - Check "Transparency"
   - Resolution: Same as original

#### Using GIMP (Free Alternative)

1. Open the base model image
2. Layer → Transparency → Add Alpha Channel
3. Select and delete the background
4. Add your option element as a new layer
5. Export as PNG:
   - File → Export As...
   - Select PNG
   - Enable "Save background color" = OFF

#### Tips for Best Results

- Use high-quality source images
- Ensure lighting matches across all angles
- Maintain consistent shadows and reflections
- Test overlays at different opacities
- Use professional photography for base models

## Uploading Assets

### Method 1: Web Interface (Manual)

1. Log in to Cloudinary dashboard
2. Go to Media Library
3. Create folders: `jth/models`, `jth/options`, etc.
4. Drag and drop images into the appropriate folders
5. Ensure naming conventions are followed

### Method 2: CLI (Bulk Upload)

```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Configure CLI with your credentials
cld config

# Bulk upload models
cld uploader upload ./assets/models/* --folder jth/models

# Bulk upload options
cld uploader upload ./assets/options/* --folder jth/options
```

### Method 3: API (Automated)

Create a script to upload programmatically:

```javascript
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload all models
const models = ['principle-35', 'professional-35', 'progeny-35']
const angles = ['3-4-front', 'side', '3-4-rear', 'front', 'rear']

models.forEach(async (model) => {
  angles.forEach(async (angle) => {
    const result = await cloudinary.uploader.upload(
      `./assets/models/${model}_${angle}_base.jpg`,
      {
        folder: 'jth/models',
        public_id: `${model}_${angle}_base`,
        overwrite: true,
      }
    )
    console.log(`Uploaded: ${result.public_id}`)
  })
})
```

## Testing the Integration

### 1. Verify Assets are Accessible

Test a single image URL in your browser:

```
https://res.cloudinary.com/{your-cloud-name}/image/upload/jth/models/principle-35_3-4-front_base.jpg
```

### 2. Test Layering

Test a layered image with an overlay:

```
https://res.cloudinary.com/{your-cloud-name}/image/upload/w_1200,h_800,c_fit/l_jth:options:principle-35_3-4-front_side-door,o_100,g_center,fl_layer_apply/jth/models/principle-35_3-4-front_base.jpg
```

### 3. Test Configurator

1. Start the development server: `pnpm dev`
2. Navigate to `/configurator`
3. Select a model (e.g., Principle 3.5t)
4. Select options and verify the preview updates
5. Try different camera angles
6. Test download and share features

## Image Optimization

Cloudinary automatically optimizes images. You can configure defaults:

### Quality Settings

- `q_auto:good` - Balanced quality (default)
- `q_auto:best` - Maximum quality
- `q_auto:eco` - Smaller file size
- `q_auto:low` - Fastest loading

### Format Settings

- `f_auto` - Automatic format selection (WebP for Chrome, AVIF for newer browsers)
- `f_webp` - Force WebP format
- `f_jpg` - Force JPEG format

### Performance Tips

1. **Use auto format**: `f_auto` automatically selects the best format
2. **Enable progressive loading**: `fl_progressive` for JPEGs
3. **Set appropriate quality**: `q_auto:good` balances quality and file size
4. **Use responsive images**: Different sizes for different devices
5. **Implement lazy loading**: Load images as they enter viewport

## Troubleshooting

### Images Not Loading

**Check:**
1. Cloud name is correct in `.env.local`
2. Images are uploaded to correct folders
3. Public IDs match exactly (case-sensitive)
4. Images are set to public (not private)

### Overlays Not Appearing

**Check:**
1. PNG files have transparency
2. Overlay dimensions match base model
3. Public ID paths are correct
4. Layer syntax is correct in URL

### Preview Shows Placeholder

**Reasons:**
1. Cloudinary credentials not configured
2. Images not uploaded yet
3. Incorrect folder structure
4. Network connectivity issues

**Solution:**
The system gracefully falls back to a placeholder when images aren't available. This allows development to continue while assets are being prepared.

## Production Checklist

Before going live:

- [ ] All base model images uploaded
- [ ] All option overlay images uploaded
- [ ] Tested all model/angle combinations
- [ ] Verified layering works correctly
- [ ] Tested on multiple devices/browsers
- [ ] Checked image loading performance
- [ ] Configured CDN caching
- [ ] Set up image transformations for thumbnails
- [ ] Tested download and share features
- [ ] Documented any custom transformations

## Cost Estimation

### Free Plan Limits
- 25 GB storage
- 25 GB bandwidth/month
- 1,000 transformations/month

### Typical Usage (JTH)
- **Base models**: 5 models × 5 angles × 500KB = ~12.5 MB
- **Options**: 50 options × 5 angles × 200KB = ~50 MB
- **Total storage**: ~65 MB (well within free tier)
- **Monthly bandwidth**: Depends on traffic
  - 1,000 views/month = ~65 GB (need paid plan)
  - 100 views/month = ~6.5 GB (free tier OK)

### Upgrading

If you exceed free tier limits, upgrade to Plus plan ($89/month) for:
- 75 GB storage
- 75 GB bandwidth
- 5,000 transformations

## Support

For Cloudinary-specific issues:
- Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com
- Community: https://community.cloudinary.com

For JTH-specific implementation:
- Contact the development team
- Check `/lib/cloudinary/image-builder.ts` for image URL generation
- Review `ConfiguratorPreview.tsx` for component usage
