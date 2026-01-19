import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { getCorrelationId } from '../middleware/correlation-id.middleware';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  correlationId?: string;
  stack?: string;
  data?: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;
  private readonly logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

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
   * Get the current correlation ID from AsyncLocalStorage.
   * Returns undefined if called outside of a request context.
   */
  getCorrelationId(): string | undefined {
    return getCorrelationId();
  }

  /**
   * Build common metadata including correlation ID.
   * This ensures all log entries include the correlation ID when available.
   */
  private buildMeta(context?: string): Record<string, unknown> {
    const correlationId = this.getCorrelationId();
    return {
      context,
      ...(correlationId && { correlationId }),
    };
  }

  /**
   * Store a log entry in memory for later retrieval
   */
  private storeLog(level: string, message: string, context?: string, stack?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      correlationId: this.getCorrelationId(),
      stack,
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }
  }

  /**
   * Get all stored logs with optional filtering
   */
  getLogs(options?: {
    level?: string;
    context?: string;
    search?: string;
    limit?: number;
  }): LogEntry[] {
    let result = [...this.logs];

    if (options?.level) {
      result = result.filter((log) => log.level === options.level);
    }

    if (options?.context) {
      result = result.filter((log) => log.context?.includes(options.context));
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.context?.toLowerCase().includes(searchLower),
      );
    }

    // Return most recent logs first
    result = result.reverse();

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs.length = 0;
  }

  /**
   * Log a message at 'info' level
   * @param message - The message to log
   * @param context - Optional context/module name
   */
  log(message: string, context?: string): void {
    this.storeLog('info', message, context);
    this.logger.info(message, this.buildMeta(context));
  }

  /**
   * Log a message at 'error' level
   * @param message - The error message
   * @param trace - Optional stack trace
   * @param context - Optional context/module name
   */
  error(message: string, trace?: string, context?: string): void {
    this.storeLog('error', message, context, trace);
    const meta = this.buildMeta(context);
    this.logger.error(message, {
      ...meta,
      stack: trace,
    });
  }

  /**
   * Log a message at 'warn' level
   * @param message - The warning message
   * @param context - Optional context/module name
   */
  warn(message: string, context?: string): void {
    this.storeLog('warn', message, context);
    this.logger.warn(message, this.buildMeta(context));
  }

  /**
   * Log a message at 'debug' level
   * @param message - The debug message
   * @param context - Optional context/module name
   */
  debug(message: string, context?: string): void {
    this.storeLog('debug', message, context);
    this.logger.debug(message, this.buildMeta(context));
  }

  /**
   * Log a message at 'verbose' level
   * @param message - The verbose message
   * @param context - Optional context/module name
   */
  verbose(message: string, context?: string): void {
    this.storeLog('verbose', message, context);
    this.logger.verbose(message, this.buildMeta(context));
  }

  /**
   * Log structured data with additional metadata.
   * Correlation ID is automatically included.
   * @param level - Log level
   * @param message - The message
   * @param meta - Additional metadata object
   */
  logWithMeta(level: string, message: string, meta: Record<string, unknown>): void {
    const correlationId = this.getCorrelationId();
    this.logger.log(level, message, {
      ...meta,
      ...(correlationId && { correlationId }),
    });
  }
}
