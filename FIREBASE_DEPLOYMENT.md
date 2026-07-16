# FIFA Stadium Companion - Firebase Deployment Guide

**Status**: Applications built and ready for deployment  
**Build Date**: 2026-07-12  
**Tested Locally**: ✅ All features verified working

## 🚀 Quick Deployment (3 Steps)

### Step 1: Prepare Firebase Project

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to your Google account
firebase login

# Initialize Firebase for this project
cd fifa-stadium-companion
firebase init hosting --project fifa-stadium-companion
```

### Step 2: Deploy Frontend to Hosting

```bash
# Verify build exists
ls -la client/dist/fifa-stadium-companion-client

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Expected Output:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/fifa-stadium-companion
Hosting URL: https://fifa-stadium-companion.web.app
```

### Step 3: Deploy Backend to Cloud Run (Optional)

```bash
# Requires: Google Cloud SDK installed
# Install: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project fifa-stadium-companion

# Build and deploy container
gcloud run deploy fifa-stadium-api \
  --source server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=fifa-stadium-companion,GEMINI_API_KEY=your-api-key
```

---

## 📋 Detailed Deployment Steps

### Prerequisites

- ✅ Google Account
- ✅ Firebase Project (free tier available)
- ✅ Frontend built: `client/dist/`
- ✅ Backend built: `server/.../bin/Release/`

### Frontend Deployment (Firebase Hosting)

#### 1. Create/Login to Firebase Project

```bash
# If you don't have a Firebase project yet
firebase projects:create fifa-stadium-companion

# Login
firebase login

# Link project
firebase use --add
# Select: fifa-stadium-companion
# Alias: default
```

#### 2. Configure Hosting

File: `firebase.json` (already configured)
```json
{
  "hosting": {
    "public": "client/dist/fifa-stadium-companion-client",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 3. Deploy

```bash
# From project root
firebase deploy --only hosting

# Or with specific project
firebase deploy --project fifa-stadium-companion --only hosting
```

#### 4. Verify Deployment

```bash
# Check status
firebase hosting:channel:list

# View live site
open https://fifa-stadium-companion.web.app
```

### Backend Deployment (Cloud Run - Optional)

Backend deployment requires Google Cloud setup. This guide provides the .NET configuration; deployment requires additional setup.

#### Prerequisites for Cloud Run

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Initialize
gcloud init

# Set project
gcloud config set project fifa-stadium-companion
gcloud auth configure-docker
```

#### Deploy Backend

```bash
# From server directory
cd server

# Build Docker image
docker build -t gcr.io/fifa-stadium-companion/api .

# Push to Container Registry
docker push gcr.io/fifa-stadium-companion/api

# Deploy to Cloud Run
gcloud run deploy fifa-stadium-api \
  --image gcr.io/fifa-stadium-companion/api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars \
  FIREBASE_PROJECT_ID=fifa-stadium-companion,\
  GEMINI_API_KEY=your-gemini-api-key
```

#### Update Frontend API URL

After backend deployment, update the API URL in frontend:

File: `client/src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://fifa-stadium-api-xxxxx.a.run.app/api'  // Update with your URL
};
```

Then redeploy frontend:
```bash
npm run build --prefix client
firebase deploy --only hosting
```

---

## 🔍 Post-Deployment Verification

### Frontend

```bash
# Test frontend at:
https://fifa-stadium-companion.web.app

# Check console for any errors
# Network tab: Verify API calls
```

**Expected Features:**
- ✅ Stadium grid loads
- ✅ Crowd status displays
- ✅ AI assistant responds (with mocks if backend unavailable)
- ✅ Dispatch form works
- ✅ Admin metrics visible

### Backend (if deployed)

```bash
# Test backend API
curl https://fifa-stadium-api-xxxxx.a.run.app/

# Should return:
# "FIFA Stadium Companion API - Ready for deployment"

# Test stadiums endpoint
curl https://fifa-stadium-api-xxxxx.a.run.app/api/stadiums
```

---

## 🐛 Troubleshooting

### Firebase Hosting Issues

| Issue | Solution |
|-------|----------|
| "public directory does not exist" | Verify `client/dist/fifa-stadium-companion-client` exists: `npm run build` in `client/` |
| 404 errors on refresh | Rewrite rule is configured - should work. Clear cache. |
| Stale content | Run `firebase hosting:disable` then redeploy |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in `client/` |
| API 404 errors | Backend not deployed. Frontend works with mock fallbacks. |
| Blank page | Check browser console for errors |

### Backend Issues (Cloud Run)

| Issue | Solution |
|-------|----------|
| Build fails | Verify Dockerfile is in `server/` directory |
| Port errors | Cloud Run requires port 8080 (configured in Dockerfile) |
| Auth errors | Check FIREBASE_PROJECT_ID environment variable |
| API errors | Check GEMINI_API_KEY is valid |

---

## 🔐 Security Notes

### Environment Variables

**Never commit secrets to git!**

- `.env` is in `.gitignore` (safe locally)
- Cloud Run secrets configured via command line
- Firebase project configured via Console

### Sensitive Data

- Gemini API Key: Set only in Cloud Run/Firebase Functions
- Firebase Config: Safe to include in frontend (public API key)
- Service Accounts: Never commit (only for admin use)

---

## 📊 Deployment Checklist

### Before Deploying

- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend builds without errors: `dotnet publish -c Release`
- [ ] Tests pass: `dotnet test`
- [ ] All features tested locally
- [ ] `.env` file exists with API keys
- [ ] `firebase.json` configured correctly
- [ ] `.firebaserc` has project ID

### During Deployment

- [ ] Firebase login successful
- [ ] Frontend deploys to Hosting
- [ ] Hosting URL accessible
- [ ] All routes work (fan, staff, admin)
- [ ] API calls use fallback mocks (if backend not deployed)

### After Deployment

- [ ] Frontend loads at: `https://fifa-stadium-companion.web.app`
- [ ] Navigation works between views
- [ ] Stadium grid displays all stadiums
- [ ] Dispatch creation works
- [ ] Admin metrics visible
- [ ] No console errors

---

## 🎯 What's Deployed

### Frontend (Firebase Hosting)
```
✅ Angular 17 SPA
✅ Three role-based views (fan, staff, admin)
✅ Responsive design
✅ Real HTTP calls to backend (with mocks)
✅ ~100 KB gzipped
```

### Backend (Cloud Run - Optional)
```
✅ .NET 8 API
✅ 8 RESTful endpoints
✅ Gemini API integration
✅ Firebase Auth support
✅ Docker containerized
```

---

## 📞 Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Angular Docs**: https://angular.io/docs
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Project Docs**: See `README.md` and `INTEGRATION_GUIDE.md`

---

## 🔄 Updating After Deployment

### Update Frontend

```bash
# Make changes
git add .
git commit -m "Update feature X"

# Rebuild
npm run build --prefix client

# Redeploy
firebase deploy --only hosting
```

### Update Backend

```bash
# Make changes
git add .
git commit -m "Update API feature X"

# Rebuild
docker build -t gcr.io/fifa-stadium-companion/api .
docker push gcr.io/fifa-stadium-companion/api

# Redeploy
gcloud run deploy fifa-stadium-api --image gcr.io/fifa-stadium-companion/api:latest
```

---

**Deployment Status**: Ready to deploy ✅  
**Build Verification**: All tests passing ✅  
**Local Testing**: Complete ✅

For questions, see the main `README.md` or `INTEGRATION_GUIDE.md`.
