import 'package:flutter/foundation.dart';

/// Log levels for categorizing log messages
///
/// Why: Provides granular control over which log messages are displayed.
/// Lower levels include higher levels (e.g., debug includes all levels).
enum LogLevel {
  /// Detailed debugging information (most verbose)
  debug,

  /// General informational messages
  info,

  /// Warning messages for potentially problematic situations
  warning,

  /// Error messages for failures and exceptions
  error,
}

/// Structured log entry containing all relevant information
///
/// Why: Provides a consistent format for log entries that can be
/// easily serialized, stored, or sent to external services.
class LogEntry {
  /// The severity level of this log entry
  final LogLevel level;

  /// The log message
  final String message;

  /// Optional context identifier (e.g., class name, feature name)
  final String? context;

  /// Timestamp when the log was created
  final DateTime timestamp;

  /// Optional error object
  final Object? error;

  /// Optional stack trace
  final StackTrace? stackTrace;

  /// Optional additional data
  final Map<String, dynamic>? data;

  const LogEntry({
    required this.level,
    required this.message,
    this.context,
    required this.timestamp,
    this.error,
    this.stackTrace,
    this.data,
  });

  @override
  String toString() {
    final buffer = StringBuffer();
    buffer.write('[${timestamp.toIso8601String()}]');
    buffer.write('[${level.name.toUpperCase()}]');
    if (context != null) {
      buffer.write('[$context]');
    }
    buffer.write(' $message');
    if (error != null) {
      buffer.write('\nError: $error');
    }
    if (stackTrace != null) {
      buffer.write('\nStackTrace: $stackTrace');
    }
    if (data != null && data!.isNotEmpty) {
      buffer.write('\nData: $data');
    }
    return buffer.toString();
  }

  /// Convert to JSON-serializable map for external reporting
  Map<String, dynamic> toJson() {
    return {
      'level': level.name,
      'message': message,
      if (context != null) 'context': context,
      'timestamp': timestamp.toIso8601String(),
      if (error != null) 'error': error.toString(),
      if (stackTrace != null) 'stackTrace': stackTrace.toString(),
      if (data != null) 'data': data,
    };
  }
}

/// Logging Service for centralized application logging
///
/// SOLID Principles:
/// - Single Responsibility: Only handles logging operations
/// - Open/Closed: Can be extended for different log handlers
/// - Dependency Inversion: Can be replaced with different implementations
///
/// Why: Centralizes all logging logic, providing:
/// - Conditional logging based on build mode (debug vs release)
/// - Consistent log formatting
/// - Log level filtering
/// - Easy integration with crash reporting services (Crashlytics, Sentry)
/// - Audit trail for debugging
class LoggingService {
  /// Singleton instance
  static final LoggingService _instance = LoggingService._internal();

  /// Factory constructor returns singleton
  factory LoggingService() => _instance;

  /// Private constructor for singleton
  LoggingService._internal();

  /// Minimum log level to display (defaults to debug in debug mode, warning in release)
  LogLevel _minimumLevel = kReleaseMode ? LogLevel.warning : LogLevel.debug;

  /// In-memory log buffer for recent logs (useful for debugging)
  final List<LogEntry> _logBuffer = [];

  /// Maximum number of logs to keep in buffer
  static const int _maxBufferSize = 100;

  /// Whether logging is enabled
  bool _isEnabled = true;

  /// Callback for external error reporting (e.g., Crashlytics)
  /// Set this to integrate with crash reporting services
  void Function(LogEntry entry)? onLogEntry;

  /// Callback specifically for error reporting
  /// Set this to integrate with crash reporting services like Crashlytics
  void Function(Object error, StackTrace? stackTrace)? onError;

  /// Get the current minimum log level
  LogLevel get minimumLevel => _minimumLevel;

  /// Set the minimum log level
  set minimumLevel(LogLevel level) {
    _minimumLevel = level;
    debug('Log level set to: ${level.name}', context: 'LoggingService');
  }

  /// Enable logging
  void enable() {
    _isEnabled = true;
  }

  /// Disable logging
  void disable() {
    _isEnabled = false;
  }

  /// Get recent logs from buffer
  List<LogEntry> getRecentLogs() => List.unmodifiable(_logBuffer);

  /// Clear the log buffer
  void clearBuffer() {
    _logBuffer.clear();
  }

  /// Check if a log level should be displayed
  bool _shouldLog(LogLevel level) {
    if (!_isEnabled) return false;
    return level.index >= _minimumLevel.index;
  }

  /// Internal method to process and output a log entry
  void _log(LogEntry entry) {
    // Add to buffer
    _logBuffer.add(entry);
    if (_logBuffer.length > _maxBufferSize) {
      _logBuffer.removeAt(0);
    }

    // Call external handler if set
    onLogEntry?.call(entry);

    // Only output to console if level meets threshold
    if (!_shouldLog(entry.level)) return;

    // In release mode, only output warnings and errors
    if (kReleaseMode && entry.level.index < LogLevel.warning.index) {
      return;
    }

    // Output to console using debugPrint for better handling of long messages
    // debugPrint throttles output to avoid dropped logs on Android
    debugPrint(entry.toString());
  }

  /// Log a debug message
  ///
  /// Use for detailed debugging information that is only useful during development.
  /// These messages are suppressed in release mode.
  void debug(
    String message, {
    String? context,
    Map<String, dynamic>? data,
  }) {
    // Skip debug logs entirely in release mode for performance
    if (kReleaseMode) return;

    _log(LogEntry(
      level: LogLevel.debug,
      message: message,
      context: context,
      timestamp: DateTime.now(),
      data: data,
    ));
  }

  /// Log an informational message
  ///
  /// Use for general operational information about application flow.
  /// These messages are suppressed in release mode.
  void info(
    String message, {
    String? context,
    Map<String, dynamic>? data,
  }) {
    // Skip info logs in release mode for performance
    if (kReleaseMode) return;

    _log(LogEntry(
      level: LogLevel.info,
      message: message,
      context: context,
      timestamp: DateTime.now(),
      data: data,
    ));
  }

  /// Log a warning message
  ///
  /// Use for potentially problematic situations that don't prevent operation.
  /// Warnings are shown in both debug and release modes.
  void warning(
    String message, {
    String? context,
    Object? error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    _log(LogEntry(
      level: LogLevel.warning,
      message: message,
      context: context,
      timestamp: DateTime.now(),
      error: error,
      stackTrace: stackTrace,
      data: data,
    ));
  }

  /// Log an error message
  ///
  /// Use for failures and exceptions that need attention.
  /// Errors are shown in both debug and release modes and reported to crash services.
  void error(
    String message, {
    String? context,
    Object? error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    final entry = LogEntry(
      level: LogLevel.error,
      message: message,
      context: context,
      timestamp: DateTime.now(),
      error: error,
      stackTrace: stackTrace,
      data: data,
    );

    _log(entry);

    // Report to external error tracking if handler is set
    if (error != null) {
      onError?.call(error, stackTrace);
    }
  }

  /// Log a Flutter framework error
  ///
  /// Why: Provides a standardized way to log Flutter framework errors
  /// that can be integrated with crash reporting services.
  void logFlutterError(FlutterErrorDetails details) {
    error(
      'Flutter framework error: ${details.exceptionAsString()}',
      context: 'FlutterError',
      error: details.exception,
      stackTrace: details.stack,
      data: {
        'library': details.library ?? 'unknown',
        'context': details.context?.toString(),
      },
    );
  }

  /// Log a platform/async error
  ///
  /// Why: Provides a standardized way to log platform dispatcher errors
  /// (async errors not caught by Flutter framework).
  void logPlatformError(Object error, StackTrace stackTrace) {
    this.error(
      'Platform/async error',
      context: 'PlatformDispatcher',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Log a zone error
  ///
  /// Why: Provides a standardized way to log errors caught by runZonedGuarded.
  void logZoneError(Object error, StackTrace stackTrace) {
    this.error(
      'Uncaught zone error',
      context: 'ZoneGuard',
      error: error,
      stackTrace: stackTrace,
    );
  }
}

/// Global logging service instance for easy access
///
/// Why: Provides a convenient way to access the logging service
/// without requiring dependency injection everywhere.
final logger = LoggingService();
