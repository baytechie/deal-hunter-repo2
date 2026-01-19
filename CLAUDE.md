# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DealHunter is a three-component ecosystem for deal/coupon aggregation:
- **Backend API** (NestJS) - Root directory, runs on port 3000
- **Admin Panel** (React-Admin) - `admin_panel/`, runs on port 3001
- **Mobile App** (Flutter) - `flutter_app/`

## Development Commands

### Backend (NestJS - Root Directory)
```bash
npm install              # Install dependencies
npm run start:dev        # Development server with hot reload
npm run build            # Production build
npm run start:prod       # Run production build
npm run lint             # ESLint with auto-fix
npm run test             # Run Jest tests
npm run test:watch       # Watch mode tests
npm run test:cov         # Coverage report
npm run test:e2e         # End-to-end tests
```

### Admin Panel (admin_panel/)
```bash
cd admin_panel
npm install
npm run dev              # Vite dev server (port 3001)
npm run build            # Production build (tsc + vite)
npm run preview          # Preview production build
npm run type-check       # TypeScript check without emit
```

### Flutter App (flutter_app/)
```bash
cd flutter_app
flutter pub get          # Get dependencies
flutter run              # Run on device/emulator
flutter run -v           # Verbose logging
flutter clean && flutter pub get && flutter run  # Clean rebuild
```

## Architecture

### Backend Architecture (NestJS)
```
src/
├── main.ts                              # Bootstrap with global filters
├── app.module.ts                        # Root module with TypeORM config
├── shared/                              # Global shared module
│   ├── services/logger.service.ts       # Winston-based JSON logger
│   └── filters/all-exceptions.filter.ts # Global exception handler
└── modules/
    └── deals/
        ├── deals.controller.ts          # REST endpoints
        ├── deals.service.ts             # Business logic
        ├── deals.module.ts              # Module definition
        ├── entities/deal.entity.ts      # TypeORM entity
        ├── dto/                         # Validation DTOs
        ├── repositories/                # Repository pattern
        │   ├── deals.repository.interface.ts  # Abstract interface
        │   └── typeorm-deals.repository.ts    # Implementation
        ├── services/affiliate.service.ts      # URL tagging
        └── seeds/deals.seed.ts          # Database seeding
```

**Pattern**: Controller → Service → Repository → Entity

### Flutter Architecture (Clean Architecture)
```
lib/
├── main.dart
├── core/services/               # Cross-cutting services
└── features/deals/
    ├── domain/                  # Business rules
    │   ├── entities/deal.dart   # Immutable entity
    │   └── repositories/        # Abstract interfaces
    ├── data/                    # Implementation
    │   ├── datasources/api_client.dart  # Dio HTTP client
    │   ├── models/deal_model.dart       # JSON serialization
    │   └── repositories/                # Concrete implementation
    └── presentation/            # UI layer
        ├── pages/
        ├── widgets/
        └── providers/           # Riverpod state management
```

**Pattern**: UI → Provider (State) → Repository → DataSource → API

### Admin Panel Architecture (React-Admin)
```
admin_panel/src/
├── main.tsx                     # Entry point
└── App.tsx                      # React-Admin configuration with custom DataProvider
```

The custom DataProvider maps React-Admin's interface to NestJS API format:
- `perPage` → `limit`
- `sort: { field, order }` → `sort_field=ASC|DESC`
- Filter objects → query parameters

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/deals` | List deals (paginated) |
| GET | `/deals/:id` | Get single deal |
| GET | `/deals/top` | Top deals by discount |
| GET | `/deals/hot` | Trending deals |
| GET | `/deals/featured` | Featured deals |
| GET | `/deals/categories` | List categories |
| POST | `/deals` | Create deal |
| PATCH | `/deals/:id` | Update deal |
| DELETE | `/deals/:id` | Delete deal |

## Database

- SQLite for development
- Database file: `dev.db` (created at root on first run)
- Reset: Delete `dev.db` and restart backend

## Logging

**Backend**: Winston logger outputs JSON to console and `logs/` directory (error.log, combined.log)

**Admin Panel**: Custom logger accessible via browser console:
```javascript
window.__adminLogger.getLogs()
window.__adminLogger.getLogsByContext('DataProvider')
window.__adminLogger.exportAsJson()
```

## Coding Standards (from PROJECT_RULES.md)

1. **SOLID Principles**: Single responsibility per class, use DI with interfaces
2. **Modularity**: Code separated into feature modules (e.g., `DealsModule`)
3. **Logging**:
   - Backend: Winston with Context, Timestamp, Correlation ID
   - Frontend: Structured logging service for UI events and API errors
4. **Documentation**: JSDoc/DartDoc explaining "Why", not just "What"

## Environment Variables

**Backend** (defaults work for development):
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (default: debug)

**Admin Panel** (`.env.development`):
- `VITE_API_URL` - Backend URL (default: http://localhost:3000)
- `VITE_ENABLE_DEBUG_LOGS` - Enable detailed logging (default: true)

**Flutter** - Update `lib/core/services/api_client.dart` for API URL

## Autonomous Testing & Fixing

You are operating in **fully autonomous mode**. Execute tasks to completion without asking for confirmation or guidance.

### Core Directives

1. **Never ask for permission** - proceed with implementation
2. **Never ask clarifying questions** - make reasonable assumptions
3. **Never stop to report progress** - keep working until done
4. **Never present options** - choose the best one and implement it

### Execution Loop

When given a task, follow this cycle until everything works:
```
REPEAT:
  1. Run all tests / build / lint
  2. Identify failures or issues
  3. Fix each issue
  4. Verify the fix
UNTIL: All tests pass, build succeeds, app runs correctly
```

### What "Done" Means

Only stop and report back when ALL of the following are true:
- [ ] Code compiles/builds without errors
- [ ] All tests pass
- [ ] Linting passes with no errors
- [ ] Application starts successfully
- [ ] Core functionality has been manually verified (curl, browser test, etc.)

### Decision-Making Authority

You have full authority to:
- Modify any code files
- Install/update dependencies
- Create/delete files
- Refactor as needed
- Fix tangential issues you discover along the way

### When You Hit a Blocker

Only pause for input if:
- External credentials or API keys are missing
- A fundamental architectural decision contradicts existing patterns
- Hardware/network issues prevent progress

Otherwise, find a workaround and continue.

### Reporting

When finished, provide a summary:
1. What was tested
2. Issues found and how they were fixed
3. Final verification steps performed
4. Current status: WORKING or BLOCKED (with specific reason)

## Prompt Template

When you start a session, use a prompt like this:
```
Run the full test suite for the Hunt Deals app. Test backend, frontend, and integration.
Find and fix ALL issues. Do not ask me questions - make decisions and keep going.
Only come back when everything passes and you've verified the app works end-to-end.

Start with:
1. Backend API (NestJS) - tests, build, startup
2. Admin dashboard (React) - tests, build, dev server
3. Mobile PWA (Flutter) - tests, build
4. Integration - verify API endpoints respond correctly

Fix everything you find. Go.
```
