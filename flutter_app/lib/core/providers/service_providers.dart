import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/services/analytics_service.dart';
import 'package:money_saver_deals/core/services/url_launcher_service.dart';

/// Riverpod Provider for AnalyticsService
/// 
/// Creates a singleton instance of AnalyticsService that can be
/// injected across the app using Riverpod.
final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService();
});

/// Riverpod Provider for UrlLauncherService
/// 
/// Depends on AnalyticsService provider to inject analytics
/// tracking capabilities.
final urlLauncherServiceProvider = Provider<UrlLauncherService>((ref) {
  final analyticsService = ref.watch(analyticsServiceProvider);
  return UrlLauncherService(analyticsService: analyticsService);
});
