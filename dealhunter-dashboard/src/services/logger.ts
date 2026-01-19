/**
 * Logger Service for Admin Panel
 *
 * Provides structured logging with:
 * - Conditional logging based on environment
 * - Log levels (debug, info, warn, error)
 * - In-memory log storage for debugging
 * - Window exposure for browser console access
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

interface AdminLogger {
  getLogs: () => LogEntry[];
  getLogsByContext: (context: string) => LogEntry[];
  exportAsJson: () => string;
  clearLogs: () => void;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __adminLogger: AdminLogger;
  }
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private readonly isDevMode: boolean;
  private readonly minLogLevel: LogLevel;

  constructor() {
    this.isDevMode = import.meta.env.DEV;
    this.minLogLevel = this.isDevMode ? 'debug' : 'warn';
    this.exposeToWindow();
  }

  /**
   * Expose logger methods to window for browser console access
   */
  private exposeToWindow(): void {
    if (typeof window !== 'undefined') {
      window.__adminLogger = {
        getLogs: () => this.getLogs(),
        getLogsByContext: (context: string) => this.getLogsByContext(context),
        exportAsJson: () => this.exportAsJson(),
        clearLogs: () => this.clearLogs(),
      };
    }
  }

  /**
   * Check if the given log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLogLevel];
  }

  /**
   * Create a log entry and store it
   */
  private createEntry(level: LogLevel, context: string, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    };

    // Add to memory storage
    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return entry;
  }

  /**
   * Format and output log to console
   */
  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.context}]`;
    const consoleMethod = console[entry.level] || console.log;

    if (entry.data !== undefined) {
      consoleMethod(prefix, entry.message, entry.data);
    } else {
      consoleMethod(prefix, entry.message);
    }
  }

  /**
   * Log a debug message
   */
  debug(context: string, message: string, data?: unknown): void {
    const entry = this.createEntry('debug', context, message, data);
    if (this.shouldLog('debug')) {
      this.output(entry);
    }
  }

  /**
   * Log an info message
   */
  info(context: string, message: string, data?: unknown): void {
    const entry = this.createEntry('info', context, message, data);
    if (this.shouldLog('info')) {
      this.output(entry);
    }
  }

  /**
   * Log a warning message
   */
  warn(context: string, message: string, data?: unknown): void {
    const entry = this.createEntry('warn', context, message, data);
    if (this.shouldLog('warn')) {
      this.output(entry);
    }
  }

  /**
   * Log an error message
   */
  error(context: string, message: string, data?: unknown): void {
    const entry = this.createEntry('error', context, message, data);
    if (this.shouldLog('error')) {
      this.output(entry);
    }
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by context
   */
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter((log) => log.context === context);
  }

  /**
   * Export all logs as JSON string
   */
  exportAsJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Create a context-specific logger for easier usage in modules
 */
export function createContextLogger(context: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(context, message, data),
    info: (message: string, data?: unknown) => logger.info(context, message, data),
    warn: (message: string, data?: unknown) => logger.warn(context, message, data),
    error: (message: string, data?: unknown) => logger.error(context, message, data),
  };
}

export default logger;
