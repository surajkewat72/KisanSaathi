# 🚀 Simple Deployment Guide for KisanSaathi

## Overview
This guide walks you through deploying your KisanSaathi application using:
- **Vercel** → Frontend (React)
- **Render** → Backend (Node.js + FastAPI)
- **Render PostgreSQL** → Database

---

## 📋 Prerequisites

1. GitHub account
2. Vercel account (free): https://vercel.com
3. Render account (free): https://render.com

---

## STEP 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/KisanSaathi.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New"** → **"PostgreSQL"**
3. Fill in:
   - **Name:** `kisansaathi-db`
   - **Database:** `kisansaathi`
   - **User:** `kisansaathi_user`
   - **Region:** Oregon (Free)
   - **Plan:** Free
4. Click **"Create Database"**
5. **IMPORTANT:** Copy the **Internal Database URL** (it will look like `postgresql://...`)
   - Save this! You'll need it for Step 3

---

## STEP 3: Deploy FastAPI (Python ML Service) on Render

1. In Render dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in:
   - **Name:** `kisansaathi-ml-api`
   - **Region:** Oregon (Free)
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Click **"Create Web Service"**
5. Wait for deployment (2-3 minutes)
6. **COPY THE URL:** `https://kisansaathi-ml-api.onrender.com`
   - You'll need this for the next steps!

---

## STEP 4: Deploy Node.js Backend on Render

1. In Render dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository (same repo)
3. Fill in:
   - **Name:** `kisansaathi-backend`
   - **Region:** Oregon (Free)
   - **Branch:** main
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `node index.js`
   - **Plan:** Free

4. **Add Environment Variables** (click "Advanced" or go to Environment tab):
   ```
   DATABASE_URL=<paste the Internal Database URL from Step 2>
   FASTAPI_URL=<paste the FastAPI URL from Step 3>
   NODE_ENV=production
   FRONTEND_URL=<leave blank for now - you'll add this after Step 5>
   ALLOWED_ORIGINS=<leave blank for now>
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (2-3 minutes)
7. **Run Database Migration:**
   - Go to your service  → "Shell" tab
   - Run: `npx prisma migrate deploy`
   - Or go to "Manual Deploy" → "Deploy latest commit"

8. **COPY THE URL:** `https://kisansaathi-backend.onrender.com`

---

## STEP 5: Deploy Frontend on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

5. **Add Environment Variables:**
   ```
   REACT_APP_BACKEND_URL=<paste Node.js backend URL from Step 4>
   REACT_APP_FASTAPI_URL=<paste FastAPI URL from Step 3>
   ```
   Example:
   ```
   REACT_APP_BACKEND_URL=https://kisansaathi-backend.onrender.com
   REACT_APP_FASTAPI_URL=https://kisansaathi-ml-api.onrender.com
   ```

6. Click **"Deploy"**
7. Wait for deployment (1-2 minutes)
8. **COPY YOUR VERCEL URL:** `https://your-app-name.vercel.app`

---

## STEP 6: Update Backend CORS Settings

1. Go back to **Render** dashboard
2. Open your **Node.js Backend** service
3. Go to **"Environment"** tab
4. **Update these variables:**
   ```
   FRONTEND_URL=<your Vercel URL from Step 5>
   ALLOWED_ORIGINS=<your Vercel URL from Step 5>
   ```
   Example:
   ```
   FRONTEND_URL=https://kisan-saathi.vercel.app
   ALLOWED_ORIGINS=https://kisan-saathi.vercel.app
   ```

5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## ✅ DONE! Your App is Live!

Visit your Vercel URL to see your deployed app!

**Your URLs:**
- Frontend: `https://your-app-name.vercel.app`
- Backend API: `https://kisansaathi-backend.onrender.com`
- FastAPI (ML): `https://kisansaathi-ml-api.onrender.com`

---

## 🔧 Troubleshooting

### Frontend shows "Failed to fetch"
- Check if environment variables are set correctly in Vercel
- Make sure you added `/api` to backend URL if needed
- Check browser console for exact error

### Backend not connecting to database
- Verify DATABASE_URL is the **Internal Database URL** from Render PostgreSQL
- Make sure you ran migrations: `npx prisma migrate deploy`

### CORS errors
- Make sure ALLOWED_ORIGINS includes your Vercel URL
- Check that FRONTEND_URL is set correctly

### Render services sleeping (Free tier)
- Free tier services sleep after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Upgrade to paid plan for always-on services

---

## 🔄 Updating Your App

After making code changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

- **Vercel:** Auto-deploys on every push
- **Render:** Auto-deploys on every push
- **Environment variables:** Must be updated manually in dashboards

---

## 💰 Cost

All services have free tiers:
- **Vercel:** Free (100GB bandwidth/month)
- **Render:** Free (750 hours/month per service)
- **PostgreSQL:** Free (1GB storage, expires after 90 days)

**Total:** $0/month for testing! 🎉

---

## 📝 Important Notes

1. **Free tier limitations:**
   - Services sleep after 15 min of inactivity
   - PostgreSQL database expires after 90 days (backup your data!)
   - 750 hours/month limit

2. **Production recommendations:**
   - Upgrade database to paid plan ($7/month for persistent storage)
   - Use custom domain from Vercel
   - Enable monitoring and logs
   - Set up automatic backups

3. **Security:**
   - Never commit `.env` files
   - Rotate database credentials periodically
   - Use strong passwords

---

## 🆘 Need Help?

Check these resources:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

---

**Happy Deploying! 🚀**
