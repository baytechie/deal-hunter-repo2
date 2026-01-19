import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';

/**
 * Middleware that logs incoming HTTP requests and outgoing responses.
 *
 * Features:
 * - Logs request entry with method, URL, and correlation ID
 * - Logs response with status code and duration
 * - Tracks request timing for performance monitoring
 *
 * This middleware should be applied after CorrelationIdMiddleware
 * to ensure correlation IDs are available.
 */
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const correlationId = req.correlationId;

    // Log request entry
    this.logger.logWithMeta('info', 'Incoming request', {
      context: 'RequestLogging',
      correlationId,
      method,
      url: originalUrl,
      ip,
      userAgent,
    });

    // Capture response details when the request completes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;

      // Choose log level based on status code
      const level = this.getLogLevel(statusCode);

      this.logger.logWithMeta(level, 'Request completed', {
        context: 'RequestLogging',
        correlationId,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        contentLength,
        ip,
      });
    });

    // Handle connection errors/aborts
    res.on('close', () => {
      if (!res.writableFinished) {
        const duration = Date.now() - startTime;
        this.logger.logWithMeta('warn', 'Request aborted', {
          context: 'RequestLogging',
          correlationId,
          method,
          url: originalUrl,
          duration: `${duration}ms`,
          ip,
        });
      }
    });

    next();
  }

  /**
   * Determine appropriate log level based on HTTP status code.
   * @param statusCode - The HTTP status code
   * @returns The Winston log level to use
   */
  private getLogLevel(statusCode: number): string {
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  }
}
