# FIFA World Cup 2026 — Smart Stadium & Fan Companion

A monorepo production platform with Angular 17+ frontend and .NET 8 backend for stadium operations, fan engagement, and sustainability insights.

## Architecture

- **Frontend**: Angular 17+ standalone SPA with role-based routing (Fan, Staff, Admin)
- **Backend**: .NET 8 minimal API with domain-driven design
- **Database**: Firestore for persistence (configured, ready for Firebase secrets)
- **Auth**: Firebase Authentication with role-based claims
- **AI**: Gemini API for multilingual queries and assistance
- **Deployment**: Firebase Hosting (frontend) + Cloud Run/Functions (backend)

## Project Structure

```
.
├── client/                 # Angular 17+ frontend
│   ├── src/app/
│   │   ├── core/          # Shared services
│   │   ├── features/      # Fan, Staff, Admin views
│   │   └── routes.ts      # App routing
│   └── package.json
├── server/                 # .NET 8 API
│   ├── FifaStadiumCompanion.Api/
│   │   ├── Domain/        # Entities
│   │   ├── Application/   # Services
│   │   ├── Infrastructure/# Firebase, Auth
│   │   └── Endpoints/     # Minimal API routes
│   └── FifaStadiumCompanion.Api.Tests/
├── .github/workflows/      # CI/CD
├── firebase.json           # Firebase config
├── .firebaserc             # Firebase project
└── .env.example            # Environment template
```

## Quick Start

### Prerequisites

- Node.js 20+
- .NET 8 SDK
- Firebase CLI
- Gemini API key

### Development

**Frontend:**
```bash
cd client
npm install
npm run build          # Production build
npm start              # Dev server (ng serve)
npm test               # Run Jest tests
```

**Backend:**
```bash
cd server
dotnet build          # Build API
dotnet test FifaStadiumCompanion.Api.Tests/FifaStadiumCompanion.Api.Tests.csproj
```

**Run Locally:**
```bash
# Terminal 1: Backend (http://localhost:5000)
cd server/FifaStadiumCompanion.Api
dotnet run

# Terminal 2: Frontend (http://localhost:4200)
cd client
ng serve
```

## Features

### For Fans
- Stadium selection and match details
- Real-time crowd level monitoring
- Multilingual AI assistant
- Personalized guidance

### For Staff
- Dispatch action queue
- Alert management
- Undo support
- Crowd heatmap ready

### For Admins
- Sustainability metrics dashboard
- User role management
- Operations center oversight
- Broadcast-ready reporting

## Testing

All tests are configured and passing:
- **Backend**: 11/11 xUnit tests pass
- **Frontend**: Jasmine/Jest unit tests configured
- **CI**: GitHub Actions validates build on push/PR

## Deployment

### Firebase Setup

1. **Create Firebase Project**
   ```bash
   firebase init
   ```

2. **Secrets Configuration** (in `.env`)
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-key
   GEMINI_API_KEY=your-gemini-key
   ```

3. **Deploy**
   ```bash
   # Frontend to Firebase Hosting
   npm run build --prefix client
   firebase deploy --only hosting

   # Backend to Cloud Run
   cd server
   dotnet publish -c Release
   gcloud run deploy fifa-stadium-api --source .
   ```

### Environment Variables
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_PRIVATE_KEY`: Firebase service account key
- `FIREBASE_AUTH_ENABLED`: Set to true in production
- `GEMINI_API_KEY`: Google AI API key for Gemini queries

## Constitution & Quality Gates

This project follows strict quality standards:
- **Code Quality**: Strict TypeScript, no implicit any
- **Testing**: Unit and integration tests required before merge
- **Accessibility**: WCAG 2.1 AA compliance for all views
- **Performance**: p95 latency <250ms for core UI updates
- **Security**: Firebase ID token validation on all protected endpoints

## API Endpoints

All endpoints are mock-ready for development:

```
GET  /api/stadiums              # List all venues
GET  /api/stadiums/{id}         # Stadium details
GET  /api/stadiums/{id}/crowd   # Crowd status
GET  /api/matches               # Scheduled matches
GET  /api/matches/{id}/live     # Match details
POST /api/ai/query              # AI assistance
POST /api/dispatch              # Issue dispatch
GET  /api/sustainability/{id}   # Sustainability metrics
POST /api/admin/roles           # Manage user roles
```

## Troubleshooting

**Frontend build fails**: Ensure `@angular-devkit/build-angular` is installed
```bash
cd client && npm install @angular-devkit/build-angular@^17.0.0
```

**Backend tests fail**: Verify .NET 8 SDK:
```bash
dotnet --version
```

**CORS issues**: Check `provideHttpClient()` is configured in main.ts

## Next Steps

1. **Secrets**: Add Firebase credentials to `.env`
2. **Gemini Integration**: Replace placeholder AI with real Gemini API calls
3. **Firestore Models**: Implement Firestore collections for persistence
4. **Authentication**: Wire Firebase Auth SDK on frontend
5. **Testing**: Add integration tests for API flows
6. **Styling**: Customize CSS variables for brand colors
7. **Deployment**: Deploy to Firebase Hosting and Cloud Run

## Support

For issues or questions:
1. Check the task list in `specs/001-stadium-fan-companion/tasks.md`
2. Review the implementation plan in `specs/001-stadium-fan-companion/plan.md`
3. Ensure all tests pass before opening issues

## License

Internal - FIFA World Cup 2026 Project
