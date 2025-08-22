#!/bin/bash
# ===================================================================
# JTH Operations Platform - Ubuntu VPS Initial Setup Script
# ===================================================================
# Run this script on a fresh Ubuntu 22.04 VPS as root or with sudo
# Usage: sudo bash setup-ubuntu.sh
# ===================================================================

set -e  # Exit on error

echo "====================================="
echo "JTH Platform - VPS Setup Starting"
echo "====================================="

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    unzip

# Install Node.js 20.x
echo "📗 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm@latest

# Install PM2
echo "🔄 Installing PM2..."
npm install -g pm2@latest

# Create application user
echo "👤 Creating application user..."
if ! id -u jthapp > /dev/null 2>&1; then
    useradd -m -s /bin/bash jthapp
    usermod -aG sudo jthapp
    echo "User 'jthapp' created"
else
    echo "User 'jthapp' already exists"
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/jth-platform
chown -R jthapp:jthapp /var/www/jth-platform

# Setup firewall
echo "🔒 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # For testing, remove in production
ufw --force enable

# Configure fail2ban for SSH protection
echo "🛡️ Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban

# Setup PM2 to run as jthapp user
echo "⚙️ Configuring PM2..."
sudo -u jthapp pm2 startup systemd -u jthapp --hp /home/jthapp
systemctl enable pm2-jthapp

# Create deployment script location
echo "📝 Creating deployment scripts directory..."
mkdir -p /home/jthapp/scripts
chown -R jthapp:jthapp /home/jthapp/scripts

# Setup log directory
echo "📊 Setting up logging..."
mkdir -p /var/log/jth-platform
chown -R jthapp:jthapp /var/log/jth-platform

# Configure nginx (basic setup, will be updated during deployment)
echo "🌐 Basic Nginx configuration..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
    location / {
        return 200 'JTH Platform - Setup Complete. Deploy application to continue.';
        add_header Content-Type text/plain;
    }
    
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

nginx -t && systemctl restart nginx

# Create environment file template
echo "📄 Creating environment template..."
sudo -u jthapp cat > /home/jthapp/.env.template << 'EOF'
# Copy this to /var/www/jth-platform/apps/web/.env.local
# and fill in your actual values

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
OPENAI_API_KEY=
RESEND_API_KEY=
NODE_ENV=production
NEXT_PUBLIC_APP_URL=
EOF

# System tuning for Node.js
echo "⚡ Optimizing system for Node.js..."
cat >> /etc/sysctl.conf << 'EOF'

# Node.js Performance Tuning
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_fin_timeout = 30
fs.file-max = 100000
EOF
sysctl -p

# Create swap if not exists (for 2GB RAM VPS)
echo "💾 Setting up swap space..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap created"
else
    echo "Swap already exists"
fi

# Install monitoring
echo "📊 Setting up monitoring..."
npm install -g clinic

echo ""
echo "====================================="
echo "✅ VPS SETUP COMPLETE!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/jth-platform"
echo "2. Configure environment variables in .env.local"
echo "3. Run the deployment script: deploy.sh"
echo "4. Configure your domain and SSL with certbot"
echo ""
echo "Important paths:"
echo "- Application: /var/www/jth-platform"
echo "- Logs: /var/log/jth-platform"
echo "- Nginx config: /etc/nginx/sites-available"
echo "- PM2 apps: pm2 list (as jthapp user)"
echo ""
echo "Security notes:"
echo "- Firewall is enabled (ports 22, 80, 443, 3000)"
echo "- Fail2ban is protecting SSH"
echo "- Remember to remove port 3000 after testing"
echo "- Configure SSL certificate with: certbot --nginx"
echo ""