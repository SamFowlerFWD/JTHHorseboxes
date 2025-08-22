
-- Run this in Supabase SQL Editor to create migrations tracking table
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Grant appropriate permissions
GRANT ALL ON public.schema_migrations TO postgres, anon, authenticated, service_role;