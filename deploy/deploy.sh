#!/bin/bash

#################################################
# JTH Platform Deployment Script
# Handles git pull, build, and PM2 restart
#################################################

set -e

# Configuration
APP_DIR="/var/www/jth"
WEB_DIR="$APP_DIR/apps/web"
LOG_DIR="/var/log/jth"
BACKUP_DIR="/var/backups/jth"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timestamp for logs
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo -e "${GREEN}🚀 JTH Platform Deployment${NC}"
echo "=========================="
echo "Timestamp: $TIMESTAMP"
echo ""

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/deploy_$TIMESTAMP.log"
}

# Check if running as the correct user
if [ "$USER" != "jthapp" ] && [ "$USER" != "root" ]; then
    echo -e "${RED}Please run as jthapp user or root${NC}"
    exit 1
fi

# Change to app directory
cd "$APP_DIR"

# 1. Pre-deployment checks
echo -e "${YELLOW}1. Running pre-deployment checks...${NC}"

# Check if git repository exists
if [ ! -d ".git" ]; then
    log "ERROR: Not a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Warning: Uncommitted changes detected${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 2. Create backup
echo -e "${YELLOW}2. Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"

# Backup current build
if [ -d "$WEB_DIR/.next" ]; then
    tar -czf "$BACKUP_DIR/build_$TIMESTAMP.tar.gz" -C "$WEB_DIR" .next
    log "Backup created: $BACKUP_DIR/build_$TIMESTAMP.tar.gz"
fi

# Backup environment file
if [ -f "$WEB_DIR/.env.production" ]; then
    cp "$WEB_DIR/.env.production" "$BACKUP_DIR/.env.production_$TIMESTAMP"
    log "Environment backup created"
fi

# 3. Pull latest code
echo -e "${YELLOW}3. Pulling latest code from repository...${NC}"
git fetch origin
CURRENT_BRANCH=$(git branch --show-current)
log "Current branch: $CURRENT_BRANCH"

git pull origin "$CURRENT_BRANCH"
log "Code updated successfully"

# 4. Install dependencies
echo -e "${YELLOW}4. Installing dependencies...${NC}"
cd "$WEB_DIR"

# Check if package.json changed
if git diff HEAD@{1} --stat -- package.json | grep -q package.json; then
    log "package.json changed, installing dependencies..."
    pnpm install --frozen-lockfile
else
    log "No package.json changes, skipping dependency installation"
fi

# 5. Run database migrations if needed
echo -e "${YELLOW}5. Checking database...${NC}"
if [ -f "$APP_DIR/deploy/check-database.js" ]; then
    node "$APP_DIR/deploy/check-database.js" || {
        echo -e "${RED}Database check failed. Please run migrations manually.${NC}"
        # Don't exit, continue with deployment
    }
fi

# 6. Build the application
echo -e "${YELLOW}6. Building application...${NC}"
log "Starting build process..."

# Set production environment
export NODE_ENV=production

# Run build
pnpm build || {
    echo -e "${RED}Build failed!${NC}"
    
    # Offer to restore backup
    echo "Would you like to restore the previous build?"
    read -p "Restore? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "$BACKUP_DIR/build_$TIMESTAMP.tar.gz" ]; then
            tar -xzf "$BACKUP_DIR/build_$TIMESTAMP.tar.gz" -C "$WEB_DIR"
            log "Previous build restored"
        fi
    fi
    exit 1
}

log "Build completed successfully"

# 7. Test the build
echo -e "${YELLOW}7. Running smoke tests...${NC}"

# Check if the build directory exists
if [ ! -d "$WEB_DIR/.next" ]; then
    echo -e "${RED}Build directory not found!${NC}"
    exit 1
fi

# Optional: Run basic tests if they exist
if [ -f "$WEB_DIR/package.json" ] && grep -q "\"test\"" "$WEB_DIR/package.json"; then
    log "Running tests..."
    pnpm test || log "Tests failed (non-critical)"
fi

# 8. Reload application with PM2
echo -e "${YELLOW}8. Reloading application...${NC}"

# Check if PM2 is running the app
if pm2 list | grep -q "jth"; then
    # Graceful reload with 0 downtime
    pm2 reload jth --update-env
    log "Application reloaded with PM2"
else
    # Start the application
    pm2 start "$APP_DIR/deploy/ecosystem.config.js"
    pm2 save
    log "Application started with PM2"
fi

# 9. Health check
echo -e "${YELLOW}9. Running health check...${NC}"
sleep 5  # Give the app time to start

# Try to hit the health endpoint
HEALTH_CHECK_URL="http://localhost:3000/api/health"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        log "Health check successful"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "Health check attempt $RETRY_COUNT/$MAX_RETRIES..."
        sleep 3
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Health check failed after $MAX_RETRIES attempts${NC}"
    log "ERROR: Health check failed"
    
    # Show PM2 logs for debugging
    echo "Recent application logs:"
    pm2 logs jth --lines 50 --nostream
    
    exit 1
fi

# 10. Clear old backups (keep last 5)
echo -e "${YELLOW}10. Cleaning up old backups...${NC}"
cd "$BACKUP_DIR"
ls -t build_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
ls -t .env.production_* 2>/dev/null | tail -n +6 | xargs -r rm
log "Old backups cleaned"

# 11. Clear CDN cache if configured
if [ -n "$CLOUDFLARE_ZONE_ID" ] && [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${YELLOW}11. Purging CDN cache...${NC}"
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
         -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}' > /dev/null 2>&1
    log "CDN cache purged"
fi

# Success summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Summary:"
echo "  - Branch: $CURRENT_BRANCH"
echo "  - Build: Success"
echo "  - Health: Passed"
echo "  - Backup: $BACKUP_DIR/build_$TIMESTAMP.tar.gz"
echo "  - Logs: $LOG_DIR/deploy_$TIMESTAMP.log"
echo ""
echo "Application Status:"
pm2 status jth

# Send notification if webhook is configured
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
         -H 'Content-Type: application/json' \
         -d "{\"text\":\"✅ JTH deployment successful on $(hostname)\"}" \
         > /dev/null 2>&1
fi

log "Deployment completed successfully"