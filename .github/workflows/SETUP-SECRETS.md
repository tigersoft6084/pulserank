# GitHub Secrets Setup Guide

## ❌ Current Error

```
Error: can't connect without a private SSH key or password
```

This means your GitHub Secrets are not configured correctly.

## ✅ Step-by-Step Setup

### 1. Navigate to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. You should see **Repository secrets**

### 2. Add Required Secrets

Click **New repository secret** for each of these:

#### Secret 1: `VPS_HOST`

- **Name:** `VPS_HOST` (exactly like this, case-sensitive)
- **Value:** Your VPS IP address or domain
- Examples:
  ```
  123.45.67.89
  ```
  or
  ```
  vps.example.com
  ```

#### Secret 2: `VPS_USER`

- **Name:** `VPS_USER` (exactly like this)
- **Value:** Your SSH username
- Example:
  ```
  root
  ```

#### Secret 3: `VPS_PRIVATE_KEY` ⚠️ MOST IMPORTANT

- **Name:** `VPS_PRIVATE_KEY` (exactly like this)
- **Value:** Your FULL SSH private key including headers

**How to get your private key:**

**Option A - Generate a new key (recommended):**

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/pulserank-deploy -N ""

# This creates:
# ~/.ssh/pulserank-deploy       <- Private key (for GitHub Secret)
# ~/.ssh/pulserank-deploy.pub   <- Public key (for VPS)
```

**Copy the PRIVATE key to GitHub:**

```bash
cat ~/.ssh/pulserank-deploy
```

Copy the ENTIRE output including:

```
-----BEGIN OPENSSH PRIVATE KEY-----
... all the lines ...
-----END OPENSSH PRIVATE KEY-----
```

**Copy the PUBLIC key to your VPS:**

```bash
# Method 1: Using ssh-copy-id
ssh-copy-id -i ~/.ssh/pulserank-deploy.pub root@YOUR_VPS_IP

# Method 2: Manual
cat ~/.ssh/pulserank-deploy.pub | ssh root@YOUR_VPS_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Test the connection:**

```bash
ssh -i ~/.ssh/pulserank-deploy root@YOUR_VPS_IP
```

If you can connect without a password, it's working! ✅

**Option B - Use existing key:**

```bash
# View your existing private key (usually one of these):
cat ~/.ssh/id_ed25519
cat ~/.ssh/id_rsa
cat ~/.ssh/id_ecdsa

# Copy the ENTIRE output to GitHub Secret
```

⚠️ **Important:** The private key must include:

- The header: `-----BEGIN OPENSSH PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----`
- All the encoded key data
- The footer: `-----END OPENSSH PRIVATE KEY-----` or `-----END RSA PRIVATE KEY-----`

#### Secret 4: `DATABASE_URL`

- **Name:** `DATABASE_URL` (exactly like this)
- **Value:** Your PostgreSQL connection string
- Example:
  ```
  postgresql://username:password@hostname:5432/database_name
  ```

#### Secret 5: `NEXT_PUBLIC_API_URL` (Optional)

- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** Your API URL if needed
- Example:
  ```
  https://api.yourdomain.com
  ```

### 3. Verify Secrets Are Set

After adding all secrets, you should see them listed:

```
Repository secrets
├─ VPS_HOST
├─ VPS_USER
├─ VPS_PRIVATE_KEY
├─ DATABASE_URL
└─ NEXT_PUBLIC_API_URL (optional)
```

**Note:** You can't view secret values after creating them (for security), but you can update them.

### 4. Common Mistakes ❌

| Mistake                             | Solution                                                         |
| ----------------------------------- | ---------------------------------------------------------------- |
| Using public key instead of private | Use the key WITHOUT `.pub` extension                             |
| Missing key headers/footers         | Must include `-----BEGIN...` and `-----END...`                   |
| Wrong secret name                   | Must be EXACTLY `VPS_PRIVATE_KEY` (case-sensitive)               |
| Extra spaces in key                 | Copy entire key as-is, no modifications                          |
| Password-protected key              | GitHub needs a key without passphrase, or use `INPUT_PASSPHRASE` |
| Wrong VPS_HOST                      | Use IP or domain only, no `http://` or ports                     |

### 5. Verify SSH Access Manually

Before running the workflow, test SSH access:

```bash
# From your local machine
ssh -i ~/.ssh/pulserank-deploy root@YOUR_VPS_IP

# If successful, you should see:
# root@vps:~#
```

If this works, GitHub Actions should work too!

### 6. Test Deployment

After setting up all secrets:

```bash
git add .
git commit -m "Test deployment with secrets"
git push origin main
```

Watch the deployment: **GitHub → Actions → Click on the running workflow**

### 7. Still Not Working?

If you still get the error, try this debug version:

Add a debug step to your workflow temporarily to verify secrets are being passed:

```yaml
- name: Debug SSH Connection
  run: |
    echo "Host: ${{ secrets.VPS_HOST }}"
    echo "User: ${{ secrets.VPS_USER }}"
    echo "Key length: ${#VPS_PRIVATE_KEY}"
  env:
    VPS_PRIVATE_KEY: ${{ secrets.VPS_PRIVATE_KEY }}
```

**Note:** Never echo the actual key value!

## 🔐 SSH Key Formats

### ✅ Correct Format (ED25519)

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDj... (many more lines)
-----END OPENSSH PRIVATE KEY-----
```

### ✅ Correct Format (RSA)

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAx1234567890abcdef... (many lines)
-----END RSA PRIVATE KEY-----
```

### ❌ Wrong - This is a PUBLIC key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ...
```

### ❌ Wrong - Missing headers

```
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
```

## 🔧 VPS Setup Checklist

On your VPS, ensure:

```bash
# 1. SSH directory exists with correct permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. Authorized keys has correct permissions
chmod 600 ~/.ssh/authorized_keys

# 3. Verify your public key is in authorized_keys
cat ~/.ssh/authorized_keys

# 4. SSH is enabled and running
systemctl status sshd  # or ssh on some systems

# 5. Firewall allows SSH (port 22)
ufw status  # or iptables -L
```

## 📝 Quick Command Reference

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/pulserank-deploy -N ""

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/pulserank-deploy.pub root@VPS_IP

# View private key (copy this to GitHub Secret)
cat ~/.ssh/pulserank-deploy

# Test SSH connection
ssh -i ~/.ssh/pulserank-deploy root@VPS_IP

# On VPS: view authorized keys
cat ~/.ssh/authorized_keys

# On VPS: test if SSH is listening
netstat -tuln | grep :22
```

## 🎯 Next Steps

Once secrets are configured:

1. ✅ Verify all 4-5 secrets are in GitHub
2. ✅ Test SSH manually from your machine
3. ✅ Push to trigger deployment
4. ✅ Watch the Actions tab for progress

## 💡 Pro Tips

- Use a dedicated SSH key for deployments (not your personal key)
- Never commit private keys to git
- Keep your VPS_PRIVATE_KEY secret secure
- Rotate keys periodically for security
- Use `ssh-ed25519` keys (more secure, smaller)

## ⚠️ Security Best Practices

1. **Use deployment-specific keys** - Don't reuse your personal SSH key
2. **Restrict VPS user permissions** - Consider using a non-root user
3. **Enable fail2ban** - Protect against brute force attacks
4. **Disable password authentication** - Use key-only authentication
5. **Keep secrets SECRET** - Never log or expose them

---

**Need more help?**

- Check GitHub Actions logs: Repository → Actions → Click workflow run
- Test SSH manually: `ssh -v root@YOUR_VPS_IP` (verbose mode shows errors)
- Verify key format: Should have BEGIN/END headers
