# Production Deployment Guide

## Issue Fixed

The 404 errors were happening because:

1. Frontend was making API calls to `/api` (relative URL) which went to the frontend domain
2. Backend is on a different domain: `https://qikmeet.onrender.com`
3. CORS wasn't properly configured for cross-origin requests

## Solution Applied

### Frontend Changes

1. Created `.env.production` with backend URL
2. Updated axios.js to use `VITE_API_BASE` environment variable

### Backend Changes

1. Updated CORS to explicitly allow frontend domain
2. Added proper origin checking for production

## Required Environment Variables on Render

### Frontend (qikkmeet.onrender.com)

Add these environment variables in your Render dashboard:

```
VITE_API_BASE=https://qikmeet.onrender.com/api
VITE_STREAM_API_KEY=gwqhppjps3wk
VITE_JWT_SECRET=5f14ef5bdd4223b22ed2bf153c16e722a99209e9d33c23f1f3c01c15dadfc957
```

### Backend (qikmeet.onrender.com)

Add these environment variables in your Render dashboard:

```
NODE_ENV=production
FRONTEND_URL=https://qikkmeet.onrender.com
PORT=5001
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=5f14ef5bdd4223b22ed2bf153c16e722a99209e9d33c23f1f3c01c15dadfc957
STREAM_API_KEY=gwqhppjps3wk
STREAM_API_SECRET=<your-stream-secret>
```

## Deployment Steps

1. **Commit and push changes:**

   ```bash
   git add .
   git commit -m "Fix production API endpoints and CORS configuration"
   git push origin main
   ```

2. **Render will auto-deploy** both services

3. **Verify environment variables** in Render dashboard for both services

4. **Test the endpoints:**
   - Frontend: https://qikkmeet.onrender.com
   - Backend health: https://qikmeet.onrender.com/api/health (if you have this endpoint)

## Common Issues & Solutions

### Still getting 404?

- Check Render logs to see if environment variables are loaded
- Verify backend is running on correct port
- Check Network tab in browser DevTools to see actual API URL being called

### CORS errors?

- Verify FRONTEND_URL is set correctly in backend environment
- Check backend logs for CORS errors
- Ensure credentials: true is working (cookies/auth headers)

### Auth not working?

- Check if JWT_SECRET matches between frontend and backend
- Verify cookies are being sent with credentials: true
- Check if domain settings allow cross-domain cookies (may need SameSite=None; Secure)
