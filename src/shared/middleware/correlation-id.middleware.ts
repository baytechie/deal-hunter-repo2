import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage for correlation ID that persists across async operations.
 * Uses Node.js AsyncLocalStorage to maintain context throughout the request lifecycle.
 */
export const correlationStorage = new AsyncLocalStorage<{
  correlationId: string;
}>();

/**
 * Header name for the correlation ID.
 * Clients can pass their own correlation ID via this header.
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Helper function to get the current correlation ID from AsyncLocalStorage.
 * Returns undefined if called outside of a request context.
 */
export function getCorrelationId(): string | undefined {
  const store = correlationStorage.getStore();
  return store?.correlationId;
}

/**
 * Middleware that generates or extracts a correlation ID for each request.
 * The correlation ID is stored in AsyncLocalStorage for access throughout
 * the request lifecycle, including in services, repositories, and filters.
 *
 * If the client provides an X-Correlation-ID header, that value is used.
 * Otherwise, a new UUID v4 is generated.
 *
 * Note: The Express Request type is extended in src/shared/types/express.d.ts
 * to include the correlationId property.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Extract correlation ID from header or generate a new one
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER] as string) || uuidv4();

    // Attach to request object for easy access
    req.correlationId = correlationId;

    // Set response header so clients can track the correlation ID
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    // Run the rest of the request in the AsyncLocalStorage context
    correlationStorage.run({ correlationId }, () => {
      next();
    });
  }
}
