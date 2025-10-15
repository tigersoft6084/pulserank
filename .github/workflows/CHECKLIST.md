# Deployment Setup Checklist

Use this checklist to ensure everything is configured correctly before deploying.

## ☑️ Pre-Deployment Checklist

### 1. SSH Key Setup

- [ ] Generated SSH key: `ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/pulserank-deploy -N ""`
- [ ] Copied public key to VPS: `ssh-copy-id -i ~/.ssh/pulserank-deploy.pub root@YOUR_VPS_IP`
- [ ] Tested SSH connection: `ssh -i ~/.ssh/pulserank-deploy root@YOUR_VPS_IP`
- [ ] Connection works WITHOUT password prompt ✅

### 2. GitHub Secrets (Repository → Settings → Secrets → Actions)

- [ ] `VPS_HOST` - Your VPS IP or domain (e.g., `123.45.67.89`)
- [ ] `VPS_USER` - SSH username (e.g., `root`)
- [ ] `VPS_PRIVATE_KEY` - Full private key with headers/footers
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_API_URL` - (Optional) API URL

#### ✅ Verify VPS_PRIVATE_KEY contains:

```
-----BEGIN OPENSSH PRIVATE KEY-----
... many lines of encoded data ...
-----END OPENSSH PRIVATE KEY-----
```

### 3. VPS Environment Variables

- [ ] Created `/root/vnycorn/seobserver/apps/pulserank-main/.env`
- [ ] Added `DATABASE_URL` to main app `.env`
- [ ] Added `NEXTAUTH_SECRET` to main app `.env`
- [ ] Added `NEXTAUTH_URL` to main app `.env`
- [ ] Created `/root/vnycorn/seobserver/apps/pulserank-admin/.env` (if deploying admin)
- [ ] Added required variables to admin app `.env`

### 4. VPS Prerequisites

- [ ] VPS is accessible via SSH
- [ ] Deployment directory exists or will be created: `/root/vnycorn/seobserver`
- [ ] VPS has sufficient disk space (at least 2GB free)
- [ ] Port 3000 is available for main app
- [ ] Port 4000 is available for admin app

### 5. Local Development

- [ ] Project builds successfully: `pnpm build`
- [ ] Using pnpm 9.0.0: `pnpm --version`
- [ ] All tests pass (if applicable)
- [ ] No linter errors

### 6. GitHub Repository

- [ ] Code is pushed to `main` branch
- [ ] GitHub Actions are enabled
- [ ] Workflow files exist in `.github/workflows/`

## 🧪 Testing Steps

### Test SSH Connection

```bash
# Should connect without password
ssh -i ~/.ssh/pulserank-deploy root@YOUR_VPS_IP

# If successful, you'll see your VPS prompt
# If it asks for password, the key setup is wrong
```

### Test Private Key Format

```bash
# View your private key
cat ~/.ssh/pulserank-deploy

# Should output something like:
# -----BEGIN OPENSSH PRIVATE KEY-----
# b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
# -----END OPENSSH PRIVATE KEY-----
```

### Verify GitHub Secrets

1. Go to: **Repository → Settings → Secrets and variables → Actions**
2. You should see 4-5 secrets listed:
   - VPS_HOST
   - VPS_USER
   - VPS_PRIVATE_KEY
   - DATABASE_URL
   - NEXT_PUBLIC_API_URL (optional)

**Note:** You can't view the values (for security), but they should be listed.

### Test Local Build

```bash
cd /path/to/pulserank-turborepo

# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @repo/db db:generate

# Build all apps
pnpm build

# Should complete without errors
```

## 🚀 Deploy!

Once all items are checked:

```bash
git add .
git commit -m "Setup CI/CD deployment"
git push origin main
```

Then watch the deployment:

1. Go to GitHub → **Actions** tab
2. Click on the running workflow
3. Watch each step complete ✅

## 🔍 Monitoring Deployment

### On GitHub

- [ ] "Checkout code" step succeeds
- [ ] "Install dependencies" step succeeds (no lockfile warnings)
- [ ] "Generate Prisma Client" step succeeds
- [ ] "Build all apps" step succeeds
- [ ] "Copy files to VPS" step succeeds ✅ (This is where you got the error)
- [ ] "Deploy and restart apps" step succeeds

### On VPS (after successful deployment)

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Check PM2 status
pm2 status
# Should show 2 apps: pulserank-main, pulserank-admin

# View logs
pm2 logs pulserank-main --lines 50
pm2 logs pulserank-admin --lines 50

# Test if apps are responding
curl http://localhost:3000
curl http://localhost:4000
```

## ❌ Troubleshooting Common Errors

### "can't connect without a private SSH key or password"

- ✅ **Solution:** Follow [SETUP-SECRETS.md](./SETUP-SECRETS.md)
- Check: GitHub Secret `VPS_PRIVATE_KEY` is set correctly
- Check: Private key includes headers: `-----BEGIN...` and `-----END...`
- Check: You're using PRIVATE key, not public key

### "Ignoring not compatible lockfile"

- Check: pnpm version is 9.0.0 locally: `pnpm --version`
- Update if needed: `npm install -g pnpm@9.0.0`

### "Module not found: Can't resolve '../generated/prisma'"

- This is fixed in the workflow
- Ensure "Generate Prisma Client" step runs before build

### "Permission denied" on VPS

- Check: VPS_USER has write access to `/root/vnycorn/seobserver`
- Check: SSH key is properly authorized on VPS

### PM2 app won't start on VPS

- Check: `.env` files exist on VPS
- Check: Ports 3000 and 4000 are not in use
- Check: `pm2 logs` for error messages

## 📋 Quick Command Reference

```bash
# ===== Local Machine =====
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/pulserank-deploy -N ""

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/pulserank-deploy.pub root@VPS_IP

# View private key (for GitHub Secret)
cat ~/.ssh/pulserank-deploy

# Test SSH
ssh -i ~/.ssh/pulserank-deploy root@VPS_IP

# Test build locally
pnpm install && pnpm build

# ===== On VPS =====
# Check PM2 status
pm2 status

# View logs
pm2 logs pulserank-main

# Restart apps
pm2 restart all

# Check if apps are running
curl http://localhost:3000
curl http://localhost:4000

# View environment variables
cat /root/vnycorn/seobserver/apps/pulserank-main/.env

# Check disk space
df -h

# Check ports
netstat -tuln | grep -E '3000|4000'
```

## ✅ Success Indicators

Your deployment is successful when:

- ✅ GitHub Actions workflow completes all steps
- ✅ `pm2 status` shows both apps as `online`
- ✅ `curl http://localhost:3000` returns HTML
- ✅ `curl http://localhost:4000` returns HTML
- ✅ No errors in `pm2 logs`

## 🎯 Next Steps After Successful Deployment

1. **Setup reverse proxy** (Nginx/Caddy)

   ```bash
   apt install nginx
   # Configure nginx to proxy to ports 3000/4000
   ```

2. **Configure domain**
   - Point A record to your VPS IP
   - Setup SSL with Let's Encrypt

3. **Enable PM2 startup**

   ```bash
   pm2 startup
   pm2 save
   ```

4. **Setup monitoring**
   ```bash
   pm2 install pm2-logrotate
   ```

---

**Still having issues?**

- 📖 See [SETUP-SECRETS.md](./SETUP-SECRETS.md) for detailed SSH setup
- 📖 See [README.md](./README.md) for full documentation
- 📖 See [QUICK-START.md](./QUICK-START.md) for quick setup guide
