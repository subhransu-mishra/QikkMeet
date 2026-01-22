# Production Deployment Guide - QikkMeet

## Issues Fixed

### Issue 1: 404 API Errors

The 404 API errors were happening because:

1. Frontend was making API calls to `/api` (relative URL) which went to the frontend domain
2. Backend is on a different domain: `https://qikmeet.onrender.com`
3. CORS wasn't properly configured for cross-origin requests

### Issue 2: 404 on React Router Routes (/login, /signup, etc.)

The frontend routes were returning 404 because:

1. Render static site doesn't know about React Router client-side routing
2. Missing redirect rules to serve `index.html` for all routes

## Solution Applied

### Frontend Changes

1. ✅ Created `.env.production` with backend URL
2. ✅ Updated axios.js to use `VITE_API_BASE` environment variable
3. ✅ **Added `_redirects` file** - Critical for SPA routing on Render
4. ✅ Added `vercel.json` for alternative deployments

### Backend Changes

1. ✅ Updated CORS to explicitly allow frontend domain
2. ✅ Added proper origin checking for production

## Render Deployment Configuration

### Frontend Service (Static Site)

**Service Name:** qikkmeet-frontend  
**Type:** Static Site  
**Build Command:** `cd frontend && npm install && npm run build`  
**Publish Directory:** `frontend/dist`

**Environment Variables in Render Dashboard:**

```
VITE_API_BASE=https://qikmeet.onrender.com/api
VITE_STREAM_API_KEY=<your-stream-key>
VITE_JWT_SECRET=<your-jwt-secret>
```

⚠️ **IMPORTANT:** The `_redirects` file in `frontend/public/` is critical for SPA routing to work!

### Backend Service (Web Service)

**Service Name:** qikmeet-backend  
**Type:** Web Service  
**Build Command:** `cd backend && npm install`  
**Start Command:** `cd backend && npm start`

**Environment Variables in Render Dashboard:**

```
NODE_ENV=production
FRONTEND_URL=https://qikkmeet.onrender.com
PORT=5001
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
STREAM_API_KEY=<your-stream-key>
STREAM_API_SECRET=<your-stream-secret>
```

## Deployment Steps

### 1. Commit and Push

```bash
git add .
git commit -m "Fix: Add SPA redirects and CORS configuration for production"
git push origin main
```

### 2. Verify Build

After Render auto-deploys, check:

- ✅ `frontend/dist/_redirects` file exists in the build
- ✅ No build errors in Render logs
- ✅ Environment variables are loaded

### 3. Test Everything

- [ ] Frontend loads at https://qikkmeet.onrender.com
- [ ] Direct URL navigation works: https://qikkmeet.onrender.com/login
- [ ] Page refresh doesn't cause 404
- [ ] API calls work (check Network tab)
- [ ] Login/signup functionality works
- [ ] No CORS errors in console

## Understanding the Errors

### "Unchecked runtime.lastError: The message port closed before a response was received"

- ❌ **NOT your app's error!**
- This is caused by browser extensions (React DevTools, etc.)
- Safe to ignore - doesn't affect functionality

### "Failed to load resource: 404" for /login

- ✅ **FIXED** by adding `_redirects` file
- This told Render: "For ANY route, serve index.html"
- React Router then handles the routing client-side

### "Failed to load resource: 404" for /api/auth/me

- ✅ **FIXED** by setting `VITE_API_BASE` environment variable
- Now points to correct backend domain

## Troubleshooting Guide

### Routes still return 404?

1. Check `frontend/public/_redirects` exists
2. Rebuild locally: `npm run build`
3. Verify `frontend/dist/_redirects` exists
4. Clear Render build cache and redeploy
5. Clear browser cache (Ctrl+Shift+R)

### API calls fail?

1. Open browser DevTools → Network tab
2. Click on failed request
3. Check the URL - should be `https://qikmeet.onrender.com/api/...`
4. If it's not, verify `VITE_API_BASE` in Render env vars
5. Check backend logs for errors

### CORS errors?

1. Verify `FRONTEND_URL=https://qikkmeet.onrender.com` in backend
2. Check backend logs for CORS errors
3. Ensure both services are using HTTPS

### Auth/Cookies not working?

1. Check if `withCredentials: true` in axios
2. Verify JWT_SECRET matches on both services
3. May need to adjust cookie settings for cross-domain

## How Vite Build Works

```
frontend/public/_redirects  →  (build)  →  frontend/dist/_redirects
```

Vite automatically copies everything from `public/` to `dist/` during build.

## Production Architecture

```
Browser
   ↓
https://qikkmeet.onrender.com (Frontend - Static Site)
   ↓ (API calls)
https://qikmeet.onrender.com/api (Backend - Web Service)
   ↓
MongoDB Atlas
```

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure CDN (Cloudflare) for better performance
3. Enable auto-deploy on git push
4. Set up monitoring/alerts
5. Configure backup strategy for database
