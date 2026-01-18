# DealHunter Deployment Guide

This guide covers deploying the three components of DealHunter:

| Component | Platform | Domain |
|-----------|----------|--------|
| Backend API (NestJS) | Render.com | https://api.huntdeals.app |
| Admin Dashboard (React) | Vercel | https://admin.huntdeals.app |
| Flutter PWA | Vercel | https://www.huntdeals.app |

---

## Prerequisites

1. GitHub repository: `baytechie/deal-hunter-repo2`
2. Vercel account connected to GitHub
3. Render.com account connected to GitHub
4. Domain `huntdeals.app` with DNS access

---

## 1. Deploy Backend to Render.com

### Step 1: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `baytechie/deal-hunter-repo2`
4. Configure:
   - **Name**: `dealhunter-api`
   - **Root Directory**: Leave empty (uses repo root)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### Step 2: Set Environment Variables

Add these environment variables in Render:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-a-strong-secret-key>
JWT_EXPIRES_IN=24h
AMAZON_PAAPI_ACCESS_KEY=<your-amazon-access-key>
AMAZON_PAAPI_SECRET_KEY=<your-amazon-secret-key>
AMAZON_PARTNER_TAG=<your-affiliate-tag>
AMAZON_MARKETPLACE=www.amazon.com
```

### Step 3: Configure Custom Domain

1. In Render service settings, go to **Custom Domains**
2. Add `api.huntdeals.app`
3. Add DNS records as instructed by Render:
   - Type: `CNAME`
   - Name: `api`
   - Value: `<your-render-service>.onrender.com`

---

## 2. Deploy Admin Dashboard to Vercel

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import from GitHub: `baytechie/deal-hunter-repo2`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `dealhunter-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables

Add in Vercel project settings:

```
VITE_API_URL=https://api.huntdeals.app
```

### Step 3: Configure Custom Domain

1. Go to project **Settings** → **Domains**
2. Add `admin.huntdeals.app`
3. Configure DNS:
   - Type: `CNAME`
   - Name: `admin`
   - Value: `cname.vercel-dns.com`

---

## 3. Deploy Flutter PWA to Vercel

### Option A: GitHub Actions (Recommended)

The GitHub Actions workflow at `.github/workflows/deploy-flutter-pwa.yml` handles building and deploying automatically.

**Required GitHub Secrets:**
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_FLUTTER_PROJECT_ID=<your-vercel-project-id>
```

To get these values:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login`
3. Run `vercel link` in the flutter_app directory
4. Check `.vercel/project.json` for `orgId` and `projectId`
5. Create token at https://vercel.com/account/tokens

### Option B: Manual Deployment

1. Build Flutter web locally:
   ```bash
   cd flutter_app
   flutter build web --release --dart-define=API_BASE_URL=https://api.huntdeals.app
   ```

2. Deploy to Vercel:
   ```bash
   cd build/web
   vercel --prod
   ```

### Step 3: Configure Custom Domain

1. Go to Vercel project **Settings** → **Domains**
2. Add `www.huntdeals.app` and `huntdeals.app`
3. Configure DNS:
   - For `www`: CNAME → `cname.vercel-dns.com`
   - For root: A records as shown by Vercel

---

## DNS Configuration Summary

Add these records to your domain registrar (for `huntdeals.app`):

| Type | Name | Value |
|------|------|-------|
| CNAME | api | `<your-service>.onrender.com` |
| CNAME | admin | `cname.vercel-dns.com` |
| CNAME | www | `cname.vercel-dns.com` |
| A | @ | `76.76.21.21` (Vercel) |

---

## GitHub Secrets Required

For automated deployments via GitHub Actions:

```
VERCEL_TOKEN            # Vercel API token
VERCEL_ORG_ID           # Vercel organization ID
VERCEL_FLUTTER_PROJECT_ID   # Flutter PWA project ID
VERCEL_DASHBOARD_PROJECT_ID # Admin dashboard project ID
```

---

## Verification

After deployment, verify all services:

1. **Backend API**:
   ```bash
   curl https://api.huntdeals.app/deals
   ```

2. **Admin Dashboard**:
   Open https://admin.huntdeals.app and login with:
   - Email: `admin@dealhunter.com`
   - Password: `admin123`

3. **Flutter PWA**:
   Open https://www.huntdeals.app on desktop and mobile

---

## Troubleshooting

### CORS Errors
The backend is configured to accept requests from:
- `https://www.huntdeals.app`
- `https://huntdeals.app`
- `https://admin.huntdeals.app`

### API Connection Issues
1. Check that the backend is running on Render
2. Verify environment variables are set correctly
3. Check Render logs for errors

### Build Failures
- **Flutter**: Ensure Flutter version 3.24.0+ in GitHub Actions
- **Dashboard**: Check Node.js version (20+)
- **Backend**: Verify all dependencies are installed
