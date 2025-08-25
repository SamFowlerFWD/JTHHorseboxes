#!/bin/bash

# JTH Operations Platform Quick Start Script
# This script helps you quickly set up and verify the operations platform

echo "======================================"
echo "JTH Operations Platform - Quick Start"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
fi

# Step 2: Check environment variables
echo ""
echo "🔐 Checking environment variables..."

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local file not found${NC}"
    echo "Creating .env.local template..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Add other environment variables as needed
EOF
    echo -e "${YELLOW}Please edit .env.local with your Supabase credentials${NC}"
    exit 1
fi

# Check if variables are set
source .env.local
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your-project-url" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not configured in .env.local${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Supabase URL configured${NC}"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "your-service-role-key" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not configured (needed for migration)${NC}"
fi

# Step 3: Install dependencies
echo ""
echo "📦 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check for specific required packages
REQUIRED_PACKAGES=("@hello-pangea/dnd" "@supabase/supabase-js" "date-fns")
for package in "${REQUIRED_PACKAGES[@]}"; do
    if [ ! -d "node_modules/$package" ]; then
        echo -e "${YELLOW}Installing missing package: $package${NC}"
        npm install "$package"
    fi
done

# Step 4: Migration options
echo ""
echo "🗄️  Database Migration"
echo "===================="
echo ""
echo "Choose how to apply the migration:"
echo "1. Via Supabase Dashboard (recommended for production)"
echo "2. Via migration script (requires service role key)"
echo "3. Show migration file location"
echo "4. Skip migration"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 Manual Migration Instructions:"
        echo "1. Go to your Supabase Dashboard"
        echo "2. Navigate to SQL Editor"
        echo "3. Create a new query"
        echo "4. Copy the contents of:"
        echo "   $(pwd)/supabase/migrations/005_comprehensive_operations.sql"
        echo "5. Run the query"
        echo ""
        echo -e "${YELLOW}Press Enter when you've completed the migration...${NC}"
        read
        ;;
    2)
        echo "Running migration script..."
        npx tsx scripts/apply-operations-migration.ts
        ;;
    3)
        echo ""
        echo "Migration file location:"
        echo "$(pwd)/supabase/migrations/005_comprehensive_operations.sql"
        echo ""
        ;;
    4)
        echo "Skipping migration..."
        ;;
esac

# Step 5: Test the platform
echo ""
echo "🧪 Testing the platform..."
echo ""
read -p "Would you like to run the test suite? (y/n): " run_tests

if [ "$run_tests" = "y" ] || [ "$run_tests" = "Y" ]; then
    echo "Running tests..."
    npx tsx scripts/test-operations-platform.ts
fi

# Step 6: Start the development server
echo ""
echo "🚀 Ready to start!"
echo "=================="
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run test         - Run test suite"
echo ""
echo "Key URLs (after starting dev server):"
echo "  Sales Pipeline:      http://localhost:3000/ops/pipeline"
echo "  Build Tracking:      http://localhost:3000/ops/builds"
echo "  Customer Portal:     http://localhost:3000/portal/tracker/[buildId]"
echo ""
echo "Documentation:"
echo "  $(pwd)/docs/OPERATIONS_PLATFORM_README.md"
echo ""
read -p "Would you like to start the development server now? (y/n): " start_dev

if [ "$start_dev" = "y" ] || [ "$start_dev" = "Y" ]; then
    echo ""
    echo "Starting development server..."
    echo -e "${GREEN}Access the application at http://localhost:3000${NC}"
    npm run dev
fi

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"