# Optimized Development Plan - J Taylor Horseboxes

## Executive Summary
Simplified 6-8 week development plan for Hostinger VPS deployment, reducing costs by 75-90% while maintaining core functionality.

## Stack Simplification

### Production Stack (Hostinger VPS)
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL (on VPS)
- **File Storage**: VPS local storage
- **Image CDN**: Cloudinary (for optimization/layering)
- **AI**: OpenAI API direct integration
- **Email**: SMTP (SendGrid/Resend/Postmark) for transactional
- **CRM**: Custom-built lead management system
- **Cache**: Node.js in-memory + nginx
- **Process Manager**: PM2 or Docker
- **Reverse Proxy**: nginx

### Removed Complexity
- ❌ Monorepo structure
- ❌ Multiple edge providers (Vercel, Cloudflare)
- ❌ Expensive managed databases (Supabase, Vercel Postgres)
- ❌ Meilisearch (use PostgreSQL full-text search)
- ❌ Complex workflow automation (N8N, Chatwoot)
- ❌ Multiple caching layers

## Cost Analysis

### Monthly Operating Costs
```
Hostinger VPS (8GB RAM):     £30-40/month
Cloudinary (Starter):        £20/month
OpenAI API (usage-based):    £20-50/month
Email Service (10k/month):   £10-15/month
Domain + SSL:                £2/month
Total:                       £82-127/month

Previous estimate:           £165-2,080/month
Savings:                     50-94% reduction

Note: No HubSpot fees (saving £800+/month)
Custom CRM included in development
```

## 6-Week Development Timeline

### Week 1-2: Foundation & Migration
**Goal**: Basic website running on VPS with database

**Tasks**:
- Set up Hostinger VPS with Node.js, PostgreSQL, nginx
- Create Next.js 14 project with TypeScript
- Configure PostgreSQL database and migrations
- Implement basic pages (Home, About, Contact)
- Set up 301 redirects from old URLs
- Configure nginx reverse proxy and SSL

**Deliverables**:
- Website accessible at jthltd.co.uk
- Database connected and seeded
- Basic SEO implementation
- Contact form working

### Week 3-4: Products & Content
**Goal**: Product showcase and existing content migration

**Tasks**:
- Create product pages (3.5t, 4.5t, 7.2t models)
- Implement image galleries with Cloudinary
- Build specification tables and comparisons
- Migrate existing website content
- Implement blog/news section
- Add structured data for products

**Deliverables**:
- All product pages live
- Image optimization working
- Content migrated from old site
- Google Search Console verified

### Week 5-6: Configurator Core & Lead Capture
**Goal**: Email-gated configurator with custom CRM

**Tasks**:
- Build email capture gate for configurator access
- Create simple CRM database schema and admin panel
- Build configurator UI with Zustand state
- Implement Cloudinary image layering
- Create price calculation engine
- Add save/share functionality (tied to email)
- Build quote generation (HTML to PDF)
- Automated lead nurturing emails

**Deliverables**:
- Email-gated configurator access
- Custom CRM capturing all leads
- Lead management dashboard
- Automated follow-up sequences
- Quotes generating as PDFs
- Configuration sharing working

### Week 7-8: AI & Optimization
**Goal**: AI chat integration and performance optimization

**Tasks**:
- Integrate OpenAI for configurator assistance
- Add simple FAQ bot
- Performance optimization (caching, compression)
- Mobile responsiveness testing
- Cross-browser testing
- Security hardening

**Optional** (if time permits):
- WhatsApp integration via Twilio
- Basic analytics dashboard
- A/B testing setup

**Deliverables**:
- AI chat working
- Performance targets met (LCP < 2.5s)
- Security audit passed
- Launch ready

## Technical Implementation

### Database Schema (with Custom CRM)
```sql
-- Core tables
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  base_price DECIMAL(10,2),
  specifications JSONB,
  images JSONB
);

-- Custom CRM Tables
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  company VARCHAR(255),
  lead_source VARCHAR(100) DEFAULT 'configurator',
  lead_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, proposal, won, lost
  tags JSONB DEFAULT '[]',
  notes TEXT,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lead_activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(50), -- email_opened, link_clicked, configurator_used, quote_downloaded
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sent
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP
);

CREATE TABLE configurations (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  product_id INTEGER REFERENCES products(id),
  options JSONB,
  total_price DECIMAL(10,2),
  share_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  configuration_id INTEGER REFERENCES configurations(id),
  quote_number VARCHAR(50) UNIQUE,
  valid_until DATE,
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired
  pdf_path VARCHAR(500),
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_configurations_lead_id ON configurations(lead_id);
```

### File Structure (Simplified)
```
/var/www/jth/
├── .next/              # Next.js build output
├── public/             # Static assets
├── uploads/            # User uploads
├── quotes/             # Generated PDFs
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   ├── lib/           # Utilities
│   └── styles/        # Tailwind CSS
├── nginx.conf         # nginx configuration
├── ecosystem.config.js # PM2 configuration
└── docker-compose.yml # Optional Docker setup
```

### Deployment Configuration
```javascript
// ecosystem.config.js for PM2
module.exports = {
  apps: [{
    name: 'jth-website',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G'
  }]
}
```

### nginx Configuration
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name jthltd.co.uk www.jthltd.co.uk;

    # SSL configuration
    ssl_certificate /etc/ssl/certs/jthltd.crt;
    ssl_certificate_key /etc/ssl/private/jthltd.key;

    # Compression
    gzip on;
    gzip_types text/plain application/javascript text/css;

    # Static file caching
    location /_next/static {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Targets

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **INP**: < 200ms (Interaction to Next Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **TTFB**: < 600ms (Time to First Byte)

### Optimization Techniques
1. **Image Optimization**: Cloudinary auto-format and responsive images
2. **Code Splitting**: Dynamic imports for configurator
3. **Caching**: Browser cache + nginx cache + Node.js memory cache
4. **Database**: Indexed queries, connection pooling
5. **Compression**: Brotli/gzip for all text assets

## Security Measures

### Essential Security
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)
- CSRF tokens for forms
- Rate limiting on API routes
- Environment variables for secrets
- Regular security updates

### GDPR Compliance
- Cookie consent banner
- Privacy policy page
- Data deletion requests
- No unnecessary tracking

## Migration Strategy

### Phase 1: Parallel Running (Week 1)
1. Set up new site on staging URL
2. Import existing content
3. Test all functionality

### Phase 2: DNS Switch (Week 6-7)
1. Update DNS to point to VPS
2. Monitor 301 redirects
3. Submit sitemap to Google
4. Monitor Search Console

### Phase 3: Optimization (Week 8+)
1. Monitor analytics
2. Fix any issues
3. Iterate based on user feedback

## Risk Mitigation

### Backup Strategy
- Daily database backups
- Weekly full VPS snapshots
- Git repository for code
- Cloudinary for image backups

### Monitoring
- Uptime monitoring (UptimeRobot - free)
- Error logging (local logs + optional Sentry)
- Performance monitoring (Google Analytics)
- Server monitoring (VPS dashboard)

## Future Enhancements (Post-Launch)

### Phase 2 (Months 2-3)
- Enhanced AI features
- WhatsApp/Messenger integration
- Advanced analytics dashboard
- Multi-language support

### Phase 3 (Months 4-6)
- Mobile app (React Native)
- Dealer portal
- Advanced CRM integration
- 3D configurator upgrade

## Conclusion

This optimized plan delivers:
- ✅ 75-90% cost reduction
- ✅ 50% faster development (6-8 weeks vs 16 weeks)
- ✅ Simpler maintenance
- ✅ Full control over infrastructure
- ✅ All core features retained
- ✅ Room for future growth

The simplified stack on Hostinger VPS provides everything needed for a successful launch while maintaining flexibility for future enhancements.