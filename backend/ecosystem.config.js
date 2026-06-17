// PM2 Ecosystem Configuration for EduSphere Backend
module.exports = {
  apps: [
    {
      name: 'edusphere-api',
      script: './dist/index.js',
      instances: 'max',          // Use all CPU cores
      exec_mode: 'cluster',      // Cluster mode for load balancing
      watch: false,
      max_memory_restart: '768M',

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,

      // Crash recovery
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: '5s',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,

      // Health & performance
      exp_backoff_restart_delay: 100,
    },
  ],
};
