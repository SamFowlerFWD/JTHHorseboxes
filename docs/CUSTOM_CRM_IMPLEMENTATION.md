# Custom CRM Implementation Guide

## Overview
A lightweight, purpose-built CRM system for J Taylor Horseboxes that captures leads through the email-gated configurator and manages the sales pipeline without expensive third-party services.

## Core Features

### 1. Lead Capture & Gating
```typescript
// Email gate component for configurator access
interface EmailGateProps {
  onSuccess: (email: string) => void;
}

const ConfiguratorEmailGate = () => {
  // Progressive information capture
  // Step 1: Email only (for quick access)
  // Step 2: Optional details after configuration
  return (
    <div className="max-w-md mx-auto">
      <h2>See Your Custom Horsebox</h2>
      <p>Enter your email to access our interactive configurator</p>
      <form onSubmit={handleSubmit}>
        <input type="email" required />
        <button>Start Configuring</button>
      </form>
      <p className="text-sm">✓ Instant access ✓ Save your designs ✓ Get expert advice</p>
    </div>
  );
};
```

### 2. Lead Scoring Algorithm
```typescript
// Automatic lead scoring based on engagement
const calculateLeadScore = (lead: Lead): number => {
  let score = 0;
  
  // Email engagement
  if (lead.emailOpened) score += 10;
  if (lead.linkClicked) score += 15;
  
  // Configurator usage
  if (lead.configurationsCreated > 0) score += 20;
  if (lead.configurationsCreated > 2) score += 30;
  
  // Quote interactions
  if (lead.quoteDownloaded) score += 40;
  if (lead.quoteViewed) score += 25;
  
  // Time-based scoring
  const daysSinceCreated = getDaysSince(lead.createdAt);
  if (daysSinceCreated < 7) score += 20; // Hot lead
  
  // Business details
  if (lead.company) score += 15;
  if (lead.phone) score += 20;
  
  return Math.min(score, 100); // Cap at 100
};
```

### 3. Admin Dashboard Pages

#### Lead Overview Dashboard
```typescript
// /app/admin/leads/page.tsx
const LeadsOverview = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="New Leads (7d)" value={newLeadsCount} />
      <StatCard title="Hot Leads" value={hotLeadsCount} />
      <StatCard title="Quotes Sent" value={quotesSentCount} />
      <StatCard title="Conversion Rate" value={conversionRate} />
      
      <LeadsTable 
        columns={['Email', 'Score', 'Last Activity', 'Status', 'Actions']}
        filters={['status', 'score', 'date']}
        sortable={true}
      />
    </div>
  );
};
```

#### Individual Lead Profile
```typescript
// /app/admin/leads/[id]/page.tsx
const LeadProfile = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <ContactInfo />
        <ActivityTimeline />
        <Configurations />
        <Quotes />
        <Notes />
      </div>
      <div>
        <LeadScore />
        <QuickActions />
        <Tags />
        <EmailHistory />
      </div>
    </div>
  );
};
```

### 4. Automated Email Sequences

#### Welcome Series (Configurator Access)
```typescript
const emailSequences = {
  configuratorWelcome: [
    {
      delay: 0, // Immediate
      subject: "Your J Taylor Horsebox Configurator Access",
      template: "configurator-welcome",
      includeConfigLink: true
    },
    {
      delay: 2, // 2 days
      subject: "Need help with your horsebox design?",
      template: "configurator-help",
      includeExamples: true
    },
    {
      delay: 7, // 7 days
      subject: "Special offer on your configured horsebox",
      template: "configurator-offer",
      includeDiscount: true
    }
  ]
};
```

#### Abandoned Configuration Recovery
```typescript
const abandonedConfigEmail = {
  trigger: "24 hours after last configuration edit",
  subject: "Your horsebox design is waiting",
  content: {
    preview: "configuration-screenshot",
    cta: "Complete Your Design",
    incentive: "Free delivery consultation"
  }
};
```

### 5. API Endpoints

```typescript
// /app/api/crm/leads/route.ts
export async function GET(request: Request) {
  // List leads with filtering
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const score = searchParams.get('minScore');
  
  const leads = await db.leads.findMany({
    where: {
      status: status || undefined,
      leadScore: score ? { gte: parseInt(score) } : undefined
    },
    orderBy: { lastActivity: 'desc' }
  });
  
  return Response.json(leads);
}

export async function POST(request: Request) {
  // Create new lead from configurator
  const data = await request.json();
  
  const lead = await db.leads.create({
    data: {
      email: data.email,
      leadSource: 'configurator',
      leadScore: 20, // Base score for configurator access
      activities: {
        create: {
          activityType: 'configurator_accessed',
          details: { ip: request.ip }
        }
      }
    }
  });
  
  // Trigger welcome email
  await sendEmail('configurator-welcome', lead.email);
  
  return Response.json(lead);
}
```

### 6. Lead Management Features

#### Bulk Actions
- Send email campaign to selected leads
- Update status for multiple leads
- Export leads to CSV
- Assign tags in bulk
- Delete old/unengaged leads

#### Smart Filters
- **Hot Leads**: Score > 70, activity < 7 days
- **Cold Leads**: No activity > 30 days
- **Quote Ready**: Viewed configuration > 3 times
- **Follow-up Required**: Status = 'contacted', last activity > 3 days

#### Activity Tracking
```typescript
const trackActivity = async (leadId: number, activity: ActivityType, details?: any) => {
  await db.leadActivities.create({
    data: {
      leadId,
      activityType: activity,
      details: details || {}
    }
  });
  
  // Update lead score
  await updateLeadScore(leadId);
  
  // Update last activity
  await db.leads.update({
    where: { id: leadId },
    data: { lastActivity: new Date() }
  });
};
```

### 7. Reports & Analytics

#### Key Metrics Dashboard
```typescript
const CRMAnalytics = () => {
  const metrics = {
    leadConversionRate: "12%",
    avgTimeToConvert: "14 days",
    topLeadSource: "Configurator (67%)",
    avgLeadScore: 45,
    monthlyGrowth: "+23%"
  };
  
  return (
    <div>
      <MetricCards metrics={metrics} />
      <LeadFunnel stages={funnelData} />
      <ConversionChart data={conversionData} />
      <LeadSourcePieChart sources={sourceData} />
    </div>
  );
};
```

### 8. Integration Points

#### With Configurator
- Auto-save configuration to lead profile
- Track time spent configuring
- Record selected options for insights
- Generate personalized quotes

#### With Quote System
- Link quotes to leads
- Track quote views and downloads
- Send follow-up emails automatically
- Update lead score on quote interaction

#### With Email System
- Track opens and clicks
- Unsubscribe handling
- Email preference center
- Campaign performance metrics

## Implementation Timeline

### Phase 1: Core CRM (Week 5)
- Database schema setup
- Lead capture form
- Basic admin dashboard
- Email gate for configurator

### Phase 2: Automation (Week 6)
- Email sequences
- Lead scoring
- Activity tracking
- Abandoned cart recovery

### Phase 3: Advanced Features (Week 7)
- Reports and analytics
- Bulk actions
- Advanced filtering
- Export functionality

## Security Considerations

```typescript
// Middleware for admin routes
export function middleware(request: NextRequest) {
  // Check admin authentication
  const token = request.cookies.get('admin-token');
  
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.redirect('/admin/login');
  }
  
  // Rate limiting for API endpoints
  const ip = request.ip || 'unknown';
  if (isRateLimited(ip)) {
    return new Response('Too many requests', { status: 429 });
  }
  
  return NextResponse.next();
}
```

## Benefits Over HubSpot

### Cost Savings
- **HubSpot**: £800-2,400/month
- **Custom CRM**: £0/month (after development)
- **Annual Savings**: £9,600-28,800

### Advantages
- No per-contact pricing
- Full data ownership
- Custom features for horsebox industry
- No API rate limits
- Integrated with configurator
- GDPR compliant by design

### Limitations to Accept
- No built-in phone calling
- Basic email templates
- Manual data enrichment
- Simpler automation rules

## Future Enhancements

### Phase 2 (Post-Launch)
- SMS notifications
- WhatsApp integration
- Advanced lead scoring ML
- Predictive analytics
- Multi-user support with roles

### Phase 3 (Growth)
- Mobile app for sales team
- Calendar integration
- Video call scheduling
- AI-powered lead insights
- Custom reporting builder

## Conclusion

This custom CRM solution provides all essential lead management features while saving £800+/month compared to HubSpot. It's perfectly tailored for the horsebox configurator workflow and can be enhanced over time based on actual business needs.