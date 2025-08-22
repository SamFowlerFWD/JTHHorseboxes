#!/bin/bash
# ===================================================================
# JTH Platform - Quick Deployment Script
# ===================================================================
# One-command deployment after initial setup
# Usage: bash quick-deploy.sh
# ===================================================================

set -e

echo "======================================"
echo "🚀 JTH Platform Quick Deploy"
echo "======================================"

# Configuration
REPO_URL="git@github.com:your-username/your-repo.git"  # UPDATE THIS
DOMAIN="your-domain.com"  # UPDATE THIS
EMAIL="admin@your-domain.com"  # UPDATE THIS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   print_error "Please run as root (use sudo)"
   exit 1
fi

print_status "Starting quick deployment..."

# Step 1: System Update
print_status "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Step 2: Install Dependencies
print_status "Installing dependencies..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@latest
fi

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2@latest
fi

# Step 3: Create application user if not exists
if ! id -u jthapp > /dev/null 2>&1; then
    print_status "Creating application user..."
    useradd -m -s /bin/bash jthapp
    usermod -aG sudo jthapp
fi

# Step 4: Setup application directory
print_status "Setting up application directory..."
mkdir -p /var/www
chown -R jthapp:jthapp /var/www

# Step 5: Clone or update repository
if [ -d "/var/www/jth-platform/.git" ]; then
    print_status "Updating existing repository..."
    sudo -u jthapp bash -c "cd /var/www/jth-platform && git pull origin main"
else
    print_status "Cloning repository..."
    sudo -u jthapp bash -c "cd /var/www && git clone $REPO_URL jth-platform"
fi

# Step 6: Check for environment file
if [ ! -f "/var/www/jth-platform/apps/web/.env.local" ]; then
    print_warning "Environment file not found!"
    echo ""
    echo "Please create /var/www/jth-platform/apps/web/.env.local with:"
    echo ""
    cat << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NODE_ENV=production
EOF
    echo ""
    read -p "Press enter after creating .env.local file..."
fi

# Step 7: Install and build application
print_status "Installing dependencies and building..."
sudo -u jthapp bash -c "cd /var/www/jth-platform/apps/web && pnpm install --frozen-lockfile && pnpm build"

# Step 8: Setup PM2
print_status "Configuring PM2..."
sudo -u jthapp bash -c "cd /var/www/jth-platform/apps/web && pm2 delete jth-web 2>/dev/null || true"
sudo -u jthapp bash -c "cd /var/www/jth-platform/apps/web && pm2 start ecosystem.config.js"
sudo -u jthapp bash -c "pm2 save"
pm2 startup systemd -u jthapp --hp /home/jthapp

# Step 9: Configure Nginx
print_status "Configuring Nginx..."
if [ ! -f "/etc/nginx/sites-available/jth-platform" ]; then
    cp /var/www/jth-platform/deployment/nginx.conf /etc/nginx/sites-available/jth-platform
    sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/jth-platform
    ln -sf /etc/nginx/sites-available/jth-platform /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

nginx -t && systemctl reload nginx

# Step 10: Setup SSL (if not already done)
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    print_status "Setting up SSL certificate..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
else
    print_status "SSL certificate already exists"
fi

# Step 11: Configure firewall
print_status "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Step 12: Verify deployment
print_status "Verifying deployment..."
sleep 5

# Check PM2
if sudo -u jthapp pm2 show jth-web | grep -q "online"; then
    print_status "PM2 application running"
else
    print_error "PM2 application not running"
    sudo -u jthapp pm2 logs jth-web --lines 20
fi

# Check health endpoint
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "Health check passed"
else
    print_error "Health check failed"
fi

# Final status
echo ""
echo "======================================"
echo "🎉 Deployment Complete!"
echo "======================================"
echo ""
echo "Access your site at: https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  pm2 status         - Check application status"
echo "  pm2 logs jth-web   - View application logs"
echo "  pm2 restart jth-web - Restart application"
echo ""
echo "Next steps:"
echo "1. Verify site is accessible at https://$DOMAIN"
echo "2. Test all functionality"
echo "3. Configure monitoring"
echo "4. Set up backups"
echo ""

# Show current status
sudo -u jthapp pm2 status