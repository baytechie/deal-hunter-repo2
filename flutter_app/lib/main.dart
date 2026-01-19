import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/app_shell.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';
import 'package:money_saver_deals/features/deals/data/repositories/deals_repository_impl.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';

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

/// Application wrapper with Riverpod provider setup
void main() {
  WidgetsFlutterBinding.ensureInitialized();

  debugPrint('[main] Application starting');

  final baseUrl = getApiBaseUrl();
  debugPrint('[main] Using API base URL: $baseUrl');

  final dio = Dio();
  final apiClient = ApiClient(
    dio: dio,
    baseUrl: baseUrl,
  );
  final repository = DealsRepositoryImpl(apiClient: apiClient);

  runApp(
    ProviderScope(
      overrides: [
        dealsRepositoryProvider.overrideWithValue(repository),
      ],
      child: const MoneySaverDealsApp(),
    ),
  );

  debugPrint('[main] Application started successfully');
}

/// Main application widget
///
/// This is the entry point of the Flutter application.
/// It sets up:
/// - Theme configuration
/// - Riverpod provider scope
/// - Bottom navigation shell
class MoneySaverDealsApp extends StatelessWidget {
  const MoneySaverDealsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Deal Hunter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981), // Emerald Green
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF3F4F6), // Light Grey
      ),
      home: const AppShell(),
    );
  }
}
