---
name: hunt-deals-feature
description: DealHunter-specific feature workflow optimized for the deals ecosystem
argument-hint: "<feature description for DealHunter app>"
---

# Hunt Deals Feature Workflow

**Feature:** $ARGUMENTS

---

## Project Context

DealHunter is a three-component ecosystem:
- **Backend API** (NestJS) - Root directory, port 3000
- **Admin Panel** (React-Admin) - `admin_panel/`, port 3001
- **Mobile App** (Flutter) - `flutter_app/`

---

## Phase 1: Requirements & Design

### Step 1.1: Feature Analysis

I will analyze the feature for DealHunter context:
1. Which components are affected? (Backend / Admin / Flutter / All)
2. Is this deal-related, user-related, or infrastructure?
3. Does it need new database entities?
4. What existing patterns should be followed?

**Existing Patterns:**
- Backend: Controller → Service → Repository → Entity
- Flutter: UI → Provider → Repository → DataSource → API
- Admin: React-Admin DataProvider pattern

---

### Step 1.2: Technical Design

I will invoke **@architect** to design:

**For Deals Module features:**
- Follow existing `src/modules/deals/` structure
- Use TypeORM entities
- Implement repository interface pattern
- Use DTOs with class-validator

**For Flutter features:**
- Follow Clean Architecture in `lib/features/`
- Use Riverpod for state management
- Implement repository pattern
- Use Dio for HTTP client

**Output:** Create `docs/features/$FEATURE_SLUG/design.md`

---

## Phase 2: Backend Development

### Step 2.1: Entity & Migration

**Location:** `src/modules/$FEATURE_SLUG/entities/`

```typescript
// Example entity following DealHunter patterns
@Entity('$feature_slug')
export class $Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Step 2.2: Repository Pattern

**Interface:** `src/modules/$FEATURE_SLUG/repositories/$FEATURE_SLUG.repository.interface.ts`
**Implementation:** `src/modules/$FEATURE_SLUG/repositories/typeorm-$FEATURE_SLUG.repository.ts`

### Step 2.3: Service & Controller

Following DealHunter patterns:
```
src/modules/$FEATURE_SLUG/
├── $FEATURE_SLUG.module.ts
├── $FEATURE_SLUG.controller.ts
├── $FEATURE_SLUG.service.ts
├── dto/
│   ├── create-$FEATURE_SLUG.dto.ts
│   └── update-$FEATURE_SLUG.dto.ts
└── entities/
    └── $FEATURE_SLUG.entity.ts
```

### Step 2.4: Logging

Use Winston logger following existing pattern:
```typescript
this.logger.log({
  context: '$FeatureService',
  action: 'methodName',
  correlationId: requestId,
  data: { ... }
});
```

### Step 2.5: Backend Tests

```bash
npm test -- --testPathPattern=$FEATURE_SLUG
npm run test:cov
```

---

## Phase 3: Admin Panel Development

### Step 3.1: DataProvider Integration

The custom DataProvider in `admin_panel/src/App.tsx` handles:
- `perPage` → `limit`
- `sort: { field, order }` → `sort_field=ASC|DESC`
- Filter objects → query parameters

### Step 3.2: Resource Component

```tsx
// admin_panel/src/resources/$Feature.tsx
import { List, Datagrid, TextField, EditButton } from 'react-admin';

export const $FeatureList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      {/* fields */}
      <EditButton />
    </Datagrid>
  </List>
);
```

### Step 3.3: Add to Admin App

Register resource in `admin_panel/src/App.tsx`

---

## Phase 4: Flutter App Development

### Step 4.1: Domain Layer

**Entity:** `lib/features/$FEATURE_SLUG/domain/entities/$FEATURE_SLUG.dart`
**Repository Interface:** `lib/features/$FEATURE_SLUG/domain/repositories/`

### Step 4.2: Data Layer

**Model:** `lib/features/$FEATURE_SLUG/data/models/$FEATURE_SLUG_model.dart`
**DataSource:** `lib/features/$FEATURE_SLUG/data/datasources/`
**Repository Impl:** `lib/features/$FEATURE_SLUG/data/repositories/`

### Step 4.3: Presentation Layer

**Provider:** `lib/features/$FEATURE_SLUG/presentation/providers/`
**Pages:** `lib/features/$FEATURE_SLUG/presentation/pages/`
**Widgets:** `lib/features/$FEATURE_SLUG/presentation/widgets/`

### Step 4.4: Flutter Build

```bash
cd flutter_app
flutter pub get
flutter analyze
flutter test
flutter build web
flutter run
```

---

## Phase 5: Integration Testing

### API Verification

```bash
# Start backend
npm run start:dev

# Test endpoints
curl http://localhost:3000/$FEATURE_SLUG
curl http://localhost:3000/deals  # Verify existing still works
```

### Admin Panel Verification

```bash
cd admin_panel
npm run dev
# Navigate to http://localhost:3001
# Verify new resource appears and works
```

### Flutter Verification

```bash
cd flutter_app
flutter run -d chrome
# Or connect device and run
flutter run
```

---

## Phase 6: Documentation

- [ ] Update API docs in `docs/`
- [ ] Update `README.md` if needed
- [ ] Add to `CHANGELOG.md`
- [ ] Update `CLAUDE.md` if new patterns introduced

---

## Verification Checklist

```
Backend:
- [ ] npm run lint passes
- [ ] npm run build passes
- [ ] npm test passes
- [ ] API responds correctly

Admin Panel:
- [ ] npm run type-check passes
- [ ] npm run build passes
- [ ] Resource works in UI

Flutter:
- [ ] flutter analyze passes
- [ ] flutter test passes
- [ ] flutter build web passes
- [ ] App runs correctly
```

---

## Quick Commands Reference

```bash
# Backend
npm run start:dev
npm run lint
npm run build
npm test

# Admin Panel
cd admin_panel
npm run dev
npm run build
npm run type-check

# Flutter
cd flutter_app
flutter pub get
flutter analyze
flutter test
flutter run
flutter build web
```
