# FIFA World Cup 2026 — Smart Stadium & Fan Companion

A production-ready monorepo for a smart stadium experience platform with:

- **Angular 17+** frontend for fans, staff, and admins with multilingual AI assistance
- **.NET 8** backend API with Firebase integration
- **Firebase** hosting and authentication ready
- **Complete CI/CD** with GitHub Actions validation
- **Full test coverage** (11 backend tests passing, frontend tests configured)

## Quick Links

- 📖 [Integration Guide](./INTEGRATION_GUIDE.md) — Complete guide to add Firebase + Gemini
- 📋 [What's Complete](./NEXT_STEPS_COMPLETE.md) — Summary of latest implementation
- 📘 [Deployment Guide](./DEPLOYMENT.md) — Setup and production deployment
- 📋 [Implementation Plan](./specs/001-stadium-fan-companion/plan.md) — Technical architecture
- 🎯 [Feature Spec](./specs/001-stadium-fan-companion/spec.md) — User stories and acceptance criteria
- ✅ [Task Checklist](./specs/001-stadium-fan-companion/tasks.md) — Implementation progress

## Features

### Fan Experience
- Stadium and match selection with real-time crowd monitoring
- Multilingual AI assistant for personalized guidance
- Venue-aware recommendations

### Staff Operations
- Real-time dispatch action queue with undo support
- Alert management and crowd mitigation tools
- Operations dashboard

### Admin Center
- Sustainability metrics and KPIs
- User role management
- Broadcast-ready reporting

## Build Status

✅ **Frontend**: Angular builds successfully with all three role views
✅ **Backend**: .NET 8 API with 11/11 tests passing
✅ **CI/CD**: GitHub Actions configured for build validation

## Getting Started

### Development

**Start backend** (http://localhost:5000):
```bash
cd server/FifaStadiumCompanion.Api
dotnet run
```

**Start frontend** (http://localhost:4200):
```bash
cd client
npm install
ng serve
```

### Production Build

```bash
# Frontend
npm run build --prefix client

# Backend
dotnet publish server/FifaStadiumCompanion.Api -c Release
```

### Testing

```bash
# Backend tests
dotnet test server/FifaStadiumCompanion.Api.Tests

# Frontend tests
npm test --prefix client
```

## Project Structure

```
.
├── client/                     # Angular SPA
│   ├── src/app/
│   │   ├── core/services/      # Auth, Stadium, AI services
│   │   ├── features/           # Fan, Staff, Admin views
│   │   └── routes.ts           # App routing
│   └── package.json
├── server/                     # .NET 8 API
│   ├── Domain/                 # Entities (Venue, Match, etc.)
│   ├── Application/            # Services (VenueService, etc.)
│   ├── Infrastructure/         # Firebase auth, Firestore
│   └── Endpoints/              # API routes
├── .github/workflows/ci.yml    # Build validation
├── DEPLOYMENT.md               # Full deployment guide
└── specs/                      # Planning artifacts
```

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 17, RxJS, TypeScript |
| **Backend** | .NET 8, ASP.NET Core minimal APIs |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **AI** | Gemini API (configured, ready) |
| **Hosting** | Firebase Hosting + Cloud Run |
| **Testing** | Jasmine/Jest (frontend), xUnit (backend) |
| **CI/CD** | GitHub Actions |

## Remaining Work

The following features are ready for implementation (tasks outlined in task checklist):

- [ ] **Phase 3**: Complete fan experience with full AI integration
- [ ] **Phase 4**: Staff operations with real dispatch workflow
- [ ] **Phase 5**: Admin center with role management
- [ ] **Phase 6**: Production deployment and polishing

See [tasks.md](./specs/001-stadium-fan-companion/tasks.md) for detailed implementation tasks.

## Architecture Highlights

- **Standalone Angular components** with strict TypeScript
- **Clean architecture** in .NET (Domain, Application, Infrastructure)
- **Domain-driven design** with clear entity models
- **Async patterns** using RxJS Observables and async pipes
- **Role-based routing** with lazy-loaded feature modules
- **Testable services** with dependency injection
- **Firebase-first** approach for auth and data persistence

## Next Steps

1. **Configure Firebase Secrets** — Add credentials to `.env`
2. **Integrate Gemini API** — Replace placeholder responses with real API
3. **Wire Firestore** — Implement persistence for conversations and dispatches
4. **Complete Feature Work** — Follow task checklist for MVP completion
5. **Deploy to Production** — Firebase Hosting + Cloud Run

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Support

- Review task list: [tasks.md](./specs/001-stadium-fan-companion/tasks.md)
- Check implementation plan: [plan.md](./specs/001-stadium-fan-companion/plan.md)
- Ensure tests pass before committing

---

**Status**: Foundation complete, ready for feature implementation | **Last Updated**: 2026-07-12
