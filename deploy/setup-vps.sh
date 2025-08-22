#!/bin/bash

#################################################
# VPS Initial Setup Script for Ubuntu
# Sets up Node.js, pnpm, PM2, Nginx, and SSL
#################################################

set -e

# Configuration
NODE_VERSION="20"  # LTS version
DOMAIN=""  # Will be set by user
EMAIL=""   # For Let's Encrypt

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 JTH Operations Platform - VPS Setup${NC}"
echo "========================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

# Get domain and email if not set
if [ -z "$DOMAIN" ]; then
    read -p "Enter your domain name (e.g., jth.example.com): " DOMAIN
fi

if [ -z "$EMAIL" ]; then
    read -p "Enter email for SSL certificates: " EMAIL
fi

echo ""
echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update system
echo -e "${YELLOW}1. Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js
echo -e "${YELLOW}2. Installing Node.js v${NODE_VERSION}...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Install pnpm
echo -e "${YELLOW}3. Installing pnpm...${NC}"
npm install -g pnpm@latest

# Install PM2
echo -e "${YELLOW}4. Installing PM2...${NC}"
npm install -g pm2@latest

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root

# Create application user
echo -e "${YELLOW}5. Creating application user...${NC}"
if ! id -u jthapp >/dev/null 2>&1; then
    useradd -m -s /bin/bash jthapp
    usermod -aG sudo jthapp
fi

# Create application directory
echo -e "${YELLOW}6. Setting up application directory...${NC}"
mkdir -p /var/www/jth
chown -R jthapp:jthapp /var/www/jth

# Setup firewall
echo -e "${YELLOW}7. Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure Nginx
echo -e "${YELLOW}8. Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/jth << EOF
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    # SSL certificates will be added by certbot
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/x-js text/x-cross-domain-policy application/x-font-ttf application/x-font-opentype application/vnd.ms-fontobject image/x-icon;

    # Max upload size (for configurator images)
    client_max_body_size 10M;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/jth /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Create deployment directory structure
echo -e "${YELLOW}9. Creating deployment structure...${NC}"
mkdir -p /var/www/certbot
mkdir -p /var/log/jth
chown -R jthapp:jthapp /var/log/jth

# Install SSL certificate
echo -e "${YELLOW}10. Setting up SSL certificate...${NC}"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Setup auto-renewal
echo "0 0 * * * root certbot renew --quiet --no-self-upgrade --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew

# Create deployment script
echo -e "${YELLOW}11. Creating deployment helper script...${NC}"
cat > /usr/local/bin/jth-deploy << 'EOFDEPLOY'
#!/bin/bash
# Quick deployment script
cd /var/www/jth
git pull origin main
pnpm install --frozen-lockfile
pnpm build
pm2 reload jth
echo "✅ Deployment complete!"
EOFDEPLOY

chmod +x /usr/local/bin/jth-deploy

# Setup log rotation
echo -e "${YELLOW}12. Configuring log rotation...${NC}"
cat > /etc/logrotate.d/jth << EOF
/var/log/jth/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 jthapp jthapp
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create systemd service for PM2
echo -e "${YELLOW}13. Setting up systemd service...${NC}"
pm2 save

echo ""
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository:"
echo "   cd /var/www/jth"
echo "   git clone https://github.com/your-repo/jth.git ."
echo ""
echo "2. Copy environment variables:"
echo "   Create /var/www/jth/apps/web/.env.production"
echo ""
echo "3. Install dependencies and build:"
echo "   cd /var/www/jth/apps/web"
echo "   pnpm install --frozen-lockfile"
echo "   pnpm build"
echo ""
echo "4. Start the application:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "5. Test the deployment:"
echo "   curl https://$DOMAIN/api/health"
echo ""
echo "Server Information:"
echo "  Domain: https://$DOMAIN"
echo "  Nginx Config: /etc/nginx/sites-available/jth"
echo "  App Directory: /var/www/jth"
echo "  Logs: /var/log/jth/"
echo "  Quick Deploy: jth-deploy"
echo ""