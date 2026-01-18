# Project Guidelines & Rules

This document contains all style guides, rules, and design guidelines for the DealHunter project.

---

## Tech Stack

- **Mobile/PWA:** Flutter (Clean Architecture, Riverpod for state, Dio for HTTP)
- **Backend:** NestJS (TypeScript, TypeORM, SQLite/PostgreSQL)
- **Admin Panel:** React (Vite, React-Admin)

---

## Git Workflow

### Branch Strategy
- **Always create a feature branch** for code changes (e.g., `feature/add-login`, `fix/api-error`)
- Merge feature branches to `main` after completion
- Push changes to remote after merging

### Exceptions
- Documentation and guideline updates can be committed directly to `main`

---

## Coding Standards

### SOLID Principles
- Every class must have a single responsibility
- Use Dependency Injection with interfaces, not concrete implementations

### Modularity
- Code must be separated into feature modules (e.g., `AuthModule`, `DealsModule`)

### Logging
- **Backend:** Use Winston. Log every Request, Response, and Exception with Context, Timestamp, and Correlation ID
- **Frontend:** Use a structured logging service. Log UI events, API errors, and navigation changes

### Documentation
- Every class and public method must have a JSDoc/DartDoc comment explaining "Why" it exists, not just "What" it does
- Complex logic must have inline comments

---

## Architecture Patterns

### Backend (NestJS)
```
Controller → Service → Repository → Entity
```

### Flutter
```
UI → Controller (State) → Repository → DataSource → API
```

---

## Design Guidelines

*To be updated as guidelines are provided*

---

## API Guidelines

*To be updated as guidelines are provided*

---

*Last updated: 2026-01-18*
