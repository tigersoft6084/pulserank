// PM2 Ecosystem Configuration for PulseRank Turborepo
// This file is created automatically on the VPS during deployment
// Keep this file locally for reference or manual PM2 management

module.exports = {
  apps: [
    {
      name: "pulserank-main",
      cwd: "./apps/pulserank-main",
      script: "pnpm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/main-err.log",
      out_file: "./logs/main-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "pulserank-admin",
      cwd: "./apps/pulserank-admin",
      script: "pnpm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      error_file: "./logs/admin-err.log",
      out_file: "./logs/admin-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
