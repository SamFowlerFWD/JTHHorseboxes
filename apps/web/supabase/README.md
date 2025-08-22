# Supabase Database Documentation

## Overview

This directory contains the complete database schema and utilities for J Taylor Horseboxes, including:
- Admin backend functionality
- CRM and lead management
- Blog CMS
- Configurator pricing system
- RAG-powered knowledge base
- Quote generation and tracking

## Database Structure

### Core Tables

#### 1. **leads**
Stores customer lead information with GDPR compliance.
- Full contact details
- UTM tracking for marketing attribution
- Configuration and quote amounts
- Marketing consent management

#### 2. **blog_posts**
Full CMS functionality for content marketing.
- Draft/publish workflow
- SEO metadata
- Author attribution
- Categories and tags

#### 3. **pricing_options**
Dynamic pricing for configurator.
- Model-specific options (3.5t, 4.5t, 7.2t)
- Categories and subcategories
- Dependencies and incompatibilities
- VAT calculation support

#### 4. **knowledge_base**
RAG agent content with vector embeddings.
- OpenAI embeddings (1536 dimensions)
- Semantic and hybrid search
- Relevance scoring
- Content categorization

#### 5. **saved_configurations**
User-created horsebox configurations.
- Anonymous and authenticated saves
- Share tokens for social sharing
- Automatic expiry for anonymous configs
- Price totals

#### 6. **lead_activities**
CRM activity tracking.
- Email, call, meeting tracking
- Status changes
- Metadata storage

#### 7. **quotes**
Quote generation and tracking.
- Unique quote numbers
- PDF storage
- Validity periods
- View and acceptance tracking

#### 8. **email_templates**
Automated email templates.
- Variable substitution
- HTML and plain text versions
- Active/inactive status

#### 9. **admin_audit_log**
Compliance and security auditing.
- All admin actions logged
- Before/after data capture
- IP and user agent tracking

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

**Admin Access:**
- Full CRUD on all tables for admin users
- Admin status checked via JWT metadata

**Public Access:**
- Read-only for published blog posts
- Read-only for available pricing options
- Read-only for published knowledge base
- Insert-only for leads (contact forms)
- Read/write own saved configurations

**Authentication:**
- Integrated with Supabase Auth
- Admin role stored in user metadata
- Session-based access for configurations

## Vector Search Setup

### Prerequisites

1. Enable pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS "vector";
```

2. Set OpenAI API key in environment:
```env
OPENAI_API_KEY=your_key_here
```

### Embedding Generation

Embeddings are automatically generated when:
- Creating/updating knowledge base entries
- Using the `upsertKnowledgeEntry()` function

### Search Functions

**Semantic Search:**
```typescript
const results = await searchKnowledge("horsebox maintenance", {
  matchThreshold: 0.7,
  matchCount: 5
})
```

**Hybrid Search (Semantic + Keyword):**
```typescript
const results = await hybridSearchKnowledge("3.5t licence requirements", {
  matchThreshold: 0.6,
  matchCount: 10
})
```

## Migration Instructions

### Initial Setup

1. Create a new Supabase project
2. Run migrations in order:
```bash
# Run initial schema
psql -h [host] -U postgres -d [database] -f migrations/001_initial_schema.sql

# Run enhancements
psql -h [host] -U postgres -d [database] -f migrations/002_enhanced_schema.sql

# Load seed data (optional)
psql -h [host] -U postgres -d [database] -f seed.sql
```

### Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref [project-id]

# Run migrations
supabase db push

# Reset database (development only)
supabase db reset
```

## Admin Functions Usage

### Lead Management

```typescript
import { leadAdmin } from '@/lib/supabase/admin'

// Get paginated leads
const { leads, total, pages } = await leadAdmin.getLeads({
  page: 1,
  limit: 20,
  status: 'new',
  search: 'john'
})

// Get lead with activities
const { lead, activities } = await leadAdmin.getLead(leadId)

// Update lead status
await leadAdmin.updateLead(leadId, { status: 'qualified' })

// Add activity
await leadAdmin.addActivity({
  lead_id: leadId,
  activity_type: 'email_sent',
  description: 'Sent quote follow-up'
})
```

### Blog Management

```typescript
import { blogAdmin } from '@/lib/supabase/admin'

// Create draft post
const post = await blogAdmin.createPost({
  title: 'Maintenance Tips',
  slug: 'maintenance-tips',
  content: '...',
  status: 'draft'
})

// Publish post
await blogAdmin.publishPost(postId)
```

### Quote Generation

```typescript
import { quoteAdmin } from '@/lib/supabase/admin'

// Create quote
const quote = await quoteAdmin.createQuote({
  lead_id: leadId,
  configuration_id: configId,
  total_amount: 35000,
  vat_amount: 7000
})

// Mark as sent
await quoteAdmin.markQuoteSent(quoteId)
```

## Knowledge Base Management

### Adding Content

```typescript
import { upsertKnowledgeEntry } from '@/lib/supabase/knowledge-base'

await upsertKnowledgeEntry({
  title: 'Towing Licence Requirements',
  content: 'Detailed information about licence requirements...',
  category: 'licensing',
  tags: ['licence', 'legal', 'towing'],
  source: 'faq',
  relevance_score: 1.0
})
```

### Batch Import

```typescript
import { batchImportKnowledge } from '@/lib/supabase/knowledge-base'

const entries = [
  { title: '...', content: '...' },
  // ... more entries
]

const { success, failed } = await batchImportKnowledge(entries)
```

### RAG Context Generation

```typescript
import { getRAGContext } from '@/lib/supabase/knowledge-base'

// Get context for AI response
const context = await getRAGContext(userQuery, 3000) // max tokens
```

## Performance Optimization

### Indexes

Critical indexes are created for:
- Foreign key relationships
- Frequently queried columns
- Full-text search (GIN indexes)
- Vector similarity search (IVFFlat)
- Partial indexes for filtered queries

### Query Optimization

- Use partial indexes for status filters
- Leverage database functions for complex operations
- Batch operations to reduce round trips
- Use connection pooling in production

## Monitoring and Maintenance

### Regular Tasks

1. **Clean expired configurations:**
```sql
SELECT cleanup_expired_configurations();
```

2. **Update missing embeddings:**
```typescript
await updateMissingEmbeddings()
```

3. **Monitor table sizes:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup Strategy

1. Enable Point-in-Time Recovery in Supabase dashboard
2. Regular logical backups:
```bash
pg_dump -h [host] -U postgres -d [database] > backup_$(date +%Y%m%d).sql
```

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key
```

## Troubleshooting

### Common Issues

1. **RLS Policy Violations:**
   - Check user authentication status
   - Verify admin role in JWT metadata
   - Use service role key for admin operations

2. **Embedding Generation Failures:**
   - Verify OpenAI API key
   - Check rate limits
   - Ensure text content is not empty

3. **Search Performance:**
   - Verify vector index exists
   - Check embedding dimensions (must be 1536)
   - Monitor query execution plans

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Review RLS policies for access issues
3. Monitor API usage for rate limits
4. Check database performance metrics