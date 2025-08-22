#!/bin/bash
# Database connection helper for JTH migrations

# Get these values from Supabase Dashboard > Settings > Database
DB_HOST="db.nsbybnsmhvviofzfgphb.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="[YOUR-DATABASE-PASSWORD]" # Get from Supabase Dashboard

# Connection string
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Connecting to database..."
psql $CONNECTION_STRING -f combined_migrations_*.sql

# Or use this for interactive mode:
# psql $CONNECTION_STRING
