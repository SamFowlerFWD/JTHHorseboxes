#!/bin/bash
# ===================================================================
# JTH Operations Platform - Deployment Script
# ===================================================================
# Run this script on the VPS after initial setup
# Usage: bash deploy.sh [branch]
# Example: bash deploy.sh main
# ===================================================================

set -e  # Exit on error

# Configuration
APP_DIR="/var/www/jth-platform"
APP_USER="jthapp"
BRANCH=${1:-main}
PM2_APP_NAME="jth-web"

echo "====================================="
echo "JTH Platform - Deployment Starting"
echo "====================================="
echo "Branch: $BRANCH"
echo ""

# Check if running as correct user
if [ "$USER" != "$APP_USER" ]; then
    echo "❌ This script must be run as $APP_USER user"
    echo "   Switch user: sudo su - $APP_USER"
    exit 1
fi

# Navigate to app directory
cd $APP_DIR

# Check if this is first deployment
if [ ! -d ".git" ]; then
    echo "❌ Repository not found. First deployment?"
    echo "   Clone your repository first:"
    echo "   git clone <your-repo-url> $APP_DIR"
    exit 1
fi

# Backup current .env.local if exists
if [ -f "apps/web/.env.local" ]; then
    echo "📦 Backing up environment file..."
    cp apps/web/.env.local apps/web/.env.local.backup
fi

# Git operations
echo "📥 Pulling latest code from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH
git clean -fd

# Restore .env.local
if [ -f "apps/web/.env.local.backup" ]; then
    echo "♻️ Restoring environment file..."
    mv apps/web/.env.local.backup apps/web/.env.local
else
    echo "⚠️  No .env.local found!"
    echo "   Please create apps/web/.env.local with your production values"
    echo "   Template available at: apps/web/.env.production"
    exit 1
fi

# Check for required environment variables
echo "🔍 Checking environment configuration..."
cd apps/web
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        missing_vars+=($var)
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${missing_vars[@]}"
    echo "   Please update apps/web/.env.local"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run database verification
echo "🗄️ Verifying database..."
if [ -f "scripts/verify-database.js" ]; then
    node scripts/verify-database.js || {
        echo "⚠️  Database verification failed"
        echo "   Please run migrations in Supabase dashboard"
        echo "   Migration file: supabase/deploy-migration.sql"
    }
fi

# Build application
echo "🔨 Building application..."
pnpm build

# Health check before deployment
echo "🏥 Running health check..."
PORT=3001 timeout 10 pnpm start &
HEALTH_PID=$!
sleep 5
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
    kill $HEALTH_PID 2>/dev/null || true
else
    echo "❌ Health check failed"
    kill $HEALTH_PID 2>/dev/null || true
    exit 1
fi

# PM2 deployment
echo "🔄 Deploying with PM2..."

# Check if app exists in PM2
if pm2 show $PM2_APP_NAME > /dev/null 2>&1; then
    echo "   Reloading existing application..."
    pm2 reload $PM2_APP_NAME --update-env
else
    echo "   Starting new application..."
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

# Wait for app to be ready
echo "⏳ Waiting for application to start..."
sleep 5

# Verify deployment
echo "🔍 Verifying deployment..."
if pm2 show $PM2_APP_NAME | grep -q "online"; then
    echo "✅ Application is running"
else
    echo "❌ Application failed to start"
    echo "   Check logs: pm2 logs $PM2_APP_NAME"
    exit 1
fi

# Test application endpoint
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application responding correctly"
else
    echo "⚠️  Application not responding on port 3000"
    echo "   Check logs: pm2 logs $PM2_APP_NAME"
fi

# Clear Next.js cache
echo "🧹 Clearing caches..."
rm -rf .next/cache
pm2 flush

# Show status
echo ""
echo "====================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "====================================="
echo ""
pm2 status
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs $PM2_APP_NAME"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart $PM2_APP_NAME"
echo "- Stop: pm2 stop $PM2_APP_NAME"
echo ""
echo "Next steps:"
echo "1. Test your application at http://your-domain.com"
echo "2. Configure SSL if not done: sudo certbot --nginx"
echo "3. Monitor logs for any issues"
echo ""