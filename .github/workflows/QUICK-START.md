# Quick Start Guide - CI/CD Setup

## ✅ What's Fixed

The workflows have been updated to resolve common issues:

1. **✅ Lockfile compatibility** - Now uses pnpm 9.0.0 (matches your package.json)
2. **✅ Prisma generation** - Automatically generates Prisma Client before building
3. **✅ Turborepo support** - Properly handles monorepo structure

## 🚀 Quick Setup (5 minutes)

### 1. Add GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Click **New repository secret** and add:

```
VPS_HOST          = Your VPS IP or domain
VPS_USER          = root (or your SSH user)
VPS_PRIVATE_KEY   = Your SSH private key
DATABASE_URL      = postgresql://user:pass@host:5432/db
```

Optional:

```
NEXT_PUBLIC_API_URL = Your API URL (if needed)
```

### 2. Generate SSH Key (if you don't have one)

```bash
# Generate key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions

# Copy to VPS
ssh-copy-id -i ~/.ssh/github-actions.pub root@YOUR_VPS_IP

# Get private key for GitHub (copy this entire output)
cat ~/.ssh/github-actions
```

### 3. Setup VPS Environment Variables

SSH into your VPS and create `.env` files:

```bash
# For main app
ssh root@YOUR_VPS_IP
cd /root/vnycorn/seobserver/apps/pulserank-main
nano .env
```

Add:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
```

Repeat for admin app (port 4000):

```bash
cd /root/vnycorn/seobserver/apps/pulserank-admin
nano .env
```

### 4. Deploy!

```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

Watch it deploy: **GitHub → Actions tab**

## 📊 What Happens on Deploy

```
GitHub Actions CI:
├─ Install Node.js 20
├─ Install pnpm 9.0.0 (from package.json)
├─ Install dependencies
├─ Generate Prisma Client
├─ Build all apps with Turbo
└─ Deploy to VPS
    ├─ Copy built files
    ├─ SSH into VPS
    ├─ Install dependencies
    ├─ Generate Prisma Client (with production DB)
    └─ Restart apps with PM2
        ├─ pulserank-main (port 3000)
        └─ pulserank-admin (port 4000)
```

## 🔍 Verify Deployment

SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP

# Check PM2 status
pm2 status

# View logs
pm2 logs pulserank-main
pm2 logs pulserank-admin

# Check if apps are running
curl http://localhost:3000
curl http://localhost:4000
```

## ⚡ Quick Commands

```bash
# VPS - View all apps
pm2 status

# VPS - Restart an app
pm2 restart pulserank-main

# VPS - View logs
pm2 logs pulserank-main --lines 100

# VPS - Monitor in real-time
pm2 monit

# VPS - Make PM2 start on boot
pm2 startup
pm2 save
```

## 🐛 Common Issues

### Build fails in GitHub Actions

- Check **Actions** tab for detailed logs
- Verify all GitHub Secrets are set correctly
- Ensure DATABASE_URL is accessible from GitHub's IPs

### Apps won't start on VPS

```bash
# Check logs
pm2 logs pulserank-main

# Check if .env exists
cat /root/vnycorn/seobserver/apps/pulserank-main/.env

# Check ports
netstat -tuln | grep 3000
netstat -tuln | grep 4000

# Restart PM2
pm2 restart all
```

### Lockfile warning

- Ensure you're using pnpm 9.0.0 locally
- Check: `pnpm --version`
- Update: `corepack enable` or `npm install -g pnpm@9.0.0`

## 📝 Available Workflows

### `deploy.yml` - Full Deployment

- Deploys BOTH apps (main + admin)
- Triggers on every push to `main`

### `deploy-main-only.yml` - Main App Only

- Deploys ONLY main app
- Triggers only when `apps/pulserank-main/**` changes
- Faster for main app updates

## 🎯 Next Steps

1. **Setup reverse proxy** (Nginx/Caddy) to expose apps
2. **Configure domain** pointing to your VPS
3. **Setup SSL** with Let's Encrypt
4. **Enable PM2 startup**: `pm2 startup && pm2 save`
5. **Monitor logs** regularly: `pm2 logs`

## 💡 Pro Tips

- Use `deploy-main-only.yml` for faster main app deployments
- Check PM2 logs if something goes wrong
- Keep your DATABASE_URL secret secure
- Test locally before pushing: `pnpm build`
- Monitor VPS resources: `htop` or `pm2 monit`

## 📚 Full Documentation

See [README.md](./README.md) for detailed documentation.

---

**Need help?** Check the logs:

- GitHub: Repository → Actions → Click on latest workflow run
- VPS: `pm2 logs` or `pm2 monit`
