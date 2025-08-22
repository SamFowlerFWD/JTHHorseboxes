/**
 * PM2 Configuration File
 * This file configures how PM2 manages the Next.js application in production
 */

module.exports = {
  apps: [
    {
      name: 'jth-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/jth-platform/apps/web',
      
      // Cluster mode with automatic load balancing
      instances: process.env.PM2_INSTANCES || 2,
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logging
      error_file: '/var/log/jth-platform/error.log',
      out_file: '/var/log/jth-platform/out.log',
      log_file: '/var/log/jth-platform/combined.log',
      time: true,
      
      // Advanced features
      max_memory_restart: '1G',
      
      // Auto restart
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Monitoring
      instance_var: 'INSTANCE_ID',
      merge_logs: true,
      
      // Node.js arguments
      node_args: '--max-old-space-size=1024',
      
      // Deployment signals
      post_update: ['npm install', 'npm run build'],
      
      // Health check
      health_check: {
        interval: 30000,
        timeout: 5000,
        max_consecutive_failures: 3,
        url: 'http://localhost:3000/api/health'
      }
    }
  ],
  
  // Deployment configuration (optional, for pm2 deploy)
  deploy: {
    production: {
      user: 'jthapp',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/jth-platform',
      'pre-deploy': 'git fetch --all',
      'post-deploy': 'cd apps/web && pnpm install --frozen-lockfile && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'echo "Setting up deployment..."'
    }
  }
};