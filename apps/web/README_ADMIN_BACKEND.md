# JTH Admin Backend Documentation

## Overview

Comprehensive admin backend system for J Taylor Horseboxes with lead management, blog CMS, configurator pricing control, and AI-powered knowledge base management.

## Features Implemented

### 1. **Database Architecture (Supabase)**
- ✅ Complete PostgreSQL schema with all required tables
- ✅ pgvector extension for RAG agent embeddings
- ✅ Row Level Security (RLS) policies for admin access
- ✅ Optimized indexes for performance
- ✅ Audit logging and activity tracking

### 2. **Authentication System**
- ✅ Supabase Auth integration
- ✅ Admin role verification via middleware
- ✅ Protected routes with automatic redirect
- ✅ Session management with remember me option

### 3. **API Endpoints**

#### Lead Management
- `GET /api/leads` - List all leads with pagination and filtering
- `POST /api/leads` - Create new lead (public endpoint)
- `GET /api/leads/[id]` - Get single lead details
- `PATCH /api/leads/[id]` - Update lead status and details
- `DELETE /api/leads/[id]` - Delete a lead

#### Blog CMS
- `GET /api/blog` - List blog posts (public for published)
- `POST /api/blog` - Create new blog post
- `GET /api/blog/[slug]` - Get single post by slug
- `PATCH /api/blog/[slug]` - Update blog post
- `DELETE /api/blog/[slug]` - Delete blog post

#### Pricing Management
- `GET /api/pricing` - Get pricing options by model/category
- `POST /api/pricing` - Create new pricing option
- `PATCH /api/pricing/bulk` - Bulk update pricing

#### Knowledge Base (RAG)
- `GET /api/knowledge-base` - List knowledge entries
- `POST /api/knowledge-base` - Create entry with auto-embedding
- `POST /api/knowledge-base/search` - Vector similarity search

### 4. **Admin Dashboard UI**

#### Pages Created
- `/login` - Authentication page with form validation
- `/admin` - Dashboard with statistics and recent activity
- `/admin/leads` - Lead management with search, filter, export
- `/admin/leads/[id]` - Individual lead details and activity
- `/admin/blog` - Blog post management
- `/admin/pricing` - Configurator pricing editor
- `/admin/knowledge-base` - Knowledge base management

#### UI Components
- `AdminLayout` - Responsive sidebar navigation
- Data tables with pagination
- Search and filter controls
- CSV export functionality
- Mobile-responsive design
- Dark mode support

### 5. **RAG Agent Integration**
- OpenAI embeddings (text-embedding-ada-002)
- 1536-dimension vectors in pgvector
- Semantic search with similarity scoring
- Automatic embedding generation on content creation
- Hybrid search (semantic + keyword)

## Setup Instructions

### 1. Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_secret_key
```

### 2. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration files in `supabase/migrations/`
3. Load seed data from `supabase/seed.sql`
4. Enable pgvector extension in Supabase SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 3. Create Admin User

In Supabase SQL editor:

```sql
-- Create admin user via Supabase Auth
-- Then add admin role to user metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@jtaylorhorseboxes.com';
```

### 4. Run Development Server

```bash
pnpm install
pnpm dev
```

Access at http://localhost:3000

## API Usage Examples

### Create a Lead
```javascript
fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '01234567890',
    company: 'Example Ltd',
    source: 'website',
    consent_marketing: true
  })
})
```

### Search Knowledge Base
```javascript
fetch('/api/knowledge-base/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'horsebox maintenance tips',
    limit: 5,
    threshold: 0.7
  })
})
```

## Production Deployment

### Hostinger VPS Setup

1. Install PostgreSQL 15+ with pgvector:
   ```bash
   sudo apt update
   sudo apt install postgresql-15 postgresql-15-pgvector
   ```

2. Configure PostgreSQL for remote access
3. Set up SSL certificates
4. Configure firewall rules
5. Deploy with PM2 or systemd

### Environment Variables for Production

```env
DATABASE_URL=postgresql://user:pass@your-vps-ip:5432/jth_db
NODE_ENV=production
```

## Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Admin-only access to sensitive data
- ✅ Input validation with Zod
- ✅ GDPR compliance fields
- ✅ Audit logging for compliance
- ✅ Rate limiting ready
- ✅ SQL injection protection via Supabase client

## Performance Optimizations

- Database indexes on all foreign keys
- Partial indexes for common queries
- GIN indexes for full-text search
- IVFFlat index for vector similarity
- Pagination on all list endpoints
- Efficient batch operations

## Testing

Playwright tests included in `tests/admin-backend.spec.ts`:
- Authentication flow
- API endpoint validation
- Responsive design checks
- Form validation
- Data export functionality

Run tests:
```bash
npx playwright test admin-backend.spec.ts
```

## Next Steps

1. **Configure Supabase Project**
   - Create project at supabase.com
   - Run migrations
   - Set up authentication

2. **Add Email Notifications**
   - Configure Resend/SendGrid
   - Lead notification templates
   - Admin alerts

3. **Implement Caching**
   - Redis for API responses
   - Static generation for blog posts
   - CDN for assets

4. **Add Analytics**
   - Plausible Analytics integration
   - Custom event tracking
   - Conversion funnel analysis

5. **Enhanced Security**
   - 2FA for admin users
   - IP whitelisting option
   - Session timeout controls

## Support

For issues or questions, contact the development team or check the documentation in `/docs`.