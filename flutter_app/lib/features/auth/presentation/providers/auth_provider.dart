import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/auth/data/services/auth_service.dart';
import 'package:money_saver_deals/features/auth/domain/entities/app_user.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';

/// Auth state representing different authentication states
sealed class AuthState {
  const AuthState();
}

/// Initial state - checking if user is logged in
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// Loading state during login/register/logout operations
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// Authenticated state with user data
class AuthAuthenticated extends AuthState {
  final AppUser user;
  const AuthAuthenticated(this.user);
}

/// Unauthenticated state (not logged in)
class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// Error state when auth operation fails
class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

/// AuthNotifier manages authentication state
///
/// Handles:
/// - Login and registration
/// - Session persistence (auto-login)
/// - Logout
/// - Error handling
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService authService;
  static const String _logContext = 'AuthNotifier';

  AuthNotifier({required this.authService}) : super(const AuthInitial()) {
    // Check for existing session on init
    _checkAuthStatus();
  }

  /// Check if user has an existing session
  Future<void> _checkAuthStatus() async {
    logger.debug('Checking auth status', context: _logContext);

    final isLoggedIn = await authService.isLoggedIn();
    if (!isLoggedIn) {
      logger.debug('No existing session found', context: _logContext);
      state = const AuthUnauthenticated();
      return;
    }

    // Try to get current user
    final user = await authService.getCurrentUser();
    if (user != null) {
      logger.info('Existing session restored for: ${user.email}', context: _logContext);
      state = AuthAuthenticated(user);
    } else {
      logger.debug('Session expired or invalid', context: _logContext);
      state = const AuthUnauthenticated();
    }
  }

  /// Login with email and password
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    logger.debug('Login attempt for: $email', context: _logContext);
    state = const AuthLoading();

    try {
      final authResponse = await authService.login(
        email: email,
        password: password,
      );

      state = AuthAuthenticated(authResponse.user);
      logger.info('Login successful for: ${authResponse.user.email}', context: _logContext);
      return true;
    } on DioException catch (e) {
      final errorMessage = AuthService.getErrorMessage(e);
      logger.warning('Login failed: $errorMessage', context: _logContext);
      state = AuthError(errorMessage);
      return false;
    }
  }

  /// Register a new user
  Future<bool> register({
    required String email,
    required String password,
    String? displayName,
  }) async {
    logger.debug('Registration attempt for: $email', context: _logContext);
    state = const AuthLoading();

    try {
      final authResponse = await authService.register(
        email: email,
        password: password,
        displayName: displayName,
      );

      state = AuthAuthenticated(authResponse.user);
      logger.info('Registration successful for: ${authResponse.user.email}', context: _logContext);
      return true;
    } on DioException catch (e) {
      final errorMessage = AuthService.getErrorMessage(e);
      logger.warning('Registration failed: $errorMessage', context: _logContext);
      state = AuthError(errorMessage);
      return false;
    }
  }

  /// Sign in with Google OAuth
  Future<bool> signInWithGoogle() async {
    logger.debug('Google sign-in attempt', context: _logContext);
    state = const AuthLoading();

    try {
      final authResponse = await authService.signInWithGoogle();

      state = AuthAuthenticated(authResponse.user);
      logger.info('Google sign-in successful for: ${authResponse.user.email}', context: _logContext);
      return true;
    } on GoogleSignInCancelledException {
      // User cancelled - return to unauthenticated state without error
      logger.debug('Google sign-in cancelled by user', context: _logContext);
      state = const AuthUnauthenticated();
      return false;
    } on DioException catch (e) {
      final errorMessage = AuthService.getErrorMessage(e);
      logger.warning('Google sign-in failed: $errorMessage', context: _logContext);
      state = AuthError(errorMessage);
      return false;
    } catch (e) {
      logger.warning('Google sign-in error: $e', context: _logContext);
      state = const AuthError('Google sign-in failed. Please try again.');
      return false;
    }
  }

  /// Logout current user
  Future<void> logout() async {
    logger.debug('Logout requested', context: _logContext);
    state = const AuthLoading();

    await authService.logout();

    state = const AuthUnauthenticated();
    logger.info('Logout successful', context: _logContext);
  }

  /// Clear error and return to unauthenticated state
  void clearError() {
    if (state is AuthError) {
      state = const AuthUnauthenticated();
    }
  }

  /// Refresh user data
  Future<void> refreshUser() async {
    final user = await authService.getCurrentUser();
    if (user != null) {
      state = AuthAuthenticated(user);
    } else {
      state = const AuthUnauthenticated();
    }
  }
}

/// Provider for AuthService
final authServiceProvider = Provider<AuthService>((ref) {
  // Get the Dio instance from the API client provider
  final apiClient = ref.watch(apiClientProvider);
  return AuthService(dio: apiClient.dio);
});

/// Provider for API Client (needed by AuthService)
final apiClientProvider = Provider<ApiClient>((ref) {
  // Read base URL from environment or use default
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://dealhunter-api-x85h.onrender.com',
  );

  final dio = Dio();
  return ApiClient(dio: dio, baseUrl: baseUrl);
});

/// StateNotifier provider for auth state management
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService: authService);
});

/// Convenience provider to check if user is authenticated
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  return authState is AuthAuthenticated;
});

/// Convenience provider to get current user (null if not authenticated)
final currentUserProvider = Provider<AppUser?>((ref) {
  final authState = ref.watch(authProvider);
  return authState is AuthAuthenticated ? authState.user : null;
});
