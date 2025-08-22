# Operations Platform Setup Guide

## Overview
The JTH Operations Platform is now integrated with Supabase for real-time data management. This includes:
- Sales Pipeline (CRM)
- Production Tracking
- Operations Dashboard with live metrics

## Setup Instructions

### 1. Database Setup

Run the additional operations tables setup in your Supabase SQL editor:

1. Go to: https://supabase.com/dashboard/project/nsbybnsmhvviofzfgphb/sql/new
2. Run the main setup first (if not already done): `supabase/setup.sql`
3. Then run the operations tables: `supabase/ops-tables.sql`

### 2. Environment Variables

Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nsbybnsmhvviofzfgphb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Access the Operations Platform

Start the development server:
```bash
pnpm dev
```

Navigate to:
- **Dashboard**: http://localhost:3001/ops
- **Sales Pipeline**: http://localhost:3001/ops/pipeline
- **Production Tracking**: http://localhost:3001/ops/builds

## Features

### Operations Dashboard (`/ops`)
- **Real-time Metrics**: Pipeline value, production status, inventory alerts, customer stats
- **Recent Activity Feed**: Live updates from leads and production
- **Upcoming Deliveries**: Schedule overview
- **Quick Actions**: Shortcuts to common tasks

### Sales Pipeline (`/ops/pipeline`)
- **Drag & Drop**: Move leads between stages
- **Lead Management**: Add, edit, view lead details
- **Pipeline Metrics**: Total value, win rate, average deal size
- **Real-time Updates**: Live sync across all users
- **Lead Scoring**: Automatic scoring based on engagement

### Production Tracking (`/ops/builds`)
- **Stage Tracking**: 8-stage production workflow
- **Visual Progress**: Stage icons and progress bars
- **Issue Management**: Track and resolve production issues
- **Priority System**: Manage job priorities
- **Photo Documentation**: Upload progress photos
- **Quality Checks**: Track QC status

## API Endpoints

### Dashboard API
```
GET /api/ops/dashboard
```
Returns dashboard metrics and recent activities

### Pipeline API
```
GET /api/ops/pipeline
POST /api/ops/pipeline
```
Actions:
- `updateStage`: Move lead to different stage
- `createLead`: Add new lead

### Builds API
```
GET /api/ops/builds
POST /api/ops/builds
```
Actions:
- `updateStage`: Update production stage progress
- `createJob`: Create new production job
- `addIssue`: Add issue to job

## Real-time Features

All pages support real-time updates via Supabase Realtime:
- Lead changes update immediately across all users
- Production status changes reflect instantly
- Dashboard metrics update automatically

## Testing

Run the integration tests:
```bash
pnpm test:e2e tests/ops-integration.spec.ts
```

## Sample Data

The setup includes sample data:
- 3 sample leads in different stages
- 2 sample production jobs
- Activity history

## Troubleshooting

### "Failed to fetch" errors
1. Check Supabase is accessible
2. Verify environment variables
3. Ensure tables are created
4. Check browser console for details

### Real-time not working
1. Check Supabase Realtime is enabled
2. Verify anon key has correct permissions
3. Check browser WebSocket connections

### No data showing
1. Run the ops-tables.sql to insert sample data
2. Check RLS policies are correctly set
3. Verify you're logged in (if auth is required)

## Next Steps

1. **Add Authentication**: Protect ops routes with NextAuth
2. **Add More Features**:
   - Email notifications
   - Document uploads
   - Advanced reporting
   - Export functionality
3. **Mobile Optimization**: Improve mobile layouts
4. **Performance**: Add caching and optimization

## Development Notes

### Key Files
- `/lib/supabase/ops.ts` - Database helper functions
- `/lib/supabase/types.ts` - TypeScript types
- `/api/ops/*` - API endpoints
- `/app/ops/*` - UI pages

### Adding New Features
1. Update database schema in Supabase
2. Update types in `types.ts`
3. Add helper functions in `ops.ts`
4. Create/update API endpoints
5. Update UI components
6. Add tests

### Best Practices
- Always handle loading and error states
- Use optimistic updates for better UX
- Subscribe to real-time changes
- Validate data on both client and server
- Log errors for debugging