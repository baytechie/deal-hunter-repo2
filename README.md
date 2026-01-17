# Money Saver Deals API

A NestJS application with custom Winston-based logging and global exception handling.

## Features

- **Custom LoggerService**: Winston-based logger with JSON formatting and timestamps
- **AllExceptionsFilter**: Global exception filter that catches and logs all HTTP exceptions
- **SharedModule**: Global module providing common services across the application

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root application module
├── app.controller.ts                # Main controller
├── app.service.ts                   # Main service
└── shared/
    ├── index.ts                     # Shared module exports
    ├── shared.module.ts             # Global shared module
    ├── services/
    │   ├── index.ts
    │   └── logger.service.ts        # Winston-based logger service
    └── filters/
        ├── index.ts
        └── all-exceptions.filter.ts # Global exception filter
```

## Installation

```bash
npm install
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Logger Usage

The `LoggerService` is available globally and can be injected into any service or controller:

```typescript
import { LoggerService } from './shared/services/logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  doSomething() {
    this.logger.log('Info message', 'MyService');
    this.logger.debug('Debug message', 'MyService');
    this.logger.error('Error message', 'stack trace here', 'MyService');
  }
}
```

## Log Output Format

All logs are formatted as JSON with timestamps:

```json
{
  "level": "info",
  "message": "Application is running on: http://localhost:3000",
  "context": "Bootstrap",
  "service": "money-saver-deals",
  "timestamp": "2026-01-15 10:30:00.000"
}
```

## Log Files

- `logs/error.log` - Contains only error-level logs
- `logs/combined.log` - Contains all log levels

## Environment Variables

- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (default: debug)
