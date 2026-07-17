# Integration Guide - FIFA Stadium Companion

This guide walks through integrating real Firebase, Gemini API, and Firestore services to move from MVP to production.

## Current State

✅ **Foundation Complete:**
- Frontend makes real HTTP calls to backend (with error fallbacks)
- Backend accepts environment variables for configuration
- Gemini API client structure ready (with mock fallback)
- Firebase Auth service structure ready (with mock implementation)
- All tests passing, builds successful

## Phase 1: Configure Environment Variables

### 1.1 Create `.env` file in project root

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your-firebase-web-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 1.2 Get API Keys

**Gemini API:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy to GEMINI_API_KEY in `.env`

**Firebase:**
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Create web app
3. Copy config to FIREBASE_* variables

### 1.3 Verify Configuration Loading

```bash
# Backend dev server
cd server/FifaStadiumCompanion.Api
dotnet run
# Should see: "FIFA Stadium Companion API - Ready for deployment"

# Frontend dev server
cd ../client
ng serve
# Navigate to http://localhost:4200
# Should load stadiums from backend
```

### 1.4 Local Firebase Emulator

For local development without production Firebase credentials, use the Firebase emulator:

```bash
firebase emulators:start --only firestore,auth
```

Then add the emulator host values to your `.env` file:

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=http://localhost:9099
```

The backend is already configured to detect these settings and switch into emulator-safe mode.

## Phase 2: Integrate Gemini API

### Current Implementation

**File:** `server/FifaStadiumCompanion.Api/Application/Services.cs`

**AiAssistanceService** now:
- Accepts Gemini API key in constructor
- Makes real HTTP calls to `generativelanguage.googleapis.com`
- Provides multilingual system prompts (en, es, fr)
- Falls back to mock responses if API fails or key is missing

### Testing Gemini Integration

```bash
# 1. Add GEMINI_API_KEY to .env
# 2. Restart backend: dotnet run
# 3. In browser, test AI queries:
POST http://localhost:5000/api/ai/query
{
  "query": "How can I get a better view of the pitch?",
  "language": "en"
}

# Should get real Gemini response (not mock)
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check API key is valid and quota available |
| 500 Internal Server | Check network/firewall allows generativelanguage.googleapis.com |
| Mock responses still returned | Verify GEMINI_API_KEY is set in .env and backend restarted |

## Phase 3: Implement Firestore Persistence

### 3.1 Create Firestore Database

```bash
# 1. Firebase Console → Project → Firestore Database
# 2. Create database in production mode (or start with test rules)
# 3. Collections needed:
#    - venues (pre-populate with stadiums)
#    - matches (pre-populate with sample matches)
#    - dispatches (created by staff)
#    - conversations (created by AI queries)
```

### 3.2 Backend: Install Firebase Admin SDK

```bash
cd server/FifaStadiumCompanion.Api
dotnet add package FirebaseAdmin
```

### 3.3 Update Services to Use Firestore

**Example: VenueService**

```csharp
using Firebase.Firestore;

public sealed class VenueService
{
    private readonly FirestoreDb _db;
    
    public VenueService(FirestoreDb db)
    {
        _db = db;
    }
    
    public async Task<IEnumerable<Venue>> GetAllVenuesAsync()
    {
        var snapshot = await _db.Collection("venues").GetSnapshotAsync();
        return snapshot.Documents.Select(doc => 
            new Venue(
                doc.GetValue<string>("id"),
                doc.GetValue<string>("name"),
                doc.GetValue<string>("city"),
                doc.GetValue<int>("capacity"),
                doc.GetValue<string>("imageUrl")
            )
        );
    }
}
```

### 3.4 Update Program.cs

```csharp
// Add Firebase initialization
var projectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID");
var db = FirestoreDb.Create(projectId);

builder.Services.AddSingleton(db);
builder.Services.AddSingleton<VenueService>();
builder.Services.AddSingleton<MatchService>();
builder.Services.AddSingleton<DispatchService>();
```

## Phase 4: Implement Firebase Authentication

### 4.1 Install Firebase Admin SDK

```bash
cd server/FifaStadiumCompanion.Api
dotnet add package FirebaseAdmin
```

### 4.2 Update FirebaseAuthService

**Current:** Mock implementation in `Infrastructure/FirebaseAuthService.cs`

**Replace with:**

```csharp
using FirebaseAdmin;
using FirebaseAdmin.Auth;

public sealed class FirebaseAuthService : IFirebaseAuthService
{
    public async Task<FirebaseUser?> ValidateIdTokenAsync(string idToken)
    {
        try
        {
            // Initialize Firebase if not already done
            if (FirebaseApp.DefaultInstance == null)
            {
                FirebaseApp.Create();
            }

            var auth = FirebaseAuth.DefaultInstance;
            var decodedToken = await auth.VerifyIdTokenAsync(idToken);

            var claims = new List<string>();
            if (decodedToken.Claims.TryGetValue("role", out var role))
                claims.Add(role.ToString() ?? "fan");

            return new FirebaseUser(
                Uid: decodedToken.Uid,
                Email: decodedToken.Claims.ContainsKey("email") 
                    ? decodedToken.Claims["email"].ToString() 
                    : "",
                Claims: claims
            );
        }
        catch
        {
            return null;
        }
    }
}
```

### 4.3 Frontend: Initialize Firebase Auth

**File:** `client/src/main.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  apiKey: environment.firebaseConfig.apiKey,
  authDomain: environment.firebaseConfig.authDomain,
  projectId: environment.firebaseConfig.projectId,
  storageBucket: environment.firebaseConfig.storageBucket,
  messagingSenderId: environment.firebaseConfig.messagingSenderId,
  appId: environment.firebaseConfig.appId,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Set up auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.email);
  }
});
```

## Phase 5: End-to-End Testing

### Test Checklist

```bash
# 1. Verify backend starts with real config
cd server/FifaStadiumCompanion.Api
dotnet run
# Check logs for successful Firebase/Gemini initialization

# 2. Test frontend → backend HTTP calls
cd ../client
ng serve
# Open browser dev tools → Network tab
# Navigate to /fan view
# Should see real GET /api/stadiums request

# 3. Test AI query with Gemini
# In fan view, submit AI query
# Should see real Gemini response (not mock)

# 4. Test dispatch creation
# Navigate to /staff view
# Create dispatch
# Should see in real Firestore collection

# 5. Run full test suite
cd ../server
dotnet test
# All tests should still pass
```

### Manual Integration Test

```bash
# Terminal 1: Backend
cd server/FifaStadiumCompanion.Api
dotnet run
# Expected: "Hosting environment: Development"

# Terminal 2: Frontend
cd client
ng serve
# Expected: "Application bundle generation complete"

# Browser: http://localhost:4200
# Expected flow:
# 1. See stadium grid loaded from real backend
# 2. Select stadium → see real crowd data
# 3. Submit AI query → see real Gemini response
# 4. Go to staff → create dispatch → see persisted in Firestore
```

## Phase 6: Deploy to Production

### 6.1 Frontend: Deploy to Firebase Hosting

```bash
cd client
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Configure Firebase
firebase login
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### 6.2 Backend: Deploy to Cloud Run

```bash
cd server

# Build Docker image (create Dockerfile first)
docker build -t fifa-stadium-api .

# Push to Container Registry
docker tag fifa-stadium-api gcr.io/PROJECT-ID/fifa-stadium-api
docker push gcr.io/PROJECT-ID/fifa-stadium-api

# Deploy to Cloud Run
gcloud run deploy fifa-stadium-api \
  --image gcr.io/PROJECT-ID/fifa-stadium-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars FIREBASE_PROJECT_ID=your-project-id \
  --set-env-vars GEMINI_API_KEY=your-api-key
```

### 6.3 Update Frontend Config for Production

**File:** `client/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://fifa-stadium-api-xxxxx.a.run.app/api',
  firebaseConfig: {
    apiKey: 'YOUR_PRODUCTION_API_KEY',
    authDomain: 'fifa-stadium-companion.firebaseapp.com',
    projectId: 'fifa-stadium-companion',
    storageBucket: 'fifa-stadium-companion.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  }
};
```

## Verification Checklist

### Pre-Deployment

- [ ] `.env` file created with all required keys
- [ ] Backend builds successfully: `dotnet build`
- [ ] Frontend builds successfully: `npm run build`
- [ ] All tests pass: `dotnet test`
- [ ] Local dev server tests (see Phase 5)
- [ ] Gemini API responds with real data
- [ ] Firebase auth tokens validate
- [ ] Firestore collections created and accessible

### Post-Deployment

- [ ] Frontend hosting loads at Firebase Hosting URL
- [ ] Backend API responds at Cloud Run URL
- [ ] Frontend can reach backend (check CORS)
- [ ] AI queries return real Gemini responses
- [ ] Dispatches persist to Firestore
- [ ] User auth works end-to-end
- [ ] All role views functional (fan, staff, admin)

## Troubleshooting

### Backend won't start

```bash
# Check .env exists
ls -la .env

# Check FIREBASE_PROJECT_ID is set
echo $FIREBASE_PROJECT_ID

# Rebuild and run with verbose logging
dotnet build -v minimal
dotnet run
```

### Frontend can't reach backend

```bash
# Check CORS is enabled in Program.cs
# Check backend is running: curl http://localhost:5000

# Check frontend API URL
# Update in StadiumService if needed
```

### Gemini API returning errors

```bash
# Verify API key is valid
# Check Google Cloud quota and billing

# Test API directly
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Firestore connection issues

```bash
# Verify Firebase project ID
# Check Firestore database is created
# Check authentication is configured

# Test Firestore access from backend
# Use Firebase Console to check collections
```

## Next Steps

1. **Configure environment variables** (Phase 1)
2. **Test Gemini API** (Phase 2)
3. **Implement Firestore** (Phase 3)
4. **Add Firebase Auth** (Phase 4)
5. **End-to-end testing** (Phase 5)
6. **Deploy to production** (Phase 6)

Each phase is independent and can be done incrementally. Start with Phase 1 for immediate testing.

---

**Status:** Foundation ready for integration | **Estimated Integration Time:** 4-6 hours
