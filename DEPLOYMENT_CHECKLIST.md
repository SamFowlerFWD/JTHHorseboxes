# JTH Platform - Production Deployment Checklist

## Pre-Deployment Verification ✅

### 1. Code Quality
- [x] Production build successful (`pnpm build`)
- [x] No TypeScript errors
- [x] All tests passing
- [x] No console errors in browser
- [x] Suspense boundaries added for dynamic components

### 2. Environment Configuration
- [x] `.env.example` created with all variables documented
- [x] `.env.production` template ready
- [x] `.gitignore` updated to exclude sensitive files
- [x] All secrets removed from codebase

### 3. Database Ready
- [x] Migration script created (`supabase/deploy-migration.sql`)
- [x] Verification script ready (`scripts/verify-database.js`)
- [x] Sample data included for testing
- [x] RLS policies configured

### 4. Deployment Scripts
- [x] VPS setup script (`deployment/setup-ubuntu.sh`)
- [x] Deployment script (`deployment/deploy.sh`)
- [x] Nginx configuration (`deployment/nginx.conf`)
- [x] PM2 configuration (`ecosystem.config.js`)

### 5. Security Measures
- [x] Rate limiting implemented
- [x] Security headers configured
- [x] CORS settings ready
- [x] Input validation in place
- [x] CSP headers for production

## VPS Deployment Steps 🚀

### Step 1: Initial VPS Setup
```bash
# Connect to VPS
ssh root@your-vps-ip

# Run setup script
wget https://raw.githubusercontent.com/your-repo/main/deployment/setup-ubuntu.sh
sudo bash setup-ubuntu.sh

# Switch to app user
sudo su - jthapp
```

### Step 2: Repository Setup
```bash
# Clone repository
cd /var/www
git clone <your-repo-url> jth-platform
cd jth-platform
```

### Step 3: Environment Configuration
```bash
# Setup environment variables
cd apps/web
cp .env.production .env.local
nano .env.local  # Add your actual values

# CRITICAL: Update these values
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (your production domain)
```

### Step 4: Database Setup
1. Go to Supabase SQL Editor
2. Run `apps/web/supabase/deploy-migration.sql`
3. Verify with: `node scripts/verify-database.js`

### Step 5: Deploy Application
```bash
# Run deployment
cd /var/www/jth-platform
bash deployment/deploy.sh main
```

### Step 6: Configure Nginx
```bash
# Setup Nginx
sudo cp deployment/nginx.conf /etc/nginx/sites-available/jth-platform
sudo nano /etc/nginx/sites-available/jth-platform  # Update domain
sudo ln -s /etc/nginx/sites-available/jth-platform /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate
```bash
# Install SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Post-Deployment Verification ✔️

### Functionality Tests
- [ ] Homepage loads (https://your-domain.com)
- [ ] Health check passes (https://your-domain.com/api/health)
- [ ] Configurator functional
- [ ] Quote generation works
- [ ] Lead capture successful
- [ ] Admin panel accessible
- [ ] Database queries working

### Performance Tests
- [ ] Lighthouse score > 90
- [ ] Page load < 3 seconds
- [ ] API responses < 500ms
- [ ] Images loading properly

### Security Tests
- [ ] HTTPS enforced
- [ ] SSL certificate valid
- [ ] Security headers present (check with securityheaders.com)
- [ ] Rate limiting active
- [ ] No exposed .env files

## Quick Reference Commands 📋

### Application Management
```bash
# Check status
pm2 status

# View logs
pm2 logs jth-web

# Restart app
pm2 restart jth-web

# Monitor resources
pm2 monit
```

### Deployment Updates
```bash
# Deploy updates
cd /var/www/jth-platform
git pull origin main
bash deployment/deploy.sh main
```

### Troubleshooting
```bash
# Check errors
pm2 logs jth-web --err --lines 50

# Verify database
node apps/web/scripts/verify-database.js

# Test locally
curl http://localhost:3000/api/health

# Check nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Emergency Rollback
```bash
# Rollback to previous commit
cd /var/www/jth-platform
git log --oneline -5  # Find previous commit
git reset --hard <commit-hash>
bash deployment/deploy.sh main
```

## Important Notes ⚠️

1. **Supabase Connection**: Ensure your VPS IP is whitelisted in Supabase if using IP restrictions
2. **Environment Variables**: Never commit `.env.local` or `.env.production` with real values
3. **Database Migrations**: Always backup before running migrations
4. **PM2 Save**: Run `pm2 save` after any PM2 configuration changes
5. **Monitoring**: Set up uptime monitoring (e.g., UptimeRobot) after deployment

## Git Workflow for Updates

### Local Development
```bash
# Make changes locally
git add .
git commit -m "feat: description"
git push origin main
```

### On VPS
```bash
# Deploy updates
ssh jthapp@your-vps-ip
cd /var/www/jth-platform
bash deployment/deploy.sh main
```

## Support Contacts

- **Supabase Dashboard**: https://app.supabase.com/project/nsbybnsmhvviofzfgphb
- **Application Logs**: `/var/log/jth-platform/`
- **PM2 Dashboard**: `pm2 monit`
- **Nginx Logs**: `/var/log/nginx/`

## Final Checklist Before Going Live

- [ ] All environment variables configured correctly
- [ ] Database migrations completed successfully
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall rules configured (ports 80, 443 only)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Admin user created in database
- [ ] Test email sending (if configured)
- [ ] Remove port 3000 from firewall after testing
- [ ] DNS fully propagated

## Success Indicators 🎉

When deployment is successful, you should see:
- ✅ PM2 status shows "online" for jth-web
- ✅ `https://your-domain.com` loads with valid SSL
- ✅ `/api/health` returns 200 OK
- ✅ No errors in PM2 logs
- ✅ Database verification passes
- ✅ Admin panel accessible with authentication

---

**Remember**: Always test in a staging environment first if possible. Take backups before any major changes. Document any custom modifications for future reference.

**Deployment Complete!** 🚀

Your JTH Operations Platform is now ready for production use.