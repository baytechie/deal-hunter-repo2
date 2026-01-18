import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const transports: winston.transport[] = [
      // Console transport - always enabled
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          winston.format.json(),
        ),
      }),
    ];

    // Only add file transports in development (not on Render/production)
    if (!isProduction) {
      const logsDir = path.join(process.cwd(), 'logs');
      // Ensure logs directory exists
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.json(),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'money-saver-deals' },
      transports,
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
