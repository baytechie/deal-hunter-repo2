import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/auth/domain/entities/app_user.dart';

/// AuthService handles authentication operations and token management
///
/// Responsibilities:
/// - User registration and login
/// - Token storage and retrieval
/// - Auto-injection of auth headers
/// - Token refresh handling
class AuthService {
  final Dio dio;
  final FlutterSecureStorage _storage;
  static const String _logContext = 'AuthService';

  // Storage keys
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';

  AuthService({
    required this.dio,
    FlutterSecureStorage? storage,
  }) : _storage = storage ?? const FlutterSecureStorage();

  /// Register a new user with email and password
  Future<AuthResponse> register({
    required String email,
    required String password,
    String? displayName,
  }) async {
    logger.debug('Attempting registration for: $email', context: _logContext);

    try {
      final response = await dio.post(
        '/user-auth/register',
        data: {
          'email': email,
          'password': password,
          if (displayName != null) 'displayName': displayName,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(
          response.data as Map<String, dynamic>,
        );

        // Store tokens
        await _storeTokens(authResponse);

        logger.info(
          'Registration successful for: ${authResponse.user.email}',
          context: _logContext,
        );

        return authResponse;
      }

      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: 'Registration failed with status: ${response.statusCode}',
      );
    } on DioException catch (e) {
      logger.warning(
        'Registration failed: ${e.response?.data ?? e.message}',
        context: _logContext,
      );
      rethrow;
    }
  }

  /// Login with email and password
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    logger.debug('Attempting login for: $email', context: _logContext);

    try {
      final response = await dio.post(
        '/user-auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(
          response.data as Map<String, dynamic>,
        );

        // Store tokens
        await _storeTokens(authResponse);

        logger.info(
          'Login successful for: ${authResponse.user.email}',
          context: _logContext,
        );

        return authResponse;
      }

      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: 'Login failed with status: ${response.statusCode}',
      );
    } on DioException catch (e) {
      logger.warning(
        'Login failed: ${e.response?.data ?? e.message}',
        context: _logContext,
      );
      rethrow;
    }
  }

  /// Get current user profile
  Future<AppUser?> getCurrentUser() async {
    logger.debug('Fetching current user profile', context: _logContext);

    final token = await getAccessToken();
    if (token == null) {
      logger.debug('No access token found', context: _logContext);
      return null;
    }

    try {
      final response = await dio.get(
        '/user-auth/me',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final user = AppUser.fromJson(response.data as Map<String, dynamic>);
        logger.info('Current user fetched: ${user.email}', context: _logContext);
        return user;
      }

      return null;
    } on DioException catch (e) {
      logger.warning(
        'Failed to fetch current user: ${e.message}',
        context: _logContext,
      );

      // If unauthorized, clear tokens
      if (e.response?.statusCode == 401) {
        await logout();
      }

      return null;
    }
  }

  /// Refresh access token using refresh token
  Future<AuthResponse?> refreshToken() async {
    logger.debug('Attempting token refresh', context: _logContext);

    final refreshToken = await getRefreshToken();
    if (refreshToken == null) {
      logger.debug('No refresh token found', context: _logContext);
      return null;
    }

    try {
      final response = await dio.post(
        '/user-auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(
          response.data as Map<String, dynamic>,
        );

        // Store new tokens
        await _storeTokens(authResponse);

        logger.info('Token refresh successful', context: _logContext);
        return authResponse;
      }

      return null;
    } on DioException catch (e) {
      logger.warning(
        'Token refresh failed: ${e.message}',
        context: _logContext,
      );

      // Clear tokens if refresh fails
      await logout();
      return null;
    }
  }

  /// Logout and clear all stored tokens
  Future<void> logout() async {
    logger.debug('Logging out user', context: _logContext);

    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userIdKey);

    logger.info('User logged out successfully', context: _logContext);
  }

  /// Get stored access token
  Future<String?> getAccessToken() async {
    return _storage.read(key: _accessTokenKey);
  }

  /// Get stored refresh token
  Future<String?> getRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  /// Check if user is logged in (has valid token)
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  /// Store tokens after successful auth
  Future<void> _storeTokens(AuthResponse authResponse) async {
    await _storage.write(key: _accessTokenKey, value: authResponse.accessToken);
    await _storage.write(
      key: _refreshTokenKey,
      value: authResponse.refreshToken,
    );
    await _storage.write(key: _userIdKey, value: authResponse.user.id);

    logger.debug('Tokens stored securely', context: _logContext);
  }

  /// Get error message from DioException
  static String getErrorMessage(DioException e) {
    if (e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map<String, dynamic>) {
        return data['message'] as String? ?? 'An error occurred';
      }
    }

    switch (e.response?.statusCode) {
      case 401:
        return 'Invalid email or password';
      case 409:
        return 'An account with this email already exists';
      case 400:
        return 'Please check your input and try again';
      default:
        return 'Connection error. Please try again.';
    }
  }
}
