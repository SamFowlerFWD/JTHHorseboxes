# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JTH-New is the development repository for **J Taylor Horseboxes** - a comprehensive web application for a horsebox manufacturing company. This project is currently in the documentation/planning phase with detailed specifications for implementation.

## Technology Stack

### Core Technologies (Planned)
- **Framework**: Next.js 14 with App Router, TypeScript, React Server Components
- **Database**: PostgreSQL (native)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand (configurator), React Query (remote data)
- **Authentication**: NextAuth.js with credentials and OAuth
- **Package Manager**: pnpm
- **Monorepo**: Workspace structure with apps and packages

### Key Integrations
- **Image Management**: Cloudinary for optimization and layering
- **CRM**: Custom-built lead management (no HubSpot)
- **AI**: Claude API for FAQ bot
- **Search**: Meilisearch for knowledge base
- **Analytics**: Plausible Analytics
- **Email**: Resend/SendGrid
- **Storage**: Cloudflare R2

## Development Commands

```bash
# Core development (once implemented)
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run ESLint
pnpm test             # Run test suite
pnpm test:e2e         # Run Playwright E2E tests

# Database (once configured)
# Run database migrations using the chosen migration tool
# Example: dbmate migrate / drizzle-kit migrate (tooling TBD)

# Deployment
pnpm deploy:preview   # Deploy to preview environment
pnpm deploy:prod      # Deploy to production
```

## VPS Deployment

**Production Server**: `root@31.97.118.64`
- SSH access configured for deployment
- Use for production builds and hosting
- Deploy via: `ssh root@31.97.118.64`

## Project Architecture

### Monorepo Structure
```
apps/
  web/                    # Main Next.js application
    app/                  # App Router pages
      (site)/            # Public site pages
      (marketing)/       # Marketing pages
      api/               # API routes and tRPC
    components/          # React components
    lib/                 # Utilities and helpers
packages/
  ui/                    # Shared UI components
  database/              # Database schemas (SQL)
  config/               # Shared configuration
```

### Key Components & Features

1. **2D Configurator System**
   - Image layering via Cloudinary overlays
   - State management with Zustand
   - Real-time price calculation engine
   - Save/share functionality (authenticated & anonymous)
   - Multi-angle views with keyboard navigation

2. **Quote Generation**
   - Server-side PDF generation
   - Custom CRM integration via API
   - VAT and finance calculations
   - Email automation workflows

3. **Product Showcase**
   - Dynamic product pages (3.5t, 4.5t, 7.2t models)
   - Responsive image galleries
   - Specification comparison tables
   - AVIF/WebP optimization

4. **Knowledge Base & AI**
   - Content management with search (Meilisearch)
   - Claude-powered FAQ bot
   - Author profiles for E-E-A-T

## Testing Strategy

- **Unit Tests**: Price engine, utilities, image URL builder
- **Integration Tests**: tRPC procedures, auth flows
- **E2E Tests**: Playwright for critical user journeys
- **Performance**: Lighthouse CI with budgets (LCP < 2.5s, INP < 200ms)

## SEO Implementation

- Dynamic sitemap generation
- Structured data (Product, Vehicle, FAQPage schemas)
- Core Web Vitals optimization
- Open Graph and meta tags
- Local SEO for UK/Ireland market

## Security Considerations

- OWASP compliance for input validation
- Rate limiting per route
- Webhook signature verification
- GDPR-compliant data handling
- Environment-based secrets management

## Development Timeline

The project follows a 16-week sprint plan:
- **Weeks 1-4**: Foundation setup, database, basic pages
- **Weeks 5-8**: Product showcase and configurator core
- **Weeks 9-12**: Quote system, CRM integration, configurator enhancement
- **Weeks 13-16**: Knowledge base, testing, launch preparation

## Current Status

This repository currently contains planning documentation. Key documents:
- `docs/DEVELOPMENT_PLAN.md` - Comprehensive 16-week implementation plan
- `docs/SEO_IMPLEMENTATION_2025.md` - Detailed SEO strategy
- `docs/CLAUDE_CODE_COLLAB.md` - AI collaboration guidelines

For detailed cross-agent collaboration rules and patterns, see `docs/CLAUDE_CODE_COLLAB.md`.

## UI/UX Modernization Guidelines (2025)

### Design System & Component Library

**Primary Component Library**: Shadcn UI
- Use Shadcn UI as the foundation for all UI components
- Install components via the Shadcn CLI: `npx shadcn@latest add [component]`
- Customize theme colors to match JTH brand (deep blues, metallic grays, premium feel)
- Extend components with custom variants for horsebox-specific needs

### Modern Icon Strategy

**REPLACE ALL DATED ICONS** - Current implementation uses outdated icon styles
- **Primary Icon Library**: Lucide React (already installed)
- **Icon Guidelines**:
  - Use outlined/linear icons for navigation and actions
  - Use filled icons sparingly for emphasis
  - Maintain consistent 24px size for standard icons
  - Use 20px for inline/small contexts
  - Apply subtle animations on hover (scale: 1.1, transition: 200ms)
  
**Specific Icon Replacements**:
- Navigation arrows → Use Lucide's `ChevronRight`, `ChevronLeft`
- Home icon → Use Lucide's `Home` (outlined)
- Contact → Use Lucide's `Mail` or `Phone`
- Gallery → Use Lucide's `Images` or `Camera`
- Configuration → Use Lucide's `Settings2` or `Sliders`
- Quote → Use Lucide's `FileText` or `Calculator`

### Dissolve-Style Image Gallery

**Implementation Requirements**:
```typescript
// Gallery with dissolve/crossfade transitions
interface GalleryConfig {
  transitionDuration: 600, // ms
  transitionType: 'dissolve' | 'crossfade',
  autoPlay: true,
  autoPlayInterval: 4000, // ms
  thumbnailPosition: 'bottom' | 'side',
  imageOptimization: {
    format: 'webp' | 'avif',
    quality: 85,
    blur: true // placeholder blur
  }
}
```

**Technical Implementation**:
- Use CSS transitions with opacity for dissolve effect
- Implement with Framer Motion for smooth animations
- Preload next image during current viewing
- Use Intersection Observer for lazy loading
- Keyboard navigation (arrow keys, ESC to close)
- Touch/swipe support for mobile

### Competitor-Inspired Design Elements

**Based on Bloomfields Analysis**:
- Clean, minimal navigation with sticky header
- Large hero images with subtle parallax
- Premium typography (Inter for UI, Playfair Display for headings)
- Generous whitespace and breathing room
- Subtle box-shadows and elevation layers
- Glass-morphism effects for overlays

**Based on Stephex Analysis**:
- Interactive model showcase with 360° views
- Comparison tables with visual indicators
- Trust badges and certifications prominently displayed
- Video backgrounds for hero sections
- Animated statistics/counters on scroll

**Modern Design Patterns to Implement**:
1. **Bento Grid Layouts** - For feature showcases
2. **Card-based Design** - With hover effects and depth
3. **Micro-interactions** - Button animations, loading states
4. **Dark Mode Support** - System preference detection
5. **Skeleton Loading** - For better perceived performance

### Visual Enhancement Specifications

**Color Palette Enhancement**:
```css
:root {
  /* Modern, premium colors */
  --primary: hsl(220, 80%, 25%);      /* Deep blue */
  --accent: hsl(45, 90%, 55%);        /* Gold accent */
  --surface: hsl(0, 0%, 98%);         /* Off-white */
  --surface-dark: hsl(220, 20%, 12%); /* Dark mode surface */
  --text-primary: hsl(220, 20%, 15%);
  --text-secondary: hsl(220, 10%, 45%);
  
  /* Gradients */
  --gradient-premium: linear-gradient(135deg, var(--primary) 0%, hsl(220, 70%, 35%) 100%);
  --gradient-cta: linear-gradient(135deg, var(--accent) 0%, hsl(35, 85%, 50%) 100%);
}
```

**Typography Enhancements**:
```css
/* Modern font stack */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;

/* Fluid typography */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
--text-3xl: clamp(2rem, 1.7rem + 1.5vw, 2.5rem);
--text-4xl: clamp(2.5rem, 2rem + 2.5vw, 3.5rem);
```

### Component Implementation Priority

1. **Navigation Header** - Modern sticky nav with glass-morphism
2. **Hero Section** - Full-screen with video/image background
3. **Product Cards** - Interactive with hover states
4. **Gallery Component** - Dissolve transitions, lightbox mode
5. **Configurator UI** - Modern sliders, color pickers
6. **Form Components** - Floating labels, smooth validations
7. **Footer** - Multi-column with newsletter signup

### Playwright Testing Requirements

**Visual Regression Tests**:
```typescript
// Test configuration for UI components
test.describe('Visual Components', () => {
  test('Gallery dissolve transition', async ({ page }) => {
    // Test smooth transitions between images
    // Verify loading states
    // Check keyboard navigation
  });
  
  test('Mobile responsive breakpoints', async ({ page }) => {
    // Test at 375px, 768px, 1024px, 1440px
    // Verify navigation drawer on mobile
    // Check touch interactions
  });
  
  test('Dark mode toggle', async ({ page }) => {
    // Verify theme persistence
    // Check contrast ratios
    // Test component visibility
  });
});
```

**Performance Testing**:
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

### Animation & Interaction Guidelines

**Entrance Animations**:
- Use Framer Motion for orchestrated animations
- Stagger delays: 50-100ms between elements
- Duration: 400-600ms for main elements
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

**Hover States**:
- Scale: 1.02-1.05 for cards
- Shadow elevation increase
- Color shift for CTAs
- Transition duration: 200-300ms

**Loading States**:
- Skeleton screens for content
- Shimmer effects for placeholders
- Progress indicators for long operations
- Optimistic UI updates

### Accessibility Enhancements

- Focus visible outlines (2px solid, 2px offset)
- ARIA labels for all interactive elements
- Keyboard navigation for all features
- Screen reader announcements for state changes
- Reduced motion preferences respected
- Color contrast minimum 4.5:1 (7:1 for small text)

## Important Notes

- The application code is not yet implemented - this is a planning repository
- Follow mobile-first responsive design principles
- Prioritize accessibility with WCAG 2.1 AA compliance
- Implement progressive enhancement for configurator features
- Use server components by default, client components only when necessary
- Optimize for Core Web Vitals from the start
- **CRITICAL**: Replace ALL dated icons with modern Lucide React icons
- **PRIORITY**: Implement dissolve-style gallery as flagship feature
- **REFERENCE**: Study Bloomfields and Stephex for premium design patterns