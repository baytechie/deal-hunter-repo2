import 'package:flutter/foundation.dart';

/// Analytics event model for tracking user interactions
/// 
/// Why: Provides a structured way to log events to analytics services
/// (Firebase Analytics, Mixpanel, etc.) with consistent data.
class AnalyticsEvent {
  /// Event name (e.g., 'deal_link_launched', 'webview_opened')
  final String name;

  /// Event parameters for additional context
  final Map<String, dynamic> parameters;

  /// Timestamp when event occurred
  final DateTime timestamp;

  /// Constructor
  const AnalyticsEvent({
    required this.name,
    this.parameters = const {},
    required this.timestamp,
  });

  @override
  String toString() {
    return 'AnalyticsEvent(name: $name, params: $parameters, time: $timestamp)';
  }
}

/// Analytics Service for tracking user events
/// 
/// SOLID Principles:
/// - Single Responsibility: Only handles event logging
/// - Dependency Inversion: Can be replaced with different analytics provider
/// 
/// Why: Centralizes all analytics tracking. Makes it easy to:
/// - Switch analytics providers without changing other code
/// - Add custom tracking logic
/// - Filter/monitor analytics in development
/// - Maintain audit trail of user interactions
class AnalyticsService {
  /// List to store events (for development/testing)
  final List<AnalyticsEvent> _events = [];

  /// Whether analytics is enabled
  bool _isEnabled = true;

  /// Get all recorded events
  List<AnalyticsEvent> get events => List.unmodifiable(_events);

  /// Enable analytics tracking
  void enable() {
    _isEnabled = true;
    debugPrint('[AnalyticsService] Analytics enabled');
  }

  /// Disable analytics tracking
  void disable() {
    _isEnabled = false;
    debugPrint('[AnalyticsService] Analytics disabled');
  }

  /// Log an analytics event
  /// 
  /// Parameters:
  /// - [name]: Event name (e.g., 'deal_link_launched')
  /// - [parameters]: Optional key-value pairs for event context
  /// 
  /// Why: This method provides a clean interface for logging events.
  /// It can be extended to send data to external analytics services.
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    if (!_isEnabled) {
      debugPrint('[AnalyticsService] Analytics disabled, skipping event: $name');
      return;
    }

    final event = AnalyticsEvent(
      name: name,
      parameters: parameters ?? {},
      timestamp: DateTime.now(),
    );

    debugPrint('[AnalyticsService] Logging event: $event');

    // Store event locally (for debugging/testing)
    _events.add(event);

    // TODO: Send to external analytics service (Firebase, Mixpanel, etc.)
    // Example:
    // await _firebaseAnalytics.logEvent(
    //   name: name,
    //   parameters: parameters,
    // );
  }

  /// Log deal link launch event
  /// 
  /// Parameters:
  /// - [dealId]: The deal that was launched
  /// - [dealTitle]: The deal title
  /// - [url]: The URL being launched
  /// - [launchMethod]: How it was opened ('amazon_app', 'webview', 'browser')
  /// 
  /// Why: Provides a standardized way to track deal engagement
  Future<void> logDealLaunchEvent({
    required String dealId,
    required String dealTitle,
    required String url,
    required String launchMethod,
  }) async {
    await logEvent(
      name: 'deal_link_launched',
      parameters: {
        'deal_id': dealId,
        'deal_title': dealTitle,
        'url': url,
        'launch_method': launchMethod,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  /// Log WebView opened event
  /// 
  /// Parameters:
  /// - [url]: The URL opened in WebView
  /// - [reason]: Why WebView was used (e.g., 'amazon_app_not_installed')
  Future<void> logWebViewOpenedEvent({
    required String url,
    required String reason,
  }) async {
    await logEvent(
      name: 'webview_opened',
      parameters: {
        'url': url,
        'reason': reason,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  /// Log URL launch error
  /// 
  /// Parameters:
  /// - [dealId]: Deal ID that failed
  /// - [url]: The URL that failed to launch
  /// - [error]: Error message
  Future<void> logLaunchErrorEvent({
    required String dealId,
    required String url,
    required String error,
  }) async {
    await logEvent(
      name: 'deal_launch_failed',
      parameters: {
        'deal_id': dealId,
        'url': url,
        'error': error,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  /// Clear all recorded events (useful for testing)
  void clearEvents() {
    debugPrint('[AnalyticsService] Clearing ${_events.length} events');
    _events.clear();
  }
}
