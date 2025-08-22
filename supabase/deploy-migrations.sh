#!/bin/bash

# JTH Database Migration Deployment Script
# =========================================

echo "JTH Database Migration Deployment"
echo "================================="
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null && ! command -v npx &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it using: npm install -g supabase"
    exit 1
fi

# Use npx if supabase is not directly available
SUPABASE_CMD="supabase"
if ! command -v supabase &> /dev/null; then
    SUPABASE_CMD="npx supabase"
fi

# Function to run Supabase commands
run_supabase() {
    $SUPABASE_CMD "$@"
}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for environment variables or prompt
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo -n "Enter your Supabase Project ID: "
    read SUPABASE_PROJECT_ID
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -n "Enter your Supabase Database Password: "
    read -s SUPABASE_DB_PASSWORD
    echo ""
fi

# Export for Supabase CLI
export SUPABASE_PROJECT_ID
export SUPABASE_DB_PASSWORD

echo ""
echo "Deployment Options:"
echo "1. Deploy to LOCAL Supabase (Docker required)"
echo "2. Deploy to REMOTE Supabase project"
echo -n "Choose option (1 or 2): "
read DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo -e "${YELLOW}Starting local Supabase...${NC}"
        run_supabase start
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to start local Supabase. Is Docker running?${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}Local Supabase started successfully${NC}"
        echo ""
        echo "Local database credentials:"
        run_supabase status
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Linking to remote Supabase project...${NC}"
        run_supabase link --project-ref $SUPABASE_PROJECT_ID --password $SUPABASE_DB_PASSWORD
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to link to Supabase project${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}Successfully linked to project: $SUPABASE_PROJECT_ID${NC}"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
echo ""

# List migrations to be applied
echo "Migrations to apply:"
ls -1 migrations/*.sql | while read file; do
    echo "  - $(basename $file)"
done

echo ""
echo -n "Continue with migration? (y/n): "
read CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Migration cancelled"
    exit 0
fi

# Run migrations
if [ "$DEPLOY_OPTION" == "1" ]; then
    # Local deployment
    run_supabase db reset
else
    # Remote deployment
    run_supabase db push
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Migrations deployed successfully!${NC}"
    echo ""
    echo "Database setup complete with:"
    echo "  ✓ Core tables (users, organizations, contacts, etc.)"
    echo "  ✓ Product models and options"
    echo "  ✓ Sales pipeline tables"
    echo "  ✓ Production tracking"
    echo "  ✓ Knowledge base and FAQs"
    echo "  ✓ Vector search functions"
    echo "  ✓ Audit logging"
    echo "  ✓ Row Level Security policies"
    echo "  ✓ Sample JTH model data"
    echo ""
    
    if [ "$DEPLOY_OPTION" == "1" ]; then
        echo "Access your local Supabase at:"
        echo "  Studio: http://localhost:54323"
        echo "  API: http://localhost:54321"
    else
        echo "Access your Supabase project at:"
        echo "  https://app.supabase.com/project/$SUPABASE_PROJECT_ID"
    fi
else
    echo ""
    echo -e "${RED}✗ Migration failed${NC}"
    echo "Please check the error messages above"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Update your .env file with the database credentials"
echo "2. Test the API endpoints"
echo "3. Verify RLS policies are working correctly"
echo "4. Run the test suite to ensure everything is configured"