
# Claude Code & GPT5 Agent Collaboration Guide - JTH Website Replacement Project

Version: v2.0.0

Last Updated: 2025-01-11
Status: **Active Development** - Initial implementation phase complete

## 🚀 Current Implementation Status

### ✅ What GPT5 Has Implemented (Analysis of Commits 3ff5bb4 - 6dea0ca)

#### Foundation Setup ✓
- **Monorepo Structure**: Proper pnpm workspace configuration with apps/packages split
- **Next.js 14 App Router**: Clean setup with proper TypeScript configuration
- **Development Server**: Configured on port 5000 (non-standard, avoiding conflicts)
- **TypeScript Config**: Strict mode enabled with proper path aliases (@/)

#### Core Features Implemented ✓
- **Product Models System**: 
  - Dynamic model pages with slug-based routing
  - Model listing with price display
  - Active/inactive model filtering
- **Basic Configurator**:
  - Client-side component with useState/useEffect
  - Real-time price calculation
  - Option selection with dependencies (fridge → battery)
  - Pioneer package support with chassis extension
- **Pricing Engine**:
  - Server-side calculation logic
  - VAT and payment schedule computation
  - JSON-based pricing configuration
- **API Routes**:
  - Quote preview endpoint (POST)
  - Quote creation endpoint (with logging)
  - Configuration fetch endpoint (GET)

#### GPT5's Architecture Patterns Observed
1. **File-based data storage** (pricing.json) instead of database
2. **Minimal dependencies** - only Next.js, React, TypeScript
3. **Inline styles** instead of Tailwind CSS
4. **Direct SQL type references** in comments but no actual database
5. **SWR for data fetching** (added but not in package.json)
6. **Functional programming approach** with clear separation of concerns

### 🔧 Immediate Issues to Address

#### Critical Missing Dependencies
```json
// Missing from package.json:
"swr": "^2.2.5"  // Used in configurator but not installed
```

#### TypeScript Issues
1. Using non-null assertions (!) extensively
2. Missing proper error boundaries
3. `any` types in several places
4. No proper type exports/imports structure

#### Architecture Gaps
1. No styling framework (Tailwind CSS missing)
2. No database implementation (PostgreSQL planned)
3. No authentication system
4. No testing setup
5. No CI/CD configuration

## 🌐 Project Context: Complete Website Replacement

This comprehensive guide establishes detailed collaboration patterns between Claude Code and GPT5 agents for the complete replacement of the jthltd.co.uk website. This is not just a new application but a full website migration with enhanced features, improved performance, and modern architecture.

### Migration Overview
- **Current Site**: Existing jthltd.co.uk with Google Apps Script backend
- **New Platform**: Next.js 14 with Vercel Edge deployment
- **Timeline**: 8-12 week implementation
- **Budget**: £800-1,450 initial development
- **Monthly Costs**: £165-321 (small scale) to £1,130-2,080 (medium scale)

### Key Migration Considerations
1. **SEO Preservation**: Maintain existing rankings and traffic
2. **Content Migration**: Transfer all existing website content
3. **URL Structure**: Implement proper redirects from old URLs
4. **Data Migration**: Transfer from Google Apps Script to new backend
5. **Analytics Continuity**: Preserve historical data and tracking

## 📋 GPT5 Implementation Analysis & Rules

### Identified GPT5 Patterns

#### 1. Minimalist Approach
GPT5 prefers starting with the absolute minimum viable implementation:
- **Pattern**: Begin with core functionality, add complexity incrementally
- **Rule for GPT5**: Continue this approach but ensure all core dependencies are properly declared

#### 2. Data Structure Preferences
GPT5 uses TypeScript interfaces inline and JSON for configuration:
- **Pattern**: Type definitions close to usage, external config in JSON
- **Rule for GPT5**: Extract shared types to a central `types/` directory for reusability

#### 3. State Management
GPT5 uses React hooks directly without external state libraries:
- **Pattern**: useState for local state, useEffect for side effects, useMemo for optimization
- **Rule for GPT5**: This is good for now, but prepare interfaces for Zustand integration

#### 4. API Design
GPT5 created RESTful routes with clear separation:
- **Pattern**: `/api/[resource]/[action]` structure
- **Rule for GPT5**: Maintain this until tRPC migration in Week 5-8

### Optimization Recommendations

#### Immediate Optimizations (Claude's Improvements)

1. **Fix Missing Dependencies**
```bash
pnpm add swr
pnpm add -D @types/node@20.11.30  # Ensure version match
```

2. **Add Tailwind CSS Setup**
```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D @tailwindcss/forms @tailwindcss/typography
```

3. **Improve Type Safety**
- Remove all `any` types
- Extract interfaces to dedicated files
- Remove non-null assertions
- Add proper error handling

4. **Performance Optimizations**
- Add React.memo to option components
- Implement proper loading states
- Add error boundaries
- Optimize re-renders with useCallback

### Rules for Future GPT5 Work

#### Code Organization
1. **Always declare dependencies** in package.json before using them
2. **Extract types** to `apps/web/types/` directory
3. **Use path aliases** (@/) consistently
4. **Maintain functional style** but add proper error handling

#### Development Workflow
1. **Test imports** before committing
2. **Run typecheck** before pushing changes
3. **Document assumptions** in code comments
4. **Use conventional commits** (feat:, fix:, chore:)

#### Architecture Rules
1. **Keep JSON config** for now, prepare migration path to database
2. **Maintain RESTful APIs** until tRPC migration
3. **Use Server Components** by default, client only when needed
4. **Implement loading.tsx** and error.tsx for each route

## 🎯 Agent Roles & Responsibilities

### Next Steps Priority Order (Based on Development Plan)

#### Week 1-2 Remaining Tasks (Foundation)
1. **Install missing dependencies** (swr, Tailwind CSS)
2. **Setup Tailwind CSS** with design tokens
3. **Create shared UI components** in packages/ui
4. **Setup PostgreSQL database** with initial schema
5. **Implement basic layouts** with navigation
6. **Add loading and error states** for all routes

#### Week 3-4 Tasks (Product Showcase)
1. **Migrate from JSON to database** for products
2. **Implement image optimization** with Sharp
3. **Add product comparison tables**
4. **Create specification displays**
5. **Implement SEO metadata** for all pages

#### Week 5-6 Tasks (Core Configurator)
1. **Migrate to tRPC** for type-safe APIs
2. **Implement Zustand** for state management
3. **Add Cloudinary integration** for image layering
4. **Create save/load functionality**
5. **Add keyboard navigation**

### GPT5 Handoff Checklist

When GPT5 resumes work, ensure:
- [ ] Run `pnpm install` to get all dependencies
- [ ] Check `docs/CLAUDE_CODE_COLLAB.md` for latest rules
- [ ] Review TypeScript errors with `pnpm typecheck`
- [ ] Follow established patterns in existing code
- [ ] Document any new patterns or decisions
- [ ] Test all changes locally before committing

### Website-Specific Agent Roles

#### Content Migration Agent
**Scope**: Transfer existing website content, maintain SEO equity
**Primary Technologies**: Next.js Static Generation, Markdown, MDX

**Responsibilities**:
- Map existing site structure to new architecture
- Preserve meta descriptions and titles
- Implement 301 redirects for changed URLs
- Maintain internal linking structure
- Transfer media assets to Cloudinary

**Must Follow**:
```typescript
// ✅ CORRECT: Redirect mapping for SEO preservation
// apps/web/middleware.ts
const redirectMap = new Map([
  ['/horseboxes.html', '/horseboxes'],
  ['/about-us.html', '/about'],
  ['/contact.php', '/contact'],
  ['/gallery.html', '/gallery'],
  ['/blog/post.php?id=123', '/blog/horsebox-maintenance-guide'],
])

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check for old URL patterns
  if (redirectMap.has(pathname)) {
    return NextResponse.redirect(
      new URL(redirectMap.get(pathname)!, request.url),
      301 // Permanent redirect for SEO
    )
  }
  
  // Handle .html extensions
  if (pathname.endsWith('.html')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -5), request.url),
      301
    )
  }
}
```

#### SEO Migration Agent
**Scope**: Preserve rankings, implement technical SEO
**Primary Technologies**: Next.js Metadata API, Google Search Console

**Responsibilities**:
- Audit current site's SEO performance
- Create comprehensive redirect strategy
- Implement schema markup for all pages
- Set up XML sitemaps and robots.txt
- Monitor Core Web Vitals during migration

#### Analytics Migration Agent
**Scope**: Transfer tracking, maintain data continuity
**Primary Technologies**: Google Analytics 4, Tag Manager, Vercel Analytics

**Responsibilities**:
- Migrate from Universal Analytics to GA4
- Preserve conversion tracking
- Implement enhanced e-commerce tracking
- Set up custom events for configurator
- Create data bridge for historical reporting

### 1. Component Builder Agent (Enhanced for Full Website)
**Scope**: All website components including marketing pages, blog, contact forms
**Scope**: UI components for horsebox configurator, product displays, and marketing pages
**Primary Technologies**: React Server Components, TypeScript, Tailwind CSS, Framer Motion

**Responsibilities**:
- Build configurator UI components (option selectors, price displays, angle switchers)
- Create product showcase components (galleries, specification tables, comparison grids)
- Implement accessibility features (WCAG 2.2 compliance, voice control, screen readers)
- Handle responsive design with Tailwind container queries
- Integrate Cloudinary image layering with Sharp optimization
- **Website Components**:
  - Homepage hero with animated CTAs
  - Product showcase pages with 360° views
  - Contact forms with real-time validation
  - Blog/news section with MDX support
  - About/team pages with dynamic content
  - Gallery with lightbox and filtering
  - Cookie consent and GDPR banners
  - Three-way theme system (light/dark/system)

**Must Follow**:
```tsx
// ✅ CORRECT: RSC-first with proper typing
// apps/web/components/configurator/OptionSelector.tsx
import { HorseboxOption } from '@/types/configurator'

interface OptionSelectorProps {
  options: HorseboxOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  category: 'exterior' | 'interior' | 'accessories'
}

export function OptionSelector({ 
  options, 
  selectedId, 
  onSelect,
  category 
}: OptionSelectorProps) {
  return (
    <div 
      role="radiogroup" 
      aria-label={`Select ${category} option`}
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {options.map((option) => (
        <button
          key={option.id}
          role="radio"
          aria-checked={selectedId === option.id}
          onClick={() => onSelect(option.id)}
          className="relative p-4 border-2 transition-all focus:ring-2 focus:ring-offset-2"
        >
          {/* Implementation */}
        </button>
      ))}
    </div>
  )
}
```

**Never Do**:
- Use `any` type - always define proper interfaces
- Forget accessibility attributes (role, aria-*, tabindex)
- Mix client/server logic without clear boundaries
- Hardcode values that should be configurable

### 2. API Endpoint Creator Agent (with AI & Messaging)
**Scope**: tRPC procedures, AI integrations, messaging platforms
**Primary Technologies**: tRPC, PostgreSQL (native SQL), Vercel AI SDK, WhatsApp Business API, N8N

**Responsibilities**:
- Create tRPC routers for configurator, quotes, and products
- Implement database access using PostgreSQL (SQL) with proper error handling
- Integrate with the custom CRM for lead management
- Handle quote generation and PDF creation
- Manage caching strategies with Vercel KV
- **Enhanced Features**:
  - AI-powered configurator with natural language (Vercel AI SDK)
  - WhatsApp Business API integration for inquiries
  - Meta Messenger Platform for customer support
  - N8N workflow automation for lead nurturing
  - Chatwoot unified inbox for multi-channel support
  - Google Apps Script migration/integration
  - Contact form submissions with email notifications
  - Newsletter signup with marketing automation

**Must Follow**:
```typescript
// ✅ CORRECT: tRPC procedure with validation and error handling (no Prisma/HubSpot)
// apps/web/server/api/routers/quote.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, rateLimitedProcedure } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/server/db' // a thin PostgreSQL client
import { generateQuotePDF } from '@/lib/pdf'

const createQuoteSchema = z.object({
  configurationId: z.string().uuid(),
  customerDetails: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9+\-() ]+$/),
    company: z.string().optional(),
  }),
  includeFinance: z.boolean().default(false),
  vatExempt: z.boolean().default(false),
})

export const quoteRouter = createTRPCRouter({
  create: rateLimitedProcedure
    .input(createQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await db.query.configuration.findFirst({
        where: {
          id: input.configurationId,
          $or: [
            { user_id: ctx.session?.user.id },
            { session_id: ctx.sessionId }
          ]
        },
        include: {
          model: true,
          selected_options: { include: { option: true } }
        }
      })

      if (!configuration) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Configuration not found or access denied' })
      }

      const basePrice = Number(configuration.model.base_price)
      const optionsPrice = configuration.selected_options.reduce(
        (sum: number, item: any) => sum + Number(item.option.price),
        0
      )
      const subtotal = basePrice + optionsPrice
      const vat = input.vatExempt ? 0 : Math.round(subtotal * 0.20)
      const total = subtotal + vat

      const quote = await db.insert.quote({
        configuration_id: configuration.id,
        customer_name: input.customerDetails.name,
        customer_email: input.customerDetails.email,
        customer_phone: input.customerDetails.phone,
        customer_company: input.customerDetails.company ?? null,
        subtotal,
        vat,
        total,
        status: 'PENDING',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })

      const pdfUrl = await generateQuotePDF(quote, configuration)

      return { quoteId: quote.id, pdfUrl, total, expiresAt: quote.expires_at }
    })
})
```

**Never Do**:
- Skip input validation with Zod
- Expose sensitive data in responses
- Forget rate limiting on public endpoints
- Omit error handling and logging

### 3. SEO & Performance Optimizer Agent
**Scope**: Metadata, structured data, sitemaps, performance optimization
**Primary Technologies**: Next.js metadata API, schema-dts, Core Web Vitals

**Responsibilities**:
- Implement dynamic metadata for all website pages
- Add structured data (Product, Vehicle, Organization, LocalBusiness, FAQPage schemas)
- Generate comprehensive sitemaps including blog posts
- Optimize images with Sharp and Cloudinary
- Monitor Core Web Vitals metrics
- **Performance Targets**:
  - Sub-100ms response times on Vercel Edge Network
  - Partial Pre-rendering for marketing pages
  - Edge Functions for API routes
  - Static generation for blog content
  - Dynamic rendering for configurator only
  - Image optimization with next/image and Sharp
  - Font optimization with next/font

**Must Follow**:
```typescript
// ✅ CORRECT: Dynamic metadata with structured data (no Prisma)
// apps/web/app/(site)/horseboxes/[model]/page.tsx
import { Metadata } from 'next'
import { Product, Vehicle, WithContext } from 'schema-dts'
import { db } from '@/server/db'
import { Schema } from '@/components/Schema'

export async function generateMetadata({ params }: { params: { model: string } }): Promise<Metadata> {
  const horsebox = await db.query('SELECT * FROM horsebox_models WHERE slug = $1 LIMIT 1', [params.model])
    .then(r => r.rows[0])
  if (!horsebox) return {}
  return {
    title: `${horsebox.name} ${horsebox.weight} Tonne Horsebox | Custom Built | J Taylor Horseboxes`,
    description: `Premium ${horsebox.name} horsebox with ${horsebox.capacity} horse capacity. Starting from £${Number(horsebox.base_price).toLocaleString()}. Custom built in the UK with warranty.`,
    openGraph: {
      title: `${horsebox.name} Custom Horsebox`,
      description: horsebox.description,
      images: [{
        url: `https://res.cloudinary.com/jth/image/upload/f_auto,q_auto,w_1200/${horsebox.hero_image_id}`,
        width: 1200,
        height: 630,
        alt: `${horsebox.name} horsebox exterior view`
      }],
      type: 'product',
    },
    alternates: { canonical: `https://jthltd.co.uk/horseboxes/${params.model}` },
    other: {
      'product:price:amount': String(horsebox.base_price),
      'product:price:currency': 'GBP',
      'product:availability': 'in stock',
      'product:condition': 'new'
    }
  }
}

export default async function HorseboxModelPage({ params }: { params: { model: string } }) {
  const horsebox = await db.query(
    `SELECT * FROM horsebox_models WHERE slug = $1 LIMIT 1`,
    [params.model]
  ).then(r => r.rows[0])

  const structuredData: WithContext<Product & Vehicle> = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Vehicle'],
    name: `${horsebox.name} ${horsebox.weight}t Horsebox`,
    description: horsebox.description,
    brand: { '@type': 'Brand', name: 'J Taylor Horseboxes' },
    manufacturer: { '@type': 'Organization', name: 'J Taylor Horseboxes Ltd' },
    vehicleConfiguration: horsebox.name,
    vehicleModelDate: new Date().getFullYear().toString(),
    vehicleSeatingCapacity: horsebox.capacity,
    weightTotal: { '@type': 'QuantitativeValue', value: horsebox.weight * 1000, unitCode: 'KGM' },
    offers: {
      '@type': 'Offer',
      price: String(horsebox.base_price),
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'J Taylor Horseboxes Ltd' }
    },
    image: `https://res.cloudinary.com/jth/image/upload/${horsebox.hero_image_id}`,
    aggregateRating: horsebox.average_rating ? {
      '@type': 'AggregateRating',
      ratingValue: horsebox.average_rating,
      reviewCount: horsebox.review_count
    } : undefined
  }

  return (<><Schema schema={structuredData} />{/* Page content */}</>)
}
```

### 4. Database Architect Agent
**Scope**: SQL schema design, migrations, seeding, queries
**Primary Technologies**: PostgreSQL (native)

**Responsibilities**:
- Design and maintain SQL schemas
- Create efficient queries and indexes
- Implement data validation at schema level
- Manage migrations and seeding
- Optimize query performance

**Must Follow**:
```sql
-- ✅ CORRECT: PostgreSQL schema (excerpt)
CREATE TABLE horsebox_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  weight NUMERIC(3,1) NOT NULL,
  capacity INTEGER NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  hero_image_id TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_horsebox_models_slug ON horsebox_models(slug);
CREATE INDEX idx_horsebox_models_weight ON horsebox_models(weight);
```

## 🌐 Website-Specific Patterns

### Static Page Generation
```typescript
// ✅ CORRECT: Static generation for marketing pages
// apps/web/app/(marketing)/about/page.tsx
import { Metadata } from 'next'
import { getTeamMembers } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About J Taylor Horseboxes | Family Business Since 1982',
  description: 'Learn about our family-run horsebox manufacturing business, our values, and commitment to quality.',
}

export default async function AboutPage() {
  const team = await getTeamMembers()
  
  return (
    <div className="container mx-auto py-12">
      <Hero 
        title="Our Story"
        subtitle="Three generations of horsebox excellence"
      />
      <TeamSection members={team} />
      <Values />
      <Certifications />
    </div>
  )
}

// Force static generation
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour
```

### Blog Implementation with MDX
```typescript
// ✅ CORRECT: Blog with MDX and static generation
// apps/web/app/(marketing)/blog/[slug]/page.tsx
import { compileMDX } from 'next-mdx-remote/rsc'
import { getBlogPost, getAllBlogSlugs } from '@/lib/blog'

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  return {
    title: `${post.title} | JTH Blog`,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.slug)
  const { content } = await compileMDX({
    source: post.content,
    components: {
      Image: OptimizedImage,
      Video: LazyVideo,
      Gallery: InteractiveGallery,
    },
  })
  
  return (
    <article className="prose prose-lg max-w-4xl mx-auto">
      {content}
    </article>
  )
}
```

### Contact Form with Server Actions
```typescript
// ✅ CORRECT: Contact form with server action
// apps/web/app/(marketing)/contact/actions.ts
'use server'

import { z } from 'zod'
import { resend } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.enum(['general', 'quote', 'support', 'partnership']),
  message: z.string().min(10).max(1000),
  consent: z.boolean().refine((val) => val === true),
})

export async function submitContactForm(formData: FormData) {
  // Rate limiting
  const identifier = formData.get('email') as string
  const { success } = await rateLimit.check(identifier)
  if (!success) {
    return { error: 'Too many submissions. Please try again later.' }
  }
  
  // Validation
  const result = contactSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { error: 'Invalid form data', issues: result.error.issues }
  }
  
  // Send email
  await resend.emails.send({
    from: 'noreply@jthltd.co.uk',
    to: 'sales@jthltd.co.uk',
    subject: `Contact Form: ${result.data.subject}`,
    react: ContactEmailTemplate(result.data),
  })
  
  // Store in database
  await db.query(
    'INSERT INTO contact_submissions (name, email, phone, subject, message, consent) VALUES ($1, $2, $3, $4, $5, $6)',
    [result.data.name, result.data.email, result.data.phone ?? null, result.data.subject, result.data.message, result.data.consent]
  )
  
  // Sync to custom CRM
  await syncContactToCustomCRM(result.data)
  
  return { success: true }
}
```

## 📋 Code Style & Conventions

### TypeScript Standards
```typescript
// ✅ CORRECT: Properly typed with discriminated unions
type ConfiguratorState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'configuring'; configuration: Configuration }
  | { status: 'error'; error: string }

// ❌ INCORRECT: Using any or loose typing
type ConfiguratorState = {
  status: string
  configuration?: any
  error?: any
}
```

### File Naming Conventions
```
✅ CORRECT:
components/configurator/OptionSelector.tsx  // PascalCase components
lib/utils/price-calculator.ts              // kebab-case utilities
hooks/use-configurator.ts                  // kebab-case hooks
types/horsebox.ts                          // singular type files

❌ INCORRECT:
components/configurator/optionSelector.tsx  // Wrong case
lib/utils/priceCalculator.ts               // Should be kebab
hooks/useConfigurator.ts                   // Missing hyphen
types/horseboxes.ts                        // Should be singular
```

### Component Structure Pattern
```tsx
// ✅ CORRECT: Consistent component structure
// 1. Imports
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { HorseboxOption } from '@/types/configurator'

// 2. Types/Interfaces
interface ComponentProps {
  // Props definition
}

// 3. Component
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = useCallback(() => {}, [])
  
  // 6. Effects
  useEffect(() => {}, [])
  
  // 7. Render
  return <div />
}

// 8. Sub-components (if any)
ComponentName.Item = function Item() {}
```

## 🔗 Integration with Existing Systems

### Google Apps Script Migration
```typescript
// ✅ CORRECT: Migrating from Google Apps Script
// apps/web/lib/migration/google-apps.ts

// Map existing Google Apps Script endpoints to new API
const migrationMap = {
  '/google-apps/getConfig': '/api/trpc/configuration.get',
  '/google-apps/saveQuote': '/api/trpc/quote.create',
  '/google-apps/sendEmail': '/api/contact/submit',
}

// Compatibility layer for gradual migration
export async function handleLegacyRequest(endpoint: string, data: any) {
  const newEndpoint = migrationMap[endpoint]
  if (!newEndpoint) {
    throw new Error(`Legacy endpoint ${endpoint} not mapped`)
  }
  
  // Transform data format if needed
  const transformedData = transformLegacyData(endpoint, data)
  
  // Call new API
  return await fetch(newEndpoint, {
    method: 'POST',
    body: JSON.stringify(transformedData),
  })
}

// Data migration script
export async function migrateGoogleSheetsData() {
  const sheets = await getGoogleSheetsData()
  
  for (const row of sheets) {
    await db.query(
      `INSERT INTO legacy_data (legacy_id, data)
       VALUES ($1, $2)
       ON CONFLICT (legacy_id) DO UPDATE SET data = EXCLUDED.data`,
      [row.id, mapToNewSchema(row)]
    )
  }
}
```

### Enhanced AI Integration
```typescript
// ✅ CORRECT: AI-powered configurator with Vercel AI SDK
// apps/web/lib/ai/configurator-assistant.ts
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function* streamConfiguratorAssistant(
  userInput: string,
  context: ConfigurationContext
) {
  const { textStream } = await streamText({
    model: openai('gpt-4-turbo'),
    system: `You are a horsebox configuration expert. Help users choose the right options based on their needs.
    Current configuration: ${JSON.stringify(context)}
    Available options: ${JSON.stringify(await getAvailableOptions())}
    Price constraints: Consider budget if mentioned.`,
    prompt: userInput,
  })
  
  for await (const text of textStream) {
    yield text
  }
}
```

### WhatsApp Business Integration
```typescript
// ✅ CORRECT: WhatsApp Business API integration
// apps/web/lib/messaging/whatsapp.ts
import { Client } from 'whatsapp-web.js'

export class WhatsAppService {
  private client: Client
  
  async initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true },
    })
    
    this.client.on('message', this.handleMessage)
    await this.client.initialize()
  }
  
  private async handleMessage(message: Message) {
    // Route to appropriate handler
    if (message.body.toLowerCase().includes('quote')) {
      await this.sendQuoteInfo(message.from)
    } else if (message.body.toLowerCase().includes('configure')) {
      await this.startConfiguration(message.from)
    } else {
      await this.sendToHumanAgent(message)
    }
  }
  
  async sendQuoteInfo(to: string) {
    await this.client.sendMessage(to, {
      text: 'I can help you get a quote! Please visit: jthltd.co.uk/configurator',
      buttons: [
        { body: 'Start Configuration' },
        { body: 'View Models' },
        { body: 'Speak to Sales' },
      ],
    })
  }
}
```

## 🔄 Integration Points & Handoffs

### Claude → GPT5 Handoff Protocol
When Claude completes initial implementation:
1. Document all design decisions in inline comments
2. List any assumptions made about data structures
3. Note areas requiring GPT5 optimization
4. Provide test cases for validation

Example:
```typescript
// HANDOFF: Claude → GPT5
// Purpose: Initial quote calculation implementation
// Assumptions: 
//   - VAT is always 20% unless exempt
//   - Finance calculations use 5% APR
// TODO for GPT5:
//   - Add caching layer for repeated calculations
//   - Optimize SQL queries with proper SELECT and indexes
//   - Add telemetry for performance monitoring
```

### GPT5 → Claude Handoff Protocol
When GPT5 completes optimizations:
1. Document performance improvements with metrics
2. List any breaking changes to interfaces
3. Note new dependencies added
4. Provide migration guide if needed

Example:
```typescript
// HANDOFF: GPT5 → Claude
// Optimizations Applied:
//   - Added Redis caching: 95% cache hit rate
//   - Reduced query time: 200ms → 15ms
//   - Added batching for CRM sync
// Breaking Changes: None
// New Dependencies: @upstash/redis
// Migration: Run pnpm install && pnpm db:migrate
```

## 🔒 Security Requirements

### Input Validation Pattern
```typescript
// ✅ CORRECT: Comprehensive validation
const configuratorInputSchema = z.object({
  modelId: z.string().uuid(),
  options: z.array(z.object({
    categoryId: z.string().uuid(),
    optionId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10)
  })).max(50), // Prevent DoS via excessive options
  userDetails: z.object({
    email: z.string().email().max(255),
    phone: z.string().regex(/^[0-9+\-() ]+$/).max(20),
    postcode: z.string().regex(/^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i)
  }).optional()
})

// ❌ INCORRECT: Insufficient validation
const input = {
  modelId: req.body.modelId, // No validation!
  options: req.body.options,  // Could be anything!
}
```

### Authorization Pattern
```typescript
// ✅ CORRECT: Proper authorization checks
export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session
      }
    })
  })

// Check resource ownership
// Example ownership check (SQL)
const configuration = await db.query(
  'SELECT id FROM configurations WHERE id = $1 AND user_id = $2 LIMIT 1',
  [input.configurationId, ctx.session.user.id]
).then(r => r.rows[0])
```

## 🧪 Testing Requirements

### Component Testing Pattern
```tsx
// ✅ CORRECT: Comprehensive component test
// __tests__/components/OptionSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { OptionSelector } from '@/components/configurator/OptionSelector'

describe('OptionSelector', () => {
  const mockOptions = [
    { id: '1', name: 'Silver', price: 500, category: 'exterior' },
    { id: '2', name: 'White', price: 0, category: 'exterior' }
  ]

  it('renders all options', () => {
    render(<OptionSelector options={mockOptions} />)
    expect(screen.getByText('Silver')).toBeInTheDocument()
    expect(screen.getByText('White')).toBeInTheDocument()
  })

  it('handles selection', () => {
    const handleSelect = jest.fn()
    render(<OptionSelector options={mockOptions} onSelect={handleSelect} />)
    fireEvent.click(screen.getByText('Silver'))
    expect(handleSelect).toHaveBeenCalledWith('1')
  })

  it('is accessible', async () => {
    const { container } = render(<OptionSelector options={mockOptions} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('supports keyboard navigation', () => {
    render(<OptionSelector options={mockOptions} />)
    const firstOption = screen.getByText('Silver')
    firstOption.focus()
    fireEvent.keyDown(firstOption, { key: 'ArrowRight' })
    expect(screen.getByText('White')).toHaveFocus()
  })
})
```

### API Testing Pattern
```typescript
// ✅ CORRECT: API integration test
// __tests__/api/quote.test.ts
import { createInnerTRPCContext } from '@/server/api/trpc'
import { quoteRouter } from '@/server/api/routers/quote'
import { db } from '@/server/db'

jest.mock('@/server/db')

describe('Quote API', () => {
  it('creates quote with valid configuration', async () => {
    const ctx = createInnerTRPCContext({
      session: { user: { id: 'user-1' } }
    })
    
    ;(db.query as jest.Mock).mockResolvedValueOnce({ rows: [{
      id: 'config-1',
      model: { base_price: 50000 },
      selected_options: [{ option: { price: 2500 } }]
    }]})
    ;(db.insert as any).quote = jest.fn().mockResolvedValue({ id: 'quote-1', total: 63000, expires_at: new Date() })
    
    const caller = quoteRouter.createCaller(ctx)
    const result = await caller.create({
      configurationId: 'config-1',
      customerDetails: {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '07700900000'
      }
    })
    
    expect(result.total).toBeDefined()
    expect((db.insert as any).quote).toHaveBeenCalled()
  })

  it('rejects invalid configuration', async () => {
    const ctx = createInnerTRPCContext({
      session: { user: { id: 'user-1' } }
    })
    
    ;(db.query as jest.Mock).mockResolvedValueOnce({ rows: [] })
    
    const caller = quoteRouter.createCaller(ctx)
    await expect(
      caller.create({
        configurationId: 'invalid-id',
        customerDetails: {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '07700900000'
        }
      })
    ).rejects.toThrow('Configuration not found')
  })
})
```

## 🚀 Performance Guidelines (Vercel Edge Optimized)

### Enhanced Image Optimization with Sharp
```tsx
// ✅ CORRECT: Sharp + Cloudinary optimization
import sharp from 'sharp'

export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptions
): Promise<Buffer> {
  return sharp(buffer)
    .resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer()
}

export function generateHorseboxImage(
  configuration: Configuration,
  angle: 'front' | 'rear' | 'side' | 'interior'
): string {
  const transformations = [
    'f_auto', // Auto format (AVIF/WebP)
    'q_auto', // Auto quality
    'w_1200', // Max width
    'dpr_auto', // Auto DPR for retina
  ]

  // Layer composition for configurator
  const layers = [
    `l_horsebox_${configuration.model.slug}_${angle}_base`,
    configuration.exteriorColor && `l_color_${configuration.exteriorColor}`,
    configuration.graphics && `l_graphics_${configuration.graphics}`,
    configuration.wheels && `l_wheels_${configuration.wheels}`
  ].filter(Boolean)

  return `https://res.cloudinary.com/jth/image/upload/${transformations.join(',')}/${layers.join('/')}/fl_layer_apply`
}

// Preload critical images
export function PreloadImages({ images }: { images: string[] }) {
  return (
    <>
      {images.map((src, i) => (
        <link
          key={src}
          rel={i === 0 ? 'preload' : 'prefetch'}
          as="image"
          href={src}
          imageSrcSet={`${src} 1x, ${src.replace('w_1200', 'w_2400')} 2x`}
        />
      ))}
    </>
  )
}
```

### Edge Function Optimization
```typescript
// ✅ CORRECT: Edge-optimized API routes
// apps/web/app/api/quick-quote/route.ts
import { NextRequest } from 'next/server'

export const runtime = 'edge' // Run on Vercel Edge Network
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Use Vercel KV for session storage
  const session = await kv.get(`session:${request.cookies.get('sessionId')}`)
  
  // Quick calculation without database hit
  const { model, options } = await request.json()
  const price = calculatePrice(model, options)
  
  // Store in KV with TTL
  await kv.set(
    `quote:${crypto.randomUUID()}`,
    { price, model, options },
    { ex: 3600 } // 1 hour TTL
  )
  
  return Response.json({ price }, {
    headers: {
      'Cache-Control': 'private, max-age=0',
      'CDN-Cache-Control': 'max-age=60',
    },
  })
}
```

### Database Query Optimization
```sql
-- ✅ CORRECT: Only fetch needed fields with pagination
SELECT c.id, c.name, c.total, c.created_at, m.name AS model_name, m.slug AS model_slug
FROM configurations c
JOIN horsebox_models m ON m.id = c.model_id
WHERE c.user_id = $1
ORDER BY c.created_at DESC
LIMIT 10 OFFSET $2;

-- ❌ INCORRECT: SELECT * with unnecessary joins
SELECT * FROM configurations c
JOIN horsebox_models m ON m.id = c.model_id
JOIN selected_options so ON so.configuration_id = c.id
JOIN options o ON o.id = so.option_id
WHERE c.user_id = $1;
```

### Vercel KV Caching Strategy
```typescript
// ✅ CORRECT: Vercel KV for edge caching
import { kv } from '@vercel/kv'

export async function getHorseboxModels() {
  const cacheKey = 'horsebox:models:all'
  
  // Try cache first
  const cached = await kv.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Fetch from database
  const { rows: models } = await db.query(
    `SELECT m.*, s.*, f.*
     FROM horsebox_models m
     LEFT JOIN model_specifications s ON s.model_id = m.id
     LEFT JOIN standard_features f ON f.model_id = m.id`
  )
  
  // Cache for 1 hour
  await kv.set(cacheKey, JSON.stringify(models), { ex: 3600 })
  
  return models
}

// Invalidate cache on update
export async function updateHorseboxModel(id: string, data: any) {
  const result = await db.query(
    `UPDATE horsebox_models
     SET name = COALESCE($2, name), description = COALESCE($3, description), updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, data?.name ?? null, data?.description ?? null]
  ).then(r => r.rows[0])
  
  // Clear related caches
  await kv.del('horsebox:models:all')
  await kv.del(`horsebox:model:${id}`)
  
  return result
}
```

## 🌐 Website Features Documentation

### Homepage Components
```tsx
/**
 * HeroSection - Main homepage hero with animated CTA
 * 
 * Features:
 * - Responsive background video/image
 * - Animated text with Framer Motion
 * - Multiple CTA buttons
 * - Performance: Lazy loaded video, optimized images
 * - Accessibility: Reduced motion support
 */
export function HeroSection() {
  return (
    <section className="relative h-screen">
      <VideoBackground 
        src="/hero-video.mp4"
        poster="/hero-poster.jpg"
        loading="lazy"
      />
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold"
        >
          Custom Horseboxes Built to Last
        </motion.h1>
        <CTAButtons />
      </div>
    </section>
  )
}
```

### Gallery Implementation
```tsx
/**
 * InteractiveGallery - Filterable image gallery with lightbox
 * 
 * Features:
 * - Category filtering
 * - Lightbox with zoom
 * - Lazy loading with intersection observer
 * - Keyboard navigation
 * - Touch gestures on mobile
 */
export function InteractiveGallery({ images }: GalleryProps) {
  const [filter, setFilter] = useState<Category>('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  
  const filteredImages = useMemo(
    () => images.filter(img => 
      filter === 'all' || img.category === filter
    ),
    [images, filter]
  )
  
  return (
    <div>
      <FilterButtons 
        categories={categories}
        active={filter}
        onChange={setFilter}
      />
      <ImageGrid 
        images={filteredImages}
        onImageClick={(img) => openLightbox(img)}
      />
      {lightboxOpen && (
        <Lightbox 
          images={filteredImages}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
```

## 📝 Documentation Standards

### Component Documentation
```tsx
/**
 * ConfiguratorWizard - Multi-step horsebox configuration interface
 * 
 * @component
 * @example
 * ```tsx
 * <ConfiguratorWizard
 *   modelId="3-5-tonne"
 *   onComplete={(config) => console.log('Configuration:', config)}
 *   initialConfiguration={savedConfig}
 * />
 * ```
 * 
 * Features:
 * - Step-by-step configuration process
 * - Real-time price calculation
 * - Image preview with multiple angles
 * - Save/load configurations
 * - Keyboard navigation support
 * 
 * Accessibility:
 * - ARIA live regions for price updates
 * - Keyboard navigable with Tab/Arrow keys
 * - Screen reader announcements for step changes
 * - Reduced motion support
 */
```

### API Documentation
```typescript
/**
 * Quote Generation Service
 * 
 * Generates PDF quotes for horsebox configurations with the following features:
 * - VAT calculation (standard 20% or exempt)
 * - Finance options (5% APR over 1-5 years)
 * - Itemized breakdown of options
 * - 30-day validity period
 * - Custom CRM integration
 * 
 * Rate limits:
 * - Anonymous: 5 quotes per hour
 * - Authenticated: 20 quotes per hour
 * 
 * @throws {TRPCError} NOT_FOUND - Configuration doesn't exist
 * @throws {TRPCError} FORBIDDEN - User doesn't own configuration
 * @throws {TRPCError} TOO_MANY_REQUESTS - Rate limit exceeded
 */
```

## 🍪 GDPR & Cookie Compliance

### Cookie Consent Implementation
```typescript
// ✅ CORRECT: GDPR-compliant cookie consent
// apps/web/components/CookieConsent.tsx
import { useState, useEffect } from 'react'
import { getCookie, setCookie } from 'cookies-next'

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    functional: false,
  })
  
  useEffect(() => {
    const consent = getCookie('cookie-consent')
    if (!consent) {
      setShow(true)
    } else {
      applyPreferences(JSON.parse(consent))
    }
  }, [])
  
  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    savePreferences(allAccepted)
  }
  
  const handleAcceptSelected = () => {
    savePreferences(preferences)
  }
  
  const savePreferences = (prefs: Preferences) => {
    setCookie('cookie-consent', JSON.stringify(prefs), {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
      secure: true,
    })
    applyPreferences(prefs)
    setShow(false)
  }
  
  const applyPreferences = (prefs: Preferences) => {
    // Initialize analytics only if consented
    if (prefs.analytics) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
    
    // Initialize marketing tools only if consented
    if (prefs.marketing) {
      window.fbq?.('consent', 'grant')
      initializeCustomCRMTracking()
    }
  }
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-6 z-50">
      {/* Consent UI */}
    </div>
  )
}
```

## 🔄 Continuous Improvement

### Performance Monitoring
```typescript
// Add performance tracking to critical paths
import { performance } from 'perf_hooks'
import { metrics } from '@/lib/metrics'

export async function generateQuote(input: QuoteInput) {
  const start = performance.now()
  
  try {
    // Implementation
    const result = await processQuote(input)
    
    // Track success metrics
    metrics.record('quote.generation.duration', performance.now() - start)
    metrics.increment('quote.generation.success')
    
    return result
  } catch (error) {
    // Track failure metrics
    metrics.increment('quote.generation.failure')
    metrics.record('quote.generation.error', { 
      error: error.message,
      input: input.configurationId 
    })
    throw error
  }
}
```

### Error Tracking Pattern
```typescript
// Sentry integration for production errors
import * as Sentry from '@sentry/nextjs'

export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: context?.component || 'unknown',
          action: context?.action || 'unknown'
        },
        extra: {
          args: args.slice(0, 3), // Limit logged args
          ...context
        }
      })
      throw error
    }
  }) as T
}
```

## 🎯 Common Pitfalls to Avoid

### 1. Decimal Handling
```typescript
// ❌ INCORRECT: Floating point math for money
const total = basePrice + optionsPrice

// ✅ CORRECT: Use integers (pence) or a decimal lib
const toPence = (amount: number) => Math.round(amount * 100)
const totalPence = toPence(basePrice) + toPence(optionsPrice)
const total = totalPence / 100
```

### 2. N+1 Query Problem
```typescript
// ❌ INCORRECT: N+1 queries (ORM-style)
// Avoid issuing one query per configuration to fetch options

// ✅ CORRECT: Single query via join
SELECT c.*, so.*, o.*
FROM configurations c
LEFT JOIN selected_options so ON so.configuration_id = c.id
LEFT JOIN options o ON o.id = so.option_id;
```

### 3. Client-Side Price Calculation
```typescript
// ❌ INCORRECT: Never trust client calculations
const handleCheckout = (clientTotal: number) => {
  createOrder({ total: clientTotal }) // Security risk!
}

// ✅ CORRECT: Always recalculate server-side
const handleCheckout = (configurationId: string) => {
  // Server recalculates from source of truth
  const total = await calculateTotal(configurationId)
  createOrder({ total })
}
```

### 4. Missing Loading States
```tsx
// ❌ INCORRECT: No loading feedback
function ConfiguratorPage() {
  const { data } = useQuery(['configuration'])
  return <div>{data.name}</div> // Will error if data is undefined
}

// ✅ CORRECT: Proper loading/error states
function ConfiguratorPage() {
  const { data, isLoading, error } = useQuery(['configuration'])
  
  if (isLoading) return <ConfiguratorSkeleton />
  if (error) return <ErrorBoundary error={error} />
  if (!data) return <EmptyState />
  
  return <Configurator data={data} />
}
```

## 📊 Metrics & KPIs

### Code Quality Metrics
- TypeScript coverage: 100% (no `any` types)
- Test coverage: >80% for utilities, >60% for components
- Bundle size: <500KB initial JS
- Lighthouse scores: Performance >90, Accessibility >95

### Performance Targets
- LCP: <2.5s on 4G
- INP: <200ms
- CLS: <0.1
- TTFB: <600ms
- API response time: p95 <500ms

### Business Metrics to Track
```typescript
// Track key user actions
export const trackConfigurator = {
  started: (modelId: string) => 
    plausible('Configurator Started', { props: { model: modelId } }),
  
  optionSelected: (category: string, option: string, price: number) =>
    plausible('Option Selected', { props: { category, option, price } }),
  
  completed: (configId: string, total: number) =>
    plausible('Configuration Completed', { props: { configId, total } }),
  
  quoted: (quoteId: string, total: number) =>
    plausible('Quote Generated', { props: { quoteId, total } })
}
```

## 📱 Responsive & Accessibility Standards

### WCAG 2.2 Compliance (forward-compatible for 3.x)
```typescript
// ✅ CORRECT: Full accessibility implementation
// apps/web/components/AccessibleConfigurator.tsx

export function AccessibleConfigurator() {
  const [announcement, setAnnouncement] = useState('')
  const { theme } = useTheme() // Three-way theme system
  
  return (
    <div 
      role="application"
      aria-label="Horsebox Configurator"
    >
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Skip to content link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>
      
      {/* Voice control integration */}
      <VoiceControl 
        onCommand={(command) => handleVoiceCommand(command)}
      />
      
      {/* Main configurator with focus management */}
      <FocusTrap active={isConfiguring}>
        <main id="main-content">
          <ConfiguratorSteps />
        </main>
      </FocusTrap>
    </div>
  )
}
```

### Three-Way Theme System
```typescript
// ✅ CORRECT: Light/Dark/System theme implementation
// apps/web/lib/theme.ts

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) {
      setTheme(stored)
    }
    
    // Apply theme
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
    
    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## 🚦 Quality Gates

Before any code is merged:

### Pre-commit Checks
```bash
# .husky/pre-commit (to be enabled once the project is bootstrapped)
#!/bin/sh
pnpm typecheck       # No TypeScript errors
pnpm lint           # ESLint passes
pnpm test:unit      # Unit tests pass
pnpm test:a11y      # Accessibility tests pass
```

### PR Requirements
- [ ] TypeScript strict mode passes
- [ ] No `console.log` statements
- [ ] All new components have tests
- [ ] Accessibility audit passes
- [ ] Documentation updated
- [ ] Performance budget maintained
- [ ] Security review for API changes

### Definition of Done
- [ ] Code reviewed by team member
- [ ] Tests written and passing
- [ ] Documentation complete
- [ ] Deployed to staging
- [ ] QA verification complete
- [ ] Performance metrics validated
- [ ] Accessibility validated

## 🔄 Version History

- **v1.0.0** (2025-01-11): Initial comprehensive guide
- **v1.1.0** (2025-01-11): Complete website replacement scope added
  - Added migration strategies from existing jthltd.co.uk
  - Included AI and messaging integrations (WhatsApp, Messenger, N8N)
  - Enhanced performance targets (sub-100ms on Edge)
  - WCAG 3.0 accessibility standards
  - Google Apps Script migration patterns
  - Full website component documentation
- **v2.0.0** (2025-01-11): Claude Code Analysis & Optimization
  - Analyzed GPT5's initial implementation (commits 3ff5bb4-6dea0ca)
  - Identified patterns and architectural decisions
  - Documented missing dependencies and issues
  - Created specific rules for GPT5 based on observed patterns
  - Added immediate optimization recommendations
  - Established clear handoff protocols
- **v2.1.0** (pending): Database integration and tRPC migration
- **v2.2.0** (pending): Add 3D configurator patterns
- **v2.3.0** (pending): Add mobile app integration patterns
