import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:money_saver_deals/core/services/analytics_service.dart';

/// URL Launcher Service for handling deep links and external navigation
/// 
/// SOLID Principles:
/// - Single Responsibility: Only handles URL launching logic
/// - Dependency Inversion: Depends on url_launcher and AnalyticsService abstractions
/// 
/// Why: Centralizes all URL launching logic with:
/// - Amazon app detection and deep linking
/// - Graceful fallback to WebView if app unavailable
/// - Analytics tracking for all launches
/// - Error handling and user feedback
/// - Comprehensive logging for debugging
/// - Web platform support with new tab opening
class UrlLauncherService {
  /// Analytics service for tracking events
  final AnalyticsService analyticsService;

  /// Constructor with dependency injection
  UrlLauncherService({required this.analyticsService});

  /// Regular expression to detect Amazon URLs
  /// Matches: amazon.com, amazon.co.uk, amazon.de, etc.
  static final RegExp _amazonUrlRegex = RegExp(
    r'https?:\/\/(www\.)?amazon\.(com|co\.uk|de|fr|it|es|ca|in|mx|br|au|jp|cn)',
    caseSensitive: false,
  );

  /// Check if a URL is an Amazon link
  /// 
  /// Parameters:
  /// - [url]: The URL to check
  /// 
  /// Returns: true if URL is from Amazon domain
  bool isAmazonUrl(String url) {
    final isAmazon = _amazonUrlRegex.hasMatch(url);
    debugPrint('[UrlLauncherService] isAmazonUrl("$url"): $isAmazon');
    return isAmazon;
  }

  /// Extract ASIN (Amazon Standard Identification Number) from URL
  /// 
  /// Parameters:
  /// - [url]: The Amazon URL
  /// 
  /// Returns: ASIN if found, null otherwise
  /// 
  /// Why: Needed to create deep link to Amazon app with specific product
  String? _extractAsin(String url) {
    final asinRegex = RegExp(r'(?:\/dp\/|\/gp\/product\/|asin=)([A-Z0-9]{10})');
    final match = asinRegex.firstMatch(url);
    return match?.group(1);
  }

  /// Convert HTTP URL to Amazon app deep link
  /// 
  /// Parameters:
  /// - [url]: The HTTP Amazon URL
  /// 
  /// Returns: Amazon app deep link
  /// 
  /// Example: https://amazon.com/dp/B001234567 -> amazon://product/B001234567
  String _convertToAmazonDeepLink(String url) {
    final asin = _extractAsin(url);
    if (asin != null) {
      final deepLink = 'amazon://product/$asin';
      debugPrint('[UrlLauncherService] Converted "$url" to deep link: "$deepLink"');
      return deepLink;
    }
    debugPrint('[UrlLauncherService] Could not extract ASIN from: $url');
    return url;
  }

  /// Launch a deal URL with smart routing
  /// 
  /// Logic:
  /// 1. Log launch event to analytics
  /// 2. If on Web platform, open URL in new tab
  /// 3. If Amazon URL on mobile:
  ///    a. Try to open in Amazon app (external)
  ///    b. If app not installed, fall back to WebView
  /// 4. If not Amazon, open in WebView
  /// 5. If all fails, show error
  /// 
  /// Parameters:
  /// - [url]: The URL to launch
  /// - [dealId]: Deal ID for analytics tracking
  /// - [dealTitle]: Deal title for analytics tracking
  /// - [onWebViewRequired]: Callback when WebView is needed (for navigation)
  /// - [onError]: Callback when an error occurs
  /// 
  /// Returns: Future that completes when URL is launched
  Future<void> launchDeal({
    required String url,
    required String dealId,
    required String dealTitle,
    required Function(String) onWebViewRequired,
    required Function(String) onError,
  }) async {
    debugPrint(
      '[UrlLauncherService] launchDeal called: dealId=$dealId, url=$url',
    );

    try {
      // Log the launch event to analytics
      await analyticsService.logDealLaunchEvent(
        dealId: dealId,
        dealTitle: dealTitle,
        url: url,
        launchMethod: 'pending', // Will update based on actual method used
      );

      // On Web platform, simply open in a new tab
      if (kIsWeb) {
        debugPrint('[UrlLauncherService] Web platform detected, opening in new tab');
        
        final bool launched = await launchUrl(
          Uri.parse(url),
          webOnlyWindowName: '_blank',  // Open in new tab
        );

        if (launched) {
          debugPrint('[UrlLauncherService] Successfully opened URL in new tab');
          await analyticsService.logDealLaunchEvent(
            dealId: dealId,
            dealTitle: dealTitle,
            url: url,
            launchMethod: 'web_new_tab',
          );
          return;
        }

        debugPrint('[UrlLauncherService] Failed to open URL in new tab');
        onError('Failed to open deal. Please try again.');
        return;
      }

      // Check if it's an Amazon URL (mobile only logic below)
      if (isAmazonUrl(url)) {
        debugPrint('[UrlLauncherService] Amazon URL detected, attempting deep link');
        
        final deepLink = _convertToAmazonDeepLink(url);
        
        try {
          // Try to open in Amazon app using external app mode
          debugPrint('[UrlLauncherService] Attempting to launch Amazon app: $deepLink');
          
          final bool launched = await launchUrl(
            Uri.parse(deepLink),
            mode: LaunchMode.externalApplication,
          );

          if (launched) {
            debugPrint('[UrlLauncherService] Successfully launched Amazon app');
            
            // Log success
            await analyticsService.logDealLaunchEvent(
              dealId: dealId,
              dealTitle: dealTitle,
              url: url,
              launchMethod: 'amazon_app',
            );
            return;
          }

          debugPrint('[UrlLauncherService] Amazon app launch returned false');
        } catch (e) {
          debugPrint('[UrlLauncherService] Error launching Amazon app: $e');
        }

        // Fall back to WebView
        debugPrint('[UrlLauncherService] Amazon app not available, falling back to WebView');
        await analyticsService.logWebViewOpenedEvent(
          url: url,
          reason: 'amazon_app_not_installed',
        );
        onWebViewRequired(url);
        return;
      }

      // For non-Amazon URLs, try to open in default browser
      debugPrint('[UrlLauncherService] Non-Amazon URL, attempting browser launch');
      
      final bool launched = await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );

      if (launched) {
        debugPrint('[UrlLauncherService] Successfully launched in external browser');
        
        await analyticsService.logDealLaunchEvent(
          dealId: dealId,
          dealTitle: dealTitle,
          url: url,
          launchMethod: 'browser',
        );
        return;
      }

      // If browser launch fails, fall back to WebView
      debugPrint('[UrlLauncherService] Browser launch failed, falling back to WebView');
      await analyticsService.logWebViewOpenedEvent(
        url: url,
        reason: 'browser_launch_failed',
      );
      onWebViewRequired(url);
    } catch (e) {
      debugPrint('[UrlLauncherService] Unexpected error: $e');
      
      // Log error to analytics
      await analyticsService.logLaunchErrorEvent(
        dealId: dealId,
        url: url,
        error: e.toString(),
      );

      // Try WebView as last resort
      try {
        await analyticsService.logWebViewOpenedEvent(
          url: url,
          reason: 'error_fallback',
        );
        onWebViewRequired(url);
      } catch (webviewError) {
        debugPrint('[UrlLauncherService] WebView fallback also failed: $webviewError');
        onError('Failed to open deal. Please try again.');
      }
    }
  }

  /// Launch URL in external browser
  /// 
  /// Parameters:
  /// - [url]: The URL to launch
  /// 
  /// Returns: true if successful
  Future<bool> launchInBrowser(String url) async {
    debugPrint('[UrlLauncherService] launchInBrowser: $url');

    try {
      return await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );
    } catch (e) {
      debugPrint('[UrlLauncherService] Error launching in browser: $e');
      return false;
    }
  }

  /// Check if a URL can be launched
  /// 
  /// Parameters:
  /// - [url]: The URL to check
  /// 
  /// Returns: true if URL can be launched
  Future<bool> canLaunch(String url) async {
    debugPrint('[UrlLauncherService] Checking if can launch: $url');

    try {
      return await canLaunchUrl(Uri.parse(url));
    } catch (e) {
      debugPrint('[UrlLauncherService] Error checking if can launch: $e');
      return false;
    }
  }

  /// Close a previously opened URL
  /// 
  /// Currently, this is a placeholder for future implementation
  /// when deep linking might need to be undone.
  void closeUrl() {
    debugPrint('[UrlLauncherService] closeUrl called (currently no-op)');
  }
}
