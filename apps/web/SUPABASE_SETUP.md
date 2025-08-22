# Supabase Setup Instructions for JTH Admin Backend

## Your Project Details
- **Project ID**: `nsbybnsmhvviofzfgphb`
- **Project URL**: `https://nsbybnsmhvviofzfgphb.supabase.co`
- **Anon Key**: Already configured in `.env.local`

## Step 1: Run Database Setup

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/nsbybnsmhvviofzfgphb/sql/new

2. Copy and paste the entire contents of `supabase/setup.sql` into the SQL editor

3. Click "Run" to create all tables, indexes, and policies

## Step 2: Create Admin User

1. Go to Authentication → Users in your Supabase dashboard
2. Click "Invite User" or "Create User"
3. Create a user with email (e.g., `admin@jtaylorhorseboxes.com`)
4. After the user is created, go back to SQL editor and run:

```sql
-- Replace with the actual email you used
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtaylorhorseboxes.com'
);
```

## Step 3: Get Service Role Key (For Server-Side Operations)

1. Go to Settings → API in your Supabase dashboard
2. Copy the "service_role" key (keep this secret!)
3. Add it to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Test the Setup

1. The dev server should be running on http://localhost:3001
2. Try accessing `/login` and sign in with your admin user
3. Test creating a lead via the API:

```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "consent_marketing": true
  }'
```

## Step 5: Optional - Enable OpenAI for RAG

If you want to use the knowledge base with AI search:

1. Get an OpenAI API key from https://platform.openai.com
2. Add it to `.env.local`:

```env
OPENAI_API_KEY=sk-...your_key_here
```

## Database Tables Created

✅ **leads** - Lead management and CRM
✅ **blog_posts** - Blog content management
✅ **pricing_options** - Configurator pricing (3.5t, 4.5t, 7.2t)
✅ **knowledge_base** - RAG agent content with embeddings
✅ **lead_activities** - Activity tracking
✅ **saved_configurations** - Saved horsebox configurations
✅ **profiles** - User profiles with admin roles

## Security Features Enabled

- Row Level Security (RLS) on all tables
- Admin-only access to sensitive data
- Public access only where appropriate (lead creation, published content)
- Automatic timestamps and audit trails

## Test URLs

- **Login**: http://localhost:3001/login
- **Admin Dashboard**: http://localhost:3001/admin (requires auth)
- **Lead Management**: http://localhost:3001/admin/leads
- **API Test**: http://localhost:3001/api/pricing (public endpoint)

## Troubleshooting

If you get authentication errors:
1. Make sure you've created the admin user
2. Check that the profile role is set to 'admin'
3. Verify the anon key is correctly set in `.env.local`

If tables are not found:
1. Run the setup.sql script in Supabase SQL editor
2. Check for any errors in the SQL execution
3. Verify pgvector extension is enabled

## Next Steps

1. **Production Deployment**: Update environment variables for production
2. **Add Service Role Key**: Required for server-side operations
3. **Configure Email**: Set up Resend/SendGrid for notifications
4. **Add OpenAI Key**: Enable AI-powered knowledge search
5. **Test All Features**: Use the admin dashboard to verify everything works