import { Module, Global } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

/**
 * SharedModule provides common services and utilities
 * that can be used across the entire application.
 *
 * This module is marked as @Global() so LoggerService
 * is available everywhere without explicit imports.
 */
@Global()
@Module({
  providers: [
    LoggerService,
    {
      provide: AllExceptionsFilter,
      useFactory: (logger: LoggerService) => new AllExceptionsFilter(logger),
      inject: [LoggerService],
    },
  ],
  exports: [LoggerService, AllExceptionsFilter],
})
export class SharedModule {}
