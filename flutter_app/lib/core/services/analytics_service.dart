import 'package:flutter/foundation.dart';

// Conditional import: uses stub on mobile, web implementation on web
import 'analytics_service_stub.dart'
    if (dart.library.html) 'analytics_service_web.dart' as platform_analytics;

/// Analytics event model for tracking user interactions
///
/// Why: Provides a structured way to log events to analytics services
/// (Google Analytics 4) with consistent data.
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

/// Analytics Service for Google Analytics 4 tracking
///
/// SOLID Principles:
/// - Single Responsibility: Only handles event logging
/// - Dependency Inversion: Can be replaced with different analytics provider
///
/// Tracks:
/// - Page views (screen navigation)
/// - Custom events (deal clicks, saves, shares)
/// - E-commerce events (view item, purchase clicks)
class AnalyticsService {
  static final AnalyticsService _instance = AnalyticsService._internal();
  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

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

  /// Track a page/screen view
  void trackPageView(String pageName) {
    if (!_isEnabled) return;

    if (kIsWeb) {
      platform_analytics.trackPageViewJS(pageName);
    }
    debugPrint('[Analytics] Page view: $pageName');
  }

  /// Log an analytics event (sends to GA4)
  ///
  /// Parameters:
  /// - [name]: Event name (e.g., 'deal_link_launched')
  /// - [parameters]: Optional key-value pairs for event context
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

    // Send to Google Analytics 4 (web only)
    if (kIsWeb) {
      platform_analytics.trackEventJS(name, parameters);
    }
  }

  /// Track when user views a deal (flips card or taps)
  Future<void> trackViewDeal({
    required String dealId,
    required String dealTitle,
    required String retailer,
    required double price,
    String? category,
  }) async {
    await logEvent(
      name: 'view_deal',
      parameters: {
        'deal_id': dealId,
        'deal_title': dealTitle,
        'retailer': retailer,
        'price': price,
        'category': category ?? 'unknown',
      },
    );
  }

  /// Track when user clicks Buy/View Deal button
  Future<void> trackBuyClick({
    required String dealId,
    required String dealTitle,
    required String retailer,
    required double price,
    String? couponCode,
  }) async {
    await logEvent(
      name: 'buy_click',
      parameters: {
        'deal_id': dealId,
        'deal_title': dealTitle,
        'retailer': retailer,
        'price': price,
        'coupon_code': couponCode ?? '',
      },
    );
  }

  /// Track when user saves a deal
  Future<void> trackSaveDeal({
    required String dealId,
    required String dealTitle,
    required bool isSaved,
  }) async {
    await logEvent(
      name: isSaved ? 'save_deal' : 'unsave_deal',
      parameters: {
        'deal_id': dealId,
        'deal_title': dealTitle,
      },
    );
  }

  /// Track when user shares a deal
  Future<void> trackShareDeal({
    required String dealId,
    required String dealTitle,
    required String shareMethod,
  }) async {
    await logEvent(
      name: 'share_deal',
      parameters: {
        'deal_id': dealId,
        'deal_title': dealTitle,
        'share_method': shareMethod,
      },
    );
  }

  /// Track when user copies a coupon code
  Future<void> trackCopyCoupon({
    required String dealId,
    required String couponCode,
  }) async {
    await logEvent(
      name: 'copy_coupon',
      parameters: {
        'deal_id': dealId,
        'coupon_code': couponCode,
      },
    );
  }

  /// Track search queries
  Future<void> trackSearch(String query) async {
    await logEvent(
      name: 'search',
      parameters: {
        'search_term': query,
      },
    );
  }

  /// Track category filter
  Future<void> trackCategoryFilter(String category) async {
    await logEvent(
      name: 'filter_category',
      parameters: {
        'category': category,
      },
    );
  }

  /// Track user sign in
  Future<void> trackSignIn(String method) async {
    await logEvent(
      name: 'login',
      parameters: {
        'method': method,
      },
    );
  }

  /// Track user sign up
  Future<void> trackSignUp(String method) async {
    await logEvent(
      name: 'sign_up',
      parameters: {
        'method': method,
      },
    );
  }

  /// Log deal link launch event
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
      },
    );
  }

  /// Log WebView opened event
  Future<void> logWebViewOpenedEvent({
    required String url,
    required String reason,
  }) async {
    await logEvent(
      name: 'webview_opened',
      parameters: {
        'url': url,
        'reason': reason,
      },
    );
  }

  /// Log URL launch error
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
      },
    );
  }

  /// Clear all recorded events (useful for testing)
  void clearEvents() {
    debugPrint('[AnalyticsService] Clearing ${_events.length} events');
    _events.clear();
  }
}
