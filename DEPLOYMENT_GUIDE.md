# 🚀 KisanSaathi Deployment Guide

Complete step-by-step guide to deploy KisanSaathi to production using Vercel (Frontend) and Render (Backend + ML API + Database).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Database Setup (Render PostgreSQL)](#1-database-setup-render-postgresql)
4. [Backend API Deployment (Render - Node.js)](#2-backend-api-deployment-render-nodejs)
5. [ML API Deployment (Render - FastAPI)](#3-ml-api-deployment-render-fastapi)
6. [Frontend Deployment (Vercel)](#4-frontend-deployment-vercel)
7. [Post-Deployment Configuration](#5-post-deployment-configuration)
8. [Verification & Testing](#6-verification--testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository access
- ✅ [Render](https://render.com) account (free tier available)
- ✅ [Vercel](https://vercel.com) account (free tier available)
- ✅ Code pushed to GitHub repository
- ✅ All local tests passing

**Repository Structure:**
```
KisanSaathi/
├── frontend/          # React app
├── backend/           # FastAPI ML service
├── server/            # Node.js/Express API
├── runtime.txt        # Python version (CRITICAL!)
└── README.md
```

---

## Architecture Overview

```
┌─────────────────┐
│  React Frontend │  ──→  Deployed on Vercel
│  (Port 3000)    │
└────────┬────────┘
         │
         ├──→ ┌──────────────────┐
         │    │  Node.js API     │  ──→  Deployed on Render
         │    │  (Port 5001)     │
         │    └────────┬─────────┘
         │             │
         │             ├──→  PostgreSQL Database (Render)
         │             
         └──→ ┌──────────────────┐
              │  FastAPI ML      │  ──→  Deployed on Render
              │  (Port 8000)     │
              └──────────────────┘
```

---

## 1. Database Setup (Render PostgreSQL)

### Step 1.1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   ```
   Name:           kisansaathi-db
   Database:       kisansaathi_prod
   User:           kisansaathi_user (auto-generated)
   Region:         Oregon (or closest to you)
   Plan:           Free
   PostgreSQL Ver: 16 (default)
   ```
4. Click **"Create Database"**
5. **Wait 2-3 minutes** for database to provision

### Step 1.2: Get Database Connection String

1. Once database is ready, go to **Info** tab
2. Copy the **"Internal Database URL"** (starts with `postgresql://`)
3. Save this URL - you'll need it for backend deployment

**Example:**
```
postgresql://kisansaathi_user:password@dpg-xxxxx-a.oregon-postgres.render.com/kisansaathi_prod
```

---

## 2. Backend API Deployment (Render - Node.js)

### Step 2.1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select **"KisanSaathi"** repository

### Step 2.2: Configure Service

```yaml
Name:               kisansaathi-api
Region:             Oregon (same as database)
Branch:             main
Runtime:            Node
Root Directory:     server
Build Command:      npm install && npx prisma generate
Start Command:      npm start
Plan:               Free
```

### Step 2.3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | _(Paste Internal Database URL from Step 1.2)_ |
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` _(Update after frontend deployment)_ |

### Step 2.4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-7 minutes for build
3. Check logs for:
   ```
   ✓ Prisma schema loaded
   ✓ Database connection successful
   ✓ Server running on port 5001
   ```
4. **Save the service URL** (e.g., `https://kisansaathi-api.onrender.com`)

---

## 3. ML API Deployment (Render - FastAPI)

### Step 3.1: Create Python Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Select **"KisanSaathi"** repository again

### Step 3.2: Configure Service

```yaml
Name:               kisansaathi-ml-api
Region:             Oregon
Branch:             main
Runtime:            Python 3
Root Directory:     (leave empty - important!)
Build Command:      cd backend && pip install --upgrade pip && pip install -r requirements.txt
Start Command:      cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
Plan:               Free
```

### Step 3.3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.9` |
| `ALLOWED_ORIGINS` | `*` _(Update after frontend deployment)_ |
| `ENVIRONMENT` | `production` |

### Step 3.4: Critical - Clear Build Cache (First Deployment)

⚠️ **IMPORTANT**: Render may cache Python 3.14, which breaks ML packages.

**Before deploying:**
1. Go to **Settings** → Scroll down
2. Click **"Clear build cache"**
3. Confirm

**Then deploy:**
1. Click **"Create Web Service"**
2. Wait 8-12 minutes for build (ML packages take time)

### Step 3.5: Verify Build Logs

✅ **Success indicators:**
```
==> Installing Python version 3.11.9...     ← MUST SEE 3.11.9!
==> Using Python version 3.11.9
Collecting setuptools>=65.5.1
Collecting wheel>=0.38.4
Successfully installed fastapi-0.104.1 numpy-1.24.3 pandas-2.0.3 scikit-learn-1.3.2
==> Build successful 🎉
```

❌ **If you see Python 3.14.x:**
- Go to Settings → Clear build cache
- Redeploy manually

4. **Save the service URL** (e.g., `https://kisansaathi-ml-api.onrender.com`)

---

## 4. Frontend Deployment (Vercel)

### Step 4.1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import **"KisanSaathi"** from GitHub
4. Click **"Import"**

### Step 4.2: Configure Build Settings

```yaml
Framework Preset:      Create React App
Root Directory:        frontend
Build Command:         npm run build
Output Directory:      build
Install Command:       npm install
Node.js Version:       18.x (default)
```

### Step 4.3: Add Environment Variables

Click **"Environment Variables"** tab:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://kisansaathi-api.onrender.com` |
| `REACT_APP_ML_API_URL` | `https://kisansaathi-ml-api.onrender.com` |

### Step 4.4: Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for build
3. Vercel will provide a URL: `https://kisansaathi.vercel.app`
4. **Save this URL**

---

## 5. Post-Deployment Configuration

### Step 5.1: Update CORS Settings

**Backend API (Node.js):**
1. Go to Render Dashboard → kisansaathi-api
2. Settings → Environment Variables
3. Update `CORS_ORIGIN` from `*` to:
   ```
   https://kisansaathi.vercel.app
   ```

**ML API (FastAPI):**
1. Go to Render Dashboard → kisansaathi-ml-api
2. Settings → Environment Variables
3. Update `ALLOWED_ORIGINS` from `*` to:
   ```
   https://kisansaathi.vercel.app
   ```

### Step 5.2: Run Database Migrations

1. Go to Render Dashboard → kisansaathi-api
2. Click **"Shell"** tab (creates temporary shell)
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Verify:
   ```bash
   npx prisma db seed  # (optional - if you have seeds)
   ```

### Step 5.3: Warm Up Services

Render free tier services sleep after 15 minutes of inactivity.

**Test all endpoints:**
```bash
# ML API health check
curl https://kisansaathi-ml-api.onrender.com/

# Backend API health check
curl https://kisansaathi-api.onrender.com/api/plans

# Frontend
curl https://kisansaathi.vercel.app
```

---

## 6. Verification & Testing

### 6.1 Test ML API Endpoints

**Crop Prediction:**
```bash
curl -X POST https://kisansaathi-ml-api.onrender.com/predict-best-crop \
  -H "Content-Type: application/json" \
  -d '{
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.93
  }'
```

Expected response:
```json
{
  "best_crop": "rice",
  "confidence": 0.95,
  "all_predictions": {...}
}
```

### 6.2 Test Backend API Endpoints

**Get All Plans:**
```bash
curl https://kisansaathi-api.onrender.com/api/plans
```

**Create Farm Plan:**
```bash
curl -X POST https://kisansaathi-api.onrender.com/api/plans/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "farmSize": 5,
    "soilType": "loamy",
    "crops": ["wheat", "rice"]
  }'
```

### 6.3 Test Frontend

1. Visit `https://kisansaathi.vercel.app`
2. Navigate through all pages:
   - ✅ Home page loads
   - ✅ Crop Predictor works
   - ✅ Yield Predictor works
   - ✅ Farm Optimizer works
   - ✅ Dashboard displays data

### 6.4 End-to-End Test

1. Go to **Crop Predictor** page
2. Enter soil parameters
3. Click **"Predict"**
4. Verify results display
5. Check browser console for errors

---

## Troubleshooting

### Problem 1: Python 3.14 Error on Render ML API

**Error:**
```
==> Installing Python version 3.14.3...
ERROR: Cannot import 'setuptools.build_meta'
```

**Solution:**
1. Verify `runtime.txt` exists in **repository root** with content:
   ```
   python-3.11.9
   ```
2. Go to Render → ML API service → Settings
3. **Clear build cache**
4. **Manual Deploy** → Deploy latest commit
5. Watch logs - first line must say "Installing Python version 3.11.9"

### Problem 2: Database Connection Failed

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
1. Check `DATABASE_URL` environment variable is set correctly
2. Use **Internal Database URL** (not External)
3. Verify database is in same region as backend service
4. Check Render database status (should be "Available")

### Problem 3: CORS Errors in Frontend

**Error:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Solution:**
1. Backend API: Update `CORS_ORIGIN` to Vercel URL
2. ML API: Update `ALLOWED_ORIGINS` to Vercel URL
3. Redeploy both services after updating
4. Clear browser cache

### Problem 4: Render Service Sleeping

**Symptom:** First request takes 30-60 seconds

**Solutions:**
- **Free tier limitation** - services sleep after 15 min inactivity
- Use external monitoring (UptimeRobot, Cron-Job.org) to ping every 10 min
- Upgrade to paid plan for always-on services

### Problem 5: Build Fails - Missing Dependencies

**Error:**
```
npm ERR! Cannot find module 'prisma'
```

**Solution:**
1. Check `package.json` includes all dependencies
2. Verify build command: `npm install && npx prisma generate`
3. Clear build cache on Render
4. Redeploy

### Problem 6: Frontend Environment Variables Not Working

**Symptom:** API calls fail, URLs are undefined

**Solution:**
1. Vercel: Environment variables must start with `REACT_APP_`
2. After adding variables, **redeploy** (not automatic)
3. Check build logs for variable substitution
4. Variables are embedded at build time, not runtime

---

## 📊 Service Status Checklist

After deployment, verify all services:

| Service | URL | Status | Test |
|---------|-----|--------|------|
| Frontend | `https://kisansaathi.vercel.app` | ⏳ | Open in browser |
| Backend API | `https://kisansaathi-api.onrender.com` | ⏳ | `curl /api/plans` |
| ML API | `https://kisansaathi-ml-api.onrender.com` | ⏳ | `curl /` |
| Database | Internal URL | ⏳ | Test via backend |

✅ = Working  
⚠️ = Degraded  
❌ = Failed  

---

## 🎯 Production Checklist

Before going live:

- [ ] All services deployed successfully
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] CORS settings updated with real domain
- [ ] All API endpoints tested
- [ ] Frontend pages load correctly
- [ ] ML predictions working
- [ ] Database CRUD operations working
- [ ] Error handling tested
- [ ] Performance acceptable (first load < 60s on free tier)
- [ ] Browser console has no errors
- [ ] Mobile responsiveness checked

---

## 📝 Important Notes

### Render Free Tier Limitations

- **Sleeps after 15 minutes** of inactivity
- **750 hours/month** limit across all services
- **First request slow** (30-60s) after sleep
- Use monitoring to keep services warm

### Cost Optimization

All services can run on **free tier**:
- Vercel: Unlimited deployments
- Render: 750 hours/month (3 services × 250 hours each)
- PostgreSQL: 1GB storage, 97 hours compute/month

### Monitoring

Set up external monitoring:
1. [UptimeRobot](https://uptimerobot.com) (free)
2. Ping endpoints every 10 minutes
3. Email alerts on downtime

---

## 🔗 Useful Links

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Prisma Deploy Guide**: https://www.prisma.io/docs/guides/deployment
- **Python Version Issues**: See `backend/RENDER_FIX.md`

---

## 🆘 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review `backend/RENDER_FIX.md` for Python issues
3. Check Render/Vercel build logs
4. Verify all environment variables are set
5. Clear build cache and redeploy

---

## 🎉 Success!

Once all services are deployed and tested:

1. ✅ Your app is live at `https://kisansaathi.vercel.app`
2. ✅ APIs are accessible and responding
3. ✅ Database is connected and working
4. ✅ ML predictions are functioning

**Happy farming! 🌾**

---

*Last Updated: March 2026*  
*Deployment Platform: Render (Backend/DB) + Vercel (Frontend)*
