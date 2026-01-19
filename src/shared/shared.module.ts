import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';

/**
 * SharedModule provides common services and utilities
 * that can be used across the entire application.
 *
 * This module is marked as @Global() so LoggerService
 * is available everywhere without explicit imports.
 *
 * Middleware configuration:
 * - CorrelationIdMiddleware: Generates/extracts correlation IDs for request tracing
 * - RequestLoggingMiddleware: Logs request entry/exit with timing information
 */
@Global()
@Module({
  providers: [
    LoggerService,
    CorrelationIdMiddleware,
    RequestLoggingMiddleware,
    {
      provide: AllExceptionsFilter,
      useFactory: (logger: LoggerService) => new AllExceptionsFilter(logger),
      inject: [LoggerService],
    },
  ],
  exports: [
    LoggerService,
    AllExceptionsFilter,
    CorrelationIdMiddleware,
    RequestLoggingMiddleware,
  ],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply middleware to all routes
    // Order matters: CorrelationIdMiddleware must run first to set up the correlation ID
    // before RequestLoggingMiddleware uses it
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
