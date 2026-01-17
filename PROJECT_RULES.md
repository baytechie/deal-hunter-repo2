# Project: DealHunter Ecosystem
## Tech Stack
- **Mobile/PWA:** Flutter (Clean Architecture, Riverpod for state, Dio for HTTP).
- **Backend:** NestJS (TypeScript, TypeORM, PostgreSQL).
- **Admin Panel:** React (Vite, React-Admin).

## Coding Standards (Strict Enforcement)
1. **SOLID Principles:** Every class must have a single responsibility. Use Dependency Injection interfaces, not concrete implementations.
2. **Modularity:** Code must be separated into `Feature` modules (e.g., `AuthModule`, `DealsModule`).
3. **Logging:**
   - **Backend:** Use Winston or Pino. Log every Request, Response, and Exception with Context, Timestamp, and Correlation ID.
   - **Frontend:** Use a structured logging service. Log UI events, API errors, and navigation changes.
4. **Documentation:**
   - Every class and public method must have a JSDoc/DartDoc comment explaining "Why" it exists, not just "What" it does.
   - Complex logic must have inline comments.

## Architecture Patterns
- **Backend:** Controller -> Service -> Repository -> Entity.
- **Flutter:** UI -> Controller (State) -> Repository -> Data** Source -> API.