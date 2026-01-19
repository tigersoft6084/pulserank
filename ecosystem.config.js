module.exports = {
  apps: [
    {
      name: 'pulserank-main',
      cwd: '/root/vnycorn/pulserank-turborepo/apps/pulserank-main',
      script: 'pnpm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'pulserank-admin',
      cwd: '/root/vnycorn/pulserank-turborepo/apps/pulserank-admin',
      script: 'pnpm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: 3001 }
    }
  ]
};

