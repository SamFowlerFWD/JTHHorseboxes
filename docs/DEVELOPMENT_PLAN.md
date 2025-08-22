### J Taylor Horseboxes — Development Plan (Q3–Q4 2025)

This document operationalizes the implementation plan into concrete deliverables, acceptance criteria, owners, and milestones. It aligns to the sprint outline you provided and maps directly to the proposed stack (Next.js 14 App Router, TS, PostgreSQL (native), tRPC, Redis, NextAuth, Tailwind, Cloudinary, Sentry, Plausible).

## 0. Repo setup and conventions
- Monorepo: `apps/web`, `packages/{ui,database,config}`
- Tools: pnpm, TypeScript strict, ESLint + Prettier, Husky + lint-staged
- CI: GitHub Actions — typecheck, build, lint, unit tests, Lighthouse CI on PRs
- Secrets: `.env.example` with required keys; use Doppler/Vercel env groups

## 1. Sprints & deliverables

### Sprint 1 (Weeks 1–2): Foundation
- Create Next.js 14 project in `apps/web` with App Router
- Tailwind base, theme tokens, typography, container queries
- PostgreSQL database, SQL migrations, seed
- Global navigation, footer, error boundaries, RSC-friendly layout
- SEO base: `generateMetadata`, sitemap + robots routes

Acceptance criteria:
- `pnpm dev` runs locally; all pages render; Lighthouse perf > 85 on home
- Database migrations applied; `User`, `Product` readable via seed data

### Sprint 2 (Weeks 3–4): Product showcase
- Product model pages (`3-5-tonne`, `4-5-tonne`, `7-2-tonne`)
- Reusable gallery with keyboard and SR support; lightbox
- Specification table component; comparison component
- Responsive breakpoints + image optimization via Next/Image + Cloudinary

Acceptance criteria:
- Product pages score >90 accessibility in Lighthouse
- Images responsive (AVIF/WebP), LCP < 2.5s on 4G emulation

### Sprint 3 (Weeks 5–6): 2D configurator core
- Zustand store for `ConfiguratorState` (as specified)
- Step-based UI; option pickers; price engine
- Image layering with Cloudinary overlays and angle sets
- Save configuration (anon + authed), shareable URLs via slug

Acceptance criteria:
- Can configure, see total price, switch angles; state persisted in DB

### Sprint 4 (Weeks 7–8): Configurator enhancement
- Full option sets, validations, presets
- Mobile-first interaction; skeletons; optimistic updates
- Performance pass: code-split configurator, cache options in Redis

Acceptance criteria:
- TTI < 3s on mid-tier mobile; JS initial < 500KB; INP < 200ms

### Sprint 5 (Weeks 9–10): Leads & quotes
- Quote generation service, pricing with VAT, finance estimates
- PDF generation (server route + Playwright/puppeteer or PDFKit)
- Custom CRM integration (contacts + pipeline), lead scoring
- Email automation via Resend/Sendgrid; webhook tracking

Acceptance criteria:
- Quote PDF downloadable from dashboard; CRM entries verified in sandbox

### Sprint 6 (Weeks 11–12): Knowledge & search
- Knowledge base models, pages, category landing, search with Meilisearch
- FAQ bot: Claude integration fallback if no direct match
- Author pages for E-E-A-T; editorial workflow

Acceptance criteria:
- Search returns relevant KB; FAQ bot answers gracefully; schema valid

### Sprint 7 (Weeks 13–14): Polish & launch
- Performance, cross-browser tests, audit security, rate limits
- Analytics (Plausible), Sentry, Uptime monitoring
- Docker build, Nginx config, PM2 ecosystem, deploy script

### Sprint 8 (Weeks 15–16): Post-launch
- Monitor KPIs, bug triage, A/B tests, docs completion

## 2. Detailed technical blueprint

### Frontend
- App Router structure: `app/(site)/`, `app/(marketing)/`, `app/api/`
- RSC-first: fetch products/configs server-side; use Suspense boundaries
- State: Zustand for configurator/cart; React Query for remote lists
- Forms: React Hook Form + Zod resolvers
- Animations: Framer Motion for micro-interactions
- Accessibility: Headless UI primitives + custom focus management

### Media & 2D layering
- Cloudinary public IDs: `base`, `color_{id}`, `graphics_{id}`, `wheels_{id}`
- Helper: `generateConfigImage(config, angle)` returning composed URL
- Store `images.angles` for each view; preload current angle; lazy others

### Backend
- API surface: tRPC routers for products, configurator, quotes, kb
- NextAuth with credentials + OAuth (Google), JWT + refresh tokens
- Rate limiting with upstash/ratelimit per route key
- PostgreSQL schema and SQL queries; decimal handling via integer cents
- Redis cache keys: `options:{model}`, `product:{slug}`, `config:{id}`

### Quote PDF
- Server route renders a React PDF template; unit prices + VAT breakdown
- Store in Cloudflare R2; signed URL on response; attach to CRM lead

### Knowledge & AI
- KB stored in Postgres; text indexed in Meilisearch
- FAQ handler: try KB search, else call Claude with KB context
- Safety: moderation, timeouts, circuit breaker, observability spans

## 3. Environments & DevOps
- Envs: `development`, `staging`, `production` (Vercel + VPS support)
- CI jobs: lint/typecheck/build/test; migration check; Lighthouse CI
- Error tracking: Sentry DSN; release tracking with source maps
- Observability: Web Vitals to Plausible custom events; server timings

## 4. Security & compliance
- OWASP: input validation (Zod), output escaping, authz checks (tRPC middleware)
- Secrets rotated; webhook signature verification (email)
- GDPR: DSR endpoints, data retention policies, cookie-less analytics

## 5. Testing strategy
- Unit: utilities, price engine, image URL builder
- Integration: tRPC procedures, auth flows
- E2E: Playwright — configurator happy paths, quote request
- Performance budgets enforced via Lighthouse CI

## 6. Milestone checklist (extract)
- [ ] Monorepo bootstrapped with pnpm workspaces
- [ ] DB schema migrated and seeded
- [ ] Product pages live with gallery
- [ ] Configurator MVP with save/share
- [ ] Quote generator + PDF + CRM sync
- [ ] KB + FAQ bot fallback
- [ ] Launch checklist passed and deployed
