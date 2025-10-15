# CI/CD Workflows

This directory contains GitHub Actions workflows for deploying the PulseRank turborepo project.

## Available Workflows

### 1. `deploy.yml` - Full Deployment

Deploys both `pulserank-main` and `pulserank-admin` apps.

**Triggers:** Push to `main` branch

**What it does:**

- Builds all apps in the monorepo using Turbo
- Deploys both apps to VPS
- Manages both apps with PM2 ecosystem
- `pulserank-main` runs on port 3000
- `pulserank-admin` runs on port 3001

### 2. `deploy-main-only.yml` - Main App Only

Deploys only the `pulserank-main` app (more efficient if you don't need admin).

**Triggers:** Push to `main` branch when files in these paths change:

- `apps/pulserank-main/**`
- `packages/**`
- `pnpm-lock.yaml`
- `turbo.json`

**What it does:**

- Builds only the main app using `pnpm --filter pulserank-main build`
- Deploys only the main app
- Restarts only the main app with PM2

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name           | Description                        | Example                                  |
| --------------------- | ---------------------------------- | ---------------------------------------- |
| `VPS_HOST`            | Your VPS IP address or domain      | `123.456.789.0` or `vps.example.com`     |
| `VPS_USER`            | SSH username                       | `root`                                   |
| `VPS_PRIVATE_KEY`     | SSH private key for authentication | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DATABASE_URL`        | Database connection string         | `postgresql://user:pass@host:5432/db`    |
| `NEXT_PUBLIC_API_URL` | (Optional) Public API URL          | `https://api.example.com`                |

### 2. Generate SSH Key (if you don't have one)

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
```

Copy the public key to your VPS:

```bash
ssh-copy-id -i ~/.ssh/github-actions.pub root@your-vps-ip
```

Copy the private key content for GitHub secret:

```bash
cat ~/.ssh/github-actions
```

### 3. VPS Prerequisites

Your VPS should have:

- Ubuntu/Debian Linux (or adjust package manager commands)
- SSH access enabled
- Sufficient disk space for Node.js and dependencies

The workflow will automatically install:

- Node.js 20
- pnpm
- PM2

### 4. Environment Variables on VPS

Create a `.env` file in `/root/vnycorn/seobserver/apps/pulserank-main/`:

```bash
ssh root@your-vps-ip
cd /root/vnycorn/seobserver/apps/pulserank-main
nano .env
```

Add your environment variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://yourdomain.com
# Add other environment variables as needed
```

Do the same for admin if deploying both apps:

```bash
cd /root/vnycorn/seobserver/apps/pulserank-admin
nano .env
```

### 5. Choose Your Workflow

**Option A:** Use both workflows

- Keep both files
- `deploy.yml` for full deployments
- `deploy-main-only.yml` for quick main app updates

**Option B:** Use only one

- Delete the workflow you don't need
- Rename if desired

### 6. Test the Deployment

1. Commit and push to `main` branch
2. Go to GitHub → Actions tab
3. Watch the workflow run
4. Check your VPS: `pm2 status`

## Customization

### Change Deployment Path

Edit the `target` in both workflows:

```yaml
target: "/root/vnycorn/seobserver" # Change this
```

And update the script paths:

```yaml
cd /root/vnycorn/seobserver # Change this
```

### Change Ports

Edit the PM2 ecosystem config in `deploy.yml`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000  // Change this
}
```

### Add More Apps

To deploy additional apps, modify the "Create deployment package" and PM2 ecosystem sections in `deploy.yml`.

### Deploy to Specific Branch

Change the trigger:

```yaml
on:
  push:
    branches:
      - staging # or any other branch
```

## Troubleshooting

### Deployment fails with "Permission denied"

- Check that your SSH private key is correct
- Verify VPS_USER has write permissions to the deployment directory

### PM2 app won't start

- SSH into your VPS and check logs: `pm2 logs Pulserank-main`
- Verify `.env` file exists and has correct values
- Check port availability: `netstat -tuln | grep 3000`

### Build fails

- Check if all required environment variables are set in GitHub Secrets
- Verify `DATABASE_URL` is accessible from GitHub Actions runners (may need to allow GitHub's IP ranges)
- Ensure Prisma Client is generated (the workflow includes this step automatically)

### "Ignoring not compatible lockfile"

- This warning means the pnpm version in CI doesn't match your local version
- The workflow automatically uses the pnpm version from your `package.json` (`packageManager` field)
- If you see this warning, ensure your local pnpm version matches: `pnpm --version`
- Update your local pnpm if needed: `corepack enable` or `npm install -g pnpm@9.0.0`

### "Module not found: Can't resolve '../generated/prisma'"

- This error occurs when Prisma Client hasn't been generated
- The workflow now includes a "Generate Prisma Client" step before building
- On VPS, the deployment script also regenerates the client with the production DATABASE_URL

### "pnpm command not found" on VPS

- The workflow installs pnpm, but PATH might not persist
- Add to your VPS's `~/.bashrc` or `~/.profile`:
  ```bash
  export PNPM_HOME="$HOME/.local/share/pnpm"
  export PATH="$PNPM_HOME:$PATH"
  ```

## Monitoring

### View PM2 Status

```bash
ssh root@your-vps-ip
pm2 status
pm2 logs Pulserank-main
pm2 monit
```

### Setup PM2 Startup

To ensure apps restart on VPS reboot:

```bash
ssh root@your-vps-ip
pm2 startup
pm2 save
```

## Advanced: Multiple Environments

To deploy to staging and production:

1. Create separate workflows: `deploy-staging.yml` and `deploy-production.yml`
2. Use different branches: `staging` and `main`
3. Use different VPS secrets: `STAGING_VPS_HOST`, `PROD_VPS_HOST`, etc.
4. Use environment-specific secrets in GitHub

Example:

```yaml
name: Deploy to Staging
on:
  push:
    branches:
      - staging
# ... use STAGING_VPS_HOST, STAGING_VPS_USER, etc.
```
