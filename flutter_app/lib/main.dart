import 'dart:async';
import 'dart:ui';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/app_shell.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';
import 'package:money_saver_deals/features/deals/data/repositories/deals_repository_impl.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/notifications/data/repositories/notifications_repository_impl.dart';
import 'package:money_saver_deals/features/notifications/presentation/providers/notifications_provider.dart';

/// Get the appropriate API base URL based on the platform
String getApiBaseUrl() {
  // Check for compile-time environment variable (for production builds)
  const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');
  if (apiBaseUrl.isNotEmpty) {
    return apiBaseUrl;
  }

  // Default to production API for testing
  return 'https://api.huntdeals.app';
}

/// Initialize global error handlers
///
/// Why: Captures all uncaught errors in the application for logging
/// and crash reporting. This ensures no error goes unnoticed.
///
/// Three layers of error catching:
/// 1. FlutterError.onError - Catches Flutter framework errors (rendering, layout, etc.)
/// 2. PlatformDispatcher.instance.onError - Catches async errors from platform channels
/// 3. runZonedGuarded - Catches any remaining uncaught errors in the Dart zone
void _setupErrorHandlers() {
  // 1. Handle Flutter framework errors (widget build errors, layout errors, etc.)
  FlutterError.onError = (FlutterErrorDetails details) {
    logger.logFlutterError(details);

    // In debug mode, also print the error in the default way
    // for visibility in the console with full formatting
    FlutterError.presentError(details);
  };

  // 2. Handle platform dispatcher errors (async errors from platform channels)
  PlatformDispatcher.instance.onError = (Object error, StackTrace stackTrace) {
    logger.logPlatformError(error, stackTrace);

    // Return true to indicate the error was handled
    // Return false would crash the app in release mode
    return true;
  };
}

/// Application wrapper with Riverpod provider setup
void main() {
  // Use runZonedGuarded to catch any errors that slip through
  // the Flutter and Platform error handlers
  runZonedGuarded(
    () {
      // Ensure Flutter bindings are initialized before setting up error handlers
      WidgetsFlutterBinding.ensureInitialized();

      // Setup global error handlers
      _setupErrorHandlers();

      logger.info('Application starting', context: 'main');

      final baseUrl = getApiBaseUrl();
      logger.info('Using API base URL: $baseUrl', context: 'main');

      final dio = Dio();
      final apiClient = ApiClient(
        dio: dio,
        baseUrl: baseUrl,
      );
      final dealsRepository = DealsRepositoryImpl(apiClient: apiClient);
      final notificationsRepository = NotificationsRepositoryImpl(apiClient: apiClient);

      runApp(
        ProviderScope(
          overrides: [
            dealsRepositoryProvider.overrideWithValue(dealsRepository),
            notificationsRepositoryProvider.overrideWithValue(notificationsRepository),
          ],
          child: const MoneySaverDealsApp(),
        ),
      );

      logger.info('Application started successfully', context: 'main');
    },
    (Object error, StackTrace stackTrace) {
      // This catches any errors that were not caught by Flutter's error handlers
      logger.logZoneError(error, stackTrace);
    },
  );
}

/// Main application widget
///
/// This is the entry point of the Flutter application.
/// It sets up:
/// - Theme configuration with enhanced design system
/// - Riverpod provider scope
/// - Bottom navigation shell
class MoneySaverDealsApp extends StatelessWidget {
  const MoneySaverDealsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Deal Hunt',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const AppShell(),
    );
  }
}
