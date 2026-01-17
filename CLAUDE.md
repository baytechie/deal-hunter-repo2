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
