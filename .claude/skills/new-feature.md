---
name: new-feature
description: Complete feature development Agentic Flow - orchestrates multiple specialized agents through a full development lifecycle
argument-hint: "<provide feature name and description>"
---

# Feature Development Workflow

**Feature Request:** $ARGUMENTS

---

## Workflow State Management

Before starting, I will create a workflow state file to track progress:

```json
{
  "feature": "$ARGUMENTS",
  "featureSlug": "$FEATURE_SLUG",
  "startedAt": "$TIMESTAMP",
  "currentPhase": 1,
  "currentStep": "1.1",
  "status": "in_progress",
  "checkpoints": {
    "design_approved": false,
    "backend_complete": false,
    "frontend_complete": false,
    "e2e_complete": false
  },
  "outputs": []
}
```

**Location:** `docs/features/$FEATURE_SLUG/workflow-state.json`

---

## Phase 1: Requirements & Design

### Step 1.1: Requirements Analysis

I will act as a **Product Manager** to:

1. Parse the feature description and extract core requirements
2. Identify user stories in format: "As a [user], I want [feature], so that [benefit]"
3. Define clear acceptance criteria for each user story
4. List edge cases and error scenarios
5. Identify dependencies on existing features

**Tasks:**
- [ ] Create feature directory: `docs/features/$FEATURE_SLUG/`
- [ ] Analyze feature request
- [ ] Write user stories
- [ ] Define acceptance criteria
- [ ] Document edge cases

**Output:** Create `docs/features/$FEATURE_SLUG/requirements.md`

```markdown
# Feature Requirements: $FEATURE_NAME

## Overview
[Brief description]

## User Stories
1. As a [user], I want [feature], so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Edge Cases
- Case 1: [description]

## Dependencies
- [List existing features/modules this depends on]
```

---

### Step 1.2: Technical Architecture

I will invoke the **@architect** agent to:

1. Review requirements document
2. Design API contracts (OpenAPI/Swagger spec)
3. Design database schema changes (if needed)
4. Plan frontend components and state management
5. Identify integration points with existing code
6. Assess technical risks and mitigation strategies

**Tasks:**
- [ ] Review existing codebase patterns
- [ ] Design API endpoints
- [ ] Design data models
- [ ] Plan frontend architecture
- [ ] Document integration points

**Output:** Create `docs/features/$FEATURE_SLUG/design.md`

```markdown
# Technical Design: $FEATURE_NAME

## API Design

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/... | ... |

### Request/Response Schemas
[OpenAPI snippets]

## Database Schema
[Entity diagrams or Prisma/TypeORM schema]

## Frontend Architecture
- Components: [list]
- State Management: [approach]
- Routes: [new routes if any]

## Integration Points
- [Existing module] → [How it connects]

## Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
```

---

### CHECKPOINT: Design Review

**Status:** Awaiting approval

Before proceeding to implementation, review:
- [ ] Requirements are complete and unambiguous
- [ ] API design follows existing patterns
- [ ] Database changes are backward-compatible
- [ ] Frontend approach aligns with existing architecture

**To proceed:** Confirm design approval or request changes.

---

## Phase 2: Backend Development

### Step 2.1: Database Layer

I will invoke the **@backend-engineer** agent to:

1. Create database migration (if schema changes needed)
2. Update entity/model definitions
3. Create or update repository interfaces
4. Run and verify migration

**Commands:**
```bash
# For Prisma projects
npx prisma migrate dev --name $FEATURE_SLUG

# For TypeORM projects (like DealHunter)
npm run typeorm migration:generate -- -n $FEATURE_SLUG
npm run typeorm migration:run
```

**Location:** `src/modules/$FEATURE_SLUG/entities/`

**Tasks:**
- [ ] Create/update entity definitions
- [ ] Create migration file
- [ ] Run migration
- [ ] Verify database state

---

### Step 2.2: API Implementation

I will invoke the **@backend-engineer** agent to:

1. Create DTOs with class-validator decorators
2. Implement service layer with business logic
3. Create controller with proper decorators
4. Add comprehensive error handling
5. Implement proper logging

**Location:** `src/modules/$FEATURE_SLUG/`

**File Structure:**
```
src/modules/$FEATURE_SLUG/
├── $FEATURE_SLUG.module.ts
├── $FEATURE_SLUG.controller.ts
├── $FEATURE_SLUG.service.ts
├── dto/
│   ├── create-$FEATURE_SLUG.dto.ts
│   └── update-$FEATURE_SLUG.dto.ts
├── entities/
│   └── $FEATURE_SLUG.entity.ts
└── repositories/
    ├── $FEATURE_SLUG.repository.interface.ts
    └── typeorm-$FEATURE_SLUG.repository.ts
```

**Tasks:**
- [ ] Create module file
- [ ] Create DTOs with validation
- [ ] Implement service layer
- [ ] Create controller endpoints
- [ ] Add error handling
- [ ] Add logging
- [ ] Register module in app.module.ts

---

### Step 2.3: Backend Tests

I will invoke the **@test-writer** agent to:

1. Write unit tests for service layer
2. Write integration tests for API endpoints
3. Achieve minimum 80% code coverage
4. Run and verify all tests pass

**Location:** `src/modules/$FEATURE_SLUG/*.spec.ts`

**Commands:**
```bash
# Run feature-specific tests
npm test -- --testPathPattern=$FEATURE_SLUG

# Run with coverage
npm test -- --testPathPattern=$FEATURE_SLUG --coverage
```

**Tasks:**
- [ ] Write service unit tests
- [ ] Write controller unit tests
- [ ] Write integration/e2e tests
- [ ] Verify coverage >= 80%
- [ ] All tests passing

---

### CHECKPOINT: Backend Complete

**Verification:**
```bash
# Build check
npm run build

# Lint check
npm run lint

# Test check
npm test -- --testPathPattern=$FEATURE_SLUG

# Manual API verification
curl -X GET http://localhost:3000/$FEATURE_SLUG
```

**Checklist:**
- [ ] Code compiles without errors
- [ ] All tests passing
- [ ] No linting errors
- [ ] API endpoints respond correctly

---

## Phase 3: Frontend Development

### Step 3.1: API Client Layer

I will invoke the **@frontend-engineer** agent to:

1. Generate/update TypeScript types from API
2. Create API client functions
3. Add to centralized API service

**Location (React Admin):** `admin_panel/src/api/`
**Location (Flutter):** `flutter_app/lib/features/$FEATURE_SLUG/data/`

**Tasks:**
- [ ] Create TypeScript/Dart types
- [ ] Implement API client methods
- [ ] Add error handling
- [ ] Add request/response logging

---

### Step 3.2: State Management

I will invoke the **@frontend-engineer** agent to:

**For React Admin (Zustand):**
```typescript
// stores/$FEATURE_SLUG.store.ts
interface $FeatureState {
  items: $Feature[];
  loading: boolean;
  error: string | null;
  // actions
  fetch: () => Promise<void>;
  create: (data: Create$FeatureDto) => Promise<void>;
}
```

**For Flutter (Riverpod):**
```dart
// providers/$FEATURE_SLUG_provider.dart
final $featureProvider = StateNotifierProvider<$FeatureNotifier, $FeatureState>((ref) {
  return $FeatureNotifier(ref.read(apiClientProvider));
});
```

**Tasks:**
- [ ] Define state shape
- [ ] Create store/provider
- [ ] Implement actions
- [ ] Add selectors/getters

---

### Step 3.3: UI Components

I will invoke the **@frontend-engineer** + **@ui-designer** agents to:

1. Create presentational components
2. Apply consistent styling (following existing design system)
3. Handle loading, error, and empty states
4. Ensure accessibility (ARIA labels, keyboard navigation)
5. Make responsive for different screen sizes

**Tasks:**
- [ ] Create list/grid component
- [ ] Create detail/form component
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Verify accessibility
- [ ] Test responsive behavior

---

### Step 3.4: Integration & Navigation

I will invoke the **@frontend-engineer** agent to:

1. Connect components to state management
2. Wire up API calls
3. Add navigation routes
4. Implement any necessary guards/middleware

**Tasks:**
- [ ] Connect components to store/provider
- [ ] Add route definitions
- [ ] Implement navigation
- [ ] Add to menu/sidebar if needed

---

### Step 3.5: Frontend Tests

I will invoke the **@test-writer** agent to:

1. Write component tests (rendering, interactions)
2. Write hook/provider tests
3. Write integration tests
4. Verify accessibility with automated tools

**Commands:**
```bash
# React Admin
npm test -- --testPathPattern=$FEATURE_SLUG

# Flutter
flutter test test/features/$FEATURE_SLUG/
```

**Tasks:**
- [ ] Component unit tests
- [ ] State management tests
- [ ] Integration tests
- [ ] Accessibility tests

---

### CHECKPOINT: Frontend Complete

**Verification:**
```bash
# React Admin
cd admin_panel
npm run type-check
npm run build
npm run dev  # Manual visual verification

# Flutter
cd flutter_app
flutter analyze
flutter build web
flutter run  # Manual visual verification
```

**Checklist:**
- [ ] TypeScript/Dart compiles without errors
- [ ] All tests passing
- [ ] No linting errors
- [ ] UI renders correctly
- [ ] Interactions work as expected

---

## Phase 4: End-to-End Testing

### Step 4.1: E2E Test Scenarios

I will invoke the **@test-writer** agent to create comprehensive E2E tests:

**Location:** `e2e/$FEATURE_SLUG.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('$FEATURE_NAME', () => {
  test('happy path - create and view', async ({ page }) => {
    // Test implementation
  });

  test('error handling - validation errors', async ({ page }) => {
    // Test implementation
  });

  test('edge case - [specific scenario]', async ({ page }) => {
    // Test implementation
  });
});
```

**Tasks:**
- [ ] Write happy path tests
- [ ] Write error scenario tests
- [ ] Write edge case tests
- [ ] Write performance tests (if applicable)

---

### Step 4.2: Run Full Test Suite

**Commands:**
```bash
# Unit + Integration tests
npm test

# E2E tests
npx playwright test e2e/$FEATURE_SLUG.spec.ts

# Full E2E suite
npx playwright test

# Coverage report
npm run test:cov
```

**Tasks:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Coverage >= 80%

---

## Phase 5: Observability

I will add proper observability:

### Logging
```typescript
// Add structured logging to new endpoints
this.logger.log({
  context: '$FeatureService',
  action: 'create',
  data: { id: result.id },
  duration: endTime - startTime
});
```

### Metrics (if applicable)
- Request count per endpoint
- Response time percentiles
- Error rates

### Alerts (if applicable)
- Error rate threshold alerts
- Latency threshold alerts

**Tasks:**
- [ ] Add structured logging
- [ ] Add metrics collection
- [ ] Configure alerts (if needed)

---

## Phase 6: Documentation

### API Documentation
- Update OpenAPI/Swagger spec
- Regenerate API docs if using automated tools

### Code Documentation
- Add JSDoc/DartDoc to public interfaces
- Document complex business logic

### User Documentation
- Update README if setup changed
- Add entry to CHANGELOG.md
- Create user guide if user-facing feature

**Tasks:**
- [ ] Update API documentation
- [ ] Add code documentation
- [ ] Update CHANGELOG.md
- [ ] Update README if needed

---

## Phase 7: Final Verification

### Pre-Merge Checklist

```
Code Quality:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage >= 80%
- [ ] No linting errors
- [ ] No TypeScript/Dart errors
- [ ] Code reviewed (if applicable)

Functionality:
- [ ] All acceptance criteria met
- [ ] Edge cases handled
- [ ] Error handling complete
- [ ] Loading states implemented

Security:
- [ ] Input validation in place
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization correct

Performance:
- [ ] No N+1 queries
- [ ] Appropriate indexes added
- [ ] Response times acceptable

Documentation:
- [ ] API docs updated
- [ ] CHANGELOG updated
- [ ] Code comments where needed
```

### Final Commands

```bash
# Full verification
npm run lint
npm run build
npm test
npm run test:e2e

# Start and manually verify
npm run start:dev
# Test endpoints with curl or Postman

# Flutter verification
cd flutter_app
flutter analyze
flutter test
flutter build web
```

---

## Completion Summary

When workflow completes, provide summary:

```markdown
# Feature Complete: $FEATURE_NAME

## Summary
- **Status:** COMPLETE / BLOCKED
- **Duration:** [time taken]
- **Files Changed:** [count]

## What Was Built
- [List of major components]

## Tests Added
- Unit tests: [count]
- Integration tests: [count]
- E2E tests: [count]
- Coverage: [percentage]

## Documentation Updated
- [List of docs]

## Known Limitations
- [Any limitations or future improvements]

## Rollback Instructions
If issues are found:
1. Revert commit: `git revert [commit-hash]`
2. Run migration rollback: `npm run typeorm migration:revert`
```

---

## Workflow Patterns Reference

This workflow uses these patterns:

| Pattern | Usage |
|---------|-------|
| **Sequential Pipeline** | Phases flow 1 → 2 → 3 → ... → 7 |
| **Gate/Checkpoint** | Human approval at design and major milestones |
| **Parallel Fanout** | UI + State + API client in Phase 3 |
| **Iterative Loop** | Test → Fix → Test until passing |

---

## Quick Commands

```bash
# Resume workflow from checkpoint
# Check: docs/features/$FEATURE_SLUG/workflow-state.json

# Rollback all changes
git checkout -- .
git clean -fd

# View workflow progress
cat docs/features/$FEATURE_SLUG/workflow-state.json
```
