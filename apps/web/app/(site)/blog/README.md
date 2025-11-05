# JTH Blog System

Complete blog management and display system for J Taylor Horseboxes.

## Overview

The blog system consists of three main components:

1. **Admin Editor** (`/admin/blog/new`) - Create and edit blog posts
2. **Blog Listing** (`/blog`) - Public listing page with featured posts
3. **Individual Posts** (`/blog/[slug]`) - Full article display pages

## Features

### Admin Blog Editor (`/admin/blog/new/page.tsx`)

Full-featured blog post creation and editing interface with:

- **Content Management**
  - Title with auto-generated URL slug
  - Rich text content area (HTML/Markdown support)
  - Excerpt for post summaries
  - Featured image URL input

- **SEO Optimization**
  - Meta title (60 character limit)
  - Meta description (160 character limit)
  - Keyword tags
  - Automatic schema.org Article markup

- **Organization**
  - Category selection (7 predefined categories)
  - Tag system (comma-separated)
  - Featured post toggle

- **Publishing Workflow**
  - Publish Now (live immediately)
  - Save as Draft (unpublished)
  - Submit for Review (editorial workflow)

### Blog Listing Page (`/blog/page.tsx`)

Public-facing blog homepage featuring:

- Hero section with custom background
- Featured post card (large format with image)
- Category filter buttons
- Grid layout for regular posts (3 columns desktop, responsive)
- Post cards with:
  - Featured images
  - Category badges
  - Title and excerpt
  - Publication date
  - Tag display
- CTA section with contact and configurator links
- Breadcrumb schema for SEO

### Individual Blog Post Page (`/blog/[slug]/page.tsx`)

Comprehensive article display with:

- **Header Section**
  - Full-width featured image with gradient overlay
  - Category badge
  - Article title
  - Publication date and author

- **Content Area**
  - Highlighted excerpt box
  - Fully styled prose content with:
    - Typography optimization
    - Image handling
    - Code blocks
    - Blockquotes
    - Lists and tables
  - Tag display

- **Engagement Features**
  - Social sharing (Twitter, Facebook, LinkedIn)
  - Related articles section (same category)

- **SEO Features**
  - Dynamic metadata
  - Article schema.org markup
  - Breadcrumb navigation
  - Open Graph tags

## Database Schema

Blog posts are stored in the `blog_posts` table with these key fields:

```sql
- id (uuid, primary key)
- title (text, required)
- slug (text, unique, required)
- excerpt (text)
- content (text, required) -- HTML content
- category (text)
- tags (text[])
- meta_title (text)
- meta_description (text)
- keywords (text[])
- featured (boolean)
- featured_image (text) -- URL or path
- status ('draft' | 'review' | 'published' | 'archived')
- author_id (uuid, FK to profiles)
- published_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Predefined Categories

1. Horsebox Advice
2. Safety
3. Maintenance
4. Buying Guide
5. Features
6. News
7. Case Studies

## Content Migration

7 existing blog articles from jthltd.co.uk have been migrated:

1. **Horsebox Payloads** - Buying Guide
2. **Horsebox Ventilation** - Safety (Featured)
3. **Horsebox Aluminium** - Features
4. **Horsebox Passenger Seatbelts** - Safety
5. **Horsebox Safety Checks** - Maintenance
6. **Before You Buy A Horsebox** - Buying Guide (Featured)
7. **Horsebox Air Brakes** - Features

### Running the Migration

To seed the blog posts into your database:

```bash
# Via Supabase CLI
npx supabase db push

# Or via direct SQL execution
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/migrations/011_seed_blog_posts.sql
```

## Usage

### Creating a New Blog Post

1. Navigate to `/admin/blog/new`
2. Enter title (slug auto-generates)
3. Write content in the textarea (HTML supported)
4. Fill SEO fields (meta title, description, keywords)
5. Select category and add tags
6. Add featured image URL
7. Toggle "Featured Post" if desired
8. Click "Publish Now" or "Save as Draft"

### Viewing Blog Posts

- **Public listing:** https://jthltd.co.uk/blog
- **Individual post:** https://jthltd.co.uk/blog/[slug]
- **Category filter:** https://jthltd.co.uk/blog?category=Safety

### Managing Existing Posts

Currently, the editor only supports creating new posts. To edit existing posts, you can:

1. Add an edit page at `/admin/blog/[id]/page.tsx` (future enhancement)
2. Directly update via database queries
3. Delete and recreate via the admin interface

## Styling

The blog uses:

- **Tailwind CSS** for all styling
- **Prose classes** for rich content formatting
- **Responsive design** with mobile-first approach
- **Custom gradients** for CTAs and headers
- **Shadow and hover effects** for interactive elements

## SEO Features

All blog pages include:

- Dynamic metadata generation
- Schema.org Article markup
- Breadcrumb navigation schema
- Open Graph tags for social sharing
- Keyword optimization
- Sitemap integration (via sitemap.xml)

## Image Requirements

Featured images should be:

- Format: JPEG or WebP
- Resolution: Minimum 1200x800px
- Aspect ratio: 3:2 or 16:9
- File size: Under 300KB (optimized)
- Path: Store in `/public/blog/` or use external CDN

## Next Steps

Potential enhancements:

1. **Edit functionality** - Add `/admin/blog/[id]/edit` page
2. **Rich text editor** - Integrate TinyMCE or Tiptap
3. **Image upload** - Add Cloudinary integration
4. **Draft preview** - Allow preview before publishing
5. **Author management** - Multiple authors with profiles
6. **Comments system** - Add reader engagement
7. **Analytics** - Track post views and engagement
8. **Search** - Full-text search via Meilisearch
9. **Newsletter** - Automated email for new posts
10. **RSS feed** - Generate RSS/Atom feed

## Testing

To test the blog system:

```bash
# Start dev server
pnpm dev

# Navigate to:
# - http://localhost:3000/blog (listing)
# - http://localhost:3000/blog/horsebox-ventilation (individual post)
# - http://localhost:3000/admin/blog/new (create post)
```

## Support

For questions or issues:
- Email: sales@jthltd.co.uk
- Phone: 01603 552109
