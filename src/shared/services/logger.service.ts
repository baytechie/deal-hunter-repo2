import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'money-saver-deals' },
      transports: [
        // Console transport with JSON formatting
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.json(),
          ),
        }),
        // File transport for errors
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.json(),
          ),
        }),
        // File transport for all logs
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  /**
   * Log a message at 'info' level
   * @param message - The message to log
   * @param context - Optional context/module name
   */
  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  /**
   * Log a message at 'error' level
   * @param message - The error message
   * @param trace - Optional stack trace
   * @param context - Optional context/module name
   */
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, {
      context,
      stack: trace,
    });
  }

  /**
   * Log a message at 'warn' level
   * @param message - The warning message
   * @param context - Optional context/module name
   */
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  /**
   * Log a message at 'debug' level
   * @param message - The debug message
   * @param context - Optional context/module name
   */
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  /**
   * Log a message at 'verbose' level
   * @param message - The verbose message
   * @param context - Optional context/module name
   */
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  /**
   * Log structured data with additional metadata
   * @param level - Log level
   * @param message - The message
   * @param meta - Additional metadata object
   */
  logWithMeta(level: string, message: string, meta: Record<string, any>): void {
    this.logger.log(level, message, meta);
  }
}
