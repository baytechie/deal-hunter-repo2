import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform, TargetPlatform;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/app_shell.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';
import 'package:money_saver_deals/features/deals/data/repositories/deals_repository_impl.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';

/// Get the appropriate API base URL based on the platform
String getApiBaseUrl() {
  if (kIsWeb) {
    // Flutter Web can use localhost
    return 'http://localhost:3000';
  } else if (defaultTargetPlatform == TargetPlatform.android) {
    // Android emulator uses 10.0.2.2 as alias for host machine localhost
    return 'http://10.0.2.2:3000';
  } else if (defaultTargetPlatform == TargetPlatform.iOS) {
    // iOS simulator can use localhost directly
    return 'http://localhost:3000';
  } else {
    // For physical devices, use your computer's local network IP
    // Update this IP to match your computer's network IP
    return 'http://192.168.1.67:3000';
  }
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
