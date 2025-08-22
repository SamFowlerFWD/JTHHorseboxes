/**
 * PM2 Ecosystem Configuration
 * Manages the JTH application process in production
 */

module.exports = {
  apps: [{
    // Application configuration
    name: 'jth',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/jth/apps/web',
    
    // Process management
    instances: 'max',  // Use all available CPU cores
    exec_mode: 'cluster',  // Enable cluster mode for load balancing
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Advanced PM2 features
    max_memory_restart: '1G',  // Restart if memory exceeds 1GB
    min_uptime: '10s',  // Minimum uptime before considering app as started
    max_restarts: 10,  // Maximum restarts within min_uptime
    
    // Logging
    error_file: '/var/log/jth/error.log',
    out_file: '/var/log/jth/out.log',
    log_file: '/var/log/jth/combined.log',
    time: true,  // Prefix logs with timestamp
    merge_logs: true,  // Merge logs from all instances
    
    // Watch & restart (disabled in production)
    watch: false,
    ignore_watch: ['node_modules', '.next', '.git', 'logs'],
    
    // Graceful shutdown
    kill_timeout: 5000,  // Time in ms before sending SIGKILL
    wait_ready: true,  // Wait for process.send('ready')
    listen_timeout: 10000,  // Time to wait for app to listen
    
    // Auto-restart on file change (useful for env updates)
    watch_options: {
      followSymlinks: false
    },
    
    // Health check
    health_check: {
      interval: 30000,  // Check every 30 seconds
      timeout: 5000,    // Health check timeout
      max_consecutive_failures: 3,  // Restart after 3 failures
      path: '/api/health'  // Health check endpoint
    },
    
    // Monitoring
    monitoring: {
      http: true,  // Enable HTTP monitoring
      https: true  // Enable HTTPS monitoring
    }
  }],
  
  // Deploy configuration (optional)
  deploy: {
    production: {
      user: 'jthapp',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/jth-new.git',
      path: '/var/www/jth',
      'pre-deploy': 'git fetch --all',
      'post-deploy': 'cd apps/web && pnpm install --frozen-lockfile && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'echo "Setting up server..."'
    }
  }
};