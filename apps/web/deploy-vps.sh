#!/bin/bash
set -e

echo "🚀 Deploying JTH to VPS..."
echo ""

# VPS details
VPS_HOST="root@31.97.118.64"
VPS_PATH="/var/www/jth-new/apps/web"

echo "📦 Step 1/4: Creating deployment package..."
tar --exclude='node_modules' --exclude='.git' -czf jth-deploy.tar.gz \
  .next \
  public \
  package.json \
  next.config.js \
  middleware.ts \
  app \
  components \
  lib \
  supabase

echo "📤 Step 2/4: Uploading to VPS..."
scp jth-deploy.tar.gz ${VPS_HOST}:/tmp/

echo "🔧 Step 3/4: Extracting and installing on VPS..."
ssh ${VPS_HOST} << 'ENDSSH'
cd /var/www/jth-new/apps/web
echo "Backing up old build..."
rm -rf .next.backup
mv .next .next.backup 2>/dev/null || true

echo "Extracting new build..."
tar -xzf /tmp/jth-deploy.tar.gz
rm /tmp/jth-deploy.tar.gz

echo "Installing dependencies..."
pnpm install --prod

echo "Restarting application..."
pm2 restart jth-new
pm2 save
ENDSSH

echo "✅ Step 4/4: Deployment complete!"
echo ""
echo "🌐 Site should be live at: http://31.97.118.64"
echo ""
echo "To check status: ssh root@31.97.118.64 'pm2 status'"
echo "To view logs: ssh root@31.97.118.64 'pm2 logs jth'"
