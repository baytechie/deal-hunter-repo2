import 'package:dio/dio.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/deals/domain/core/result.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/deals/domain/repositories/deals_repository.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';

/// Concrete implementation of DealsRepository
///
/// SOLID Principles:
/// - Liskov Substitution: Can be used anywhere DealsRepository is expected
/// - Single Responsibility: Only handles data layer operations
/// - Dependency Inversion: Depends on ApiClient abstraction
///
/// Why: This implementation bridges the domain (business logic) and
/// data (API calls) layers. It translates API calls to domain entities
/// and handles error mapping with specific HTTP status code handling.
class DealsRepositoryImpl extends DealsRepository {
  /// API client for making HTTP requests
  final ApiClient apiClient;

  /// Context identifier for logging
  static const String _logContext = 'DealsRepository';

  /// Constructor with required ApiClient
  DealsRepositoryImpl({required this.apiClient});

  @override
  Future<Result<List<Deal>>> getAllDeals({
    int page = 1,
    int limit = 10,
    String? category,
    bool? isHot,
  }) async {
    try {
      logger.debug(
        'getAllDeals: page=$page, limit=$limit, category=$category, isHot=$isHot',
        context: _logContext,
      );

      final models = await apiClient.getDeals(
        page: page,
        limit: limit,
        category: category,
        isHot: isHot,
      );

      final deals = models.map((model) => model.toDomain()).toList();
      logger.debug('getAllDeals: fetched ${deals.length} deals', context: _logContext);
      return Success(deals);
    } catch (e, stackTrace) {
      final message = _mapExceptionToMessage(e);
      logger.warning(
        'getAllDeals failed: $message',
        context: _logContext,
        error: e,
        stackTrace: stackTrace,
      );
      return Failure(message);
    }
  }

  @override
  Future<Result<List<Deal>>> getTopDeals({int limit = 10}) async {
    try {
      logger.debug('getTopDeals: limit=$limit', context: _logContext);

      final models = await apiClient.getTopDeals(limit: limit);
      final deals = models.map((model) => model.toDomain()).toList();
      logger.debug('getTopDeals: fetched ${deals.length} deals', context: _logContext);
      return Success(deals);
    } catch (e, stackTrace) {
      final message = _mapExceptionToMessage(e);
      logger.warning(
        'getTopDeals failed: $message',
        context: _logContext,
        error: e,
        stackTrace: stackTrace,
      );
      return Failure(message);
    }
  }

  @override
  Future<Result<List<Deal>>> getHotDeals({int limit = 10}) async {
    try {
      logger.debug('getHotDeals: limit=$limit', context: _logContext);

      final models = await apiClient.getHotDeals(limit: limit);
      final deals = models.map((model) => model.toDomain()).toList();
      logger.debug('getHotDeals: fetched ${deals.length} deals', context: _logContext);
      return Success(deals);
    } catch (e, stackTrace) {
      final message = _mapExceptionToMessage(e);
      logger.warning(
        'getHotDeals failed: $message',
        context: _logContext,
        error: e,
        stackTrace: stackTrace,
      );
      return Failure(message);
    }
  }

  @override
  Future<Result<List<Deal>>> getFeaturedDeals({int limit = 10}) async {
    try {
      logger.debug('getFeaturedDeals: limit=$limit', context: _logContext);

      final models = await apiClient.getFeaturedDeals(limit: limit);
      final deals = models.map((model) => model.toDomain()).toList();
      logger.debug('getFeaturedDeals: fetched ${deals.length} deals', context: _logContext);
      return Success(deals);
    } catch (e, stackTrace) {
      final message = _mapExceptionToMessage(e);
      logger.warning(
        'getFeaturedDeals failed: $message',
        context: _logContext,
        error: e,
        stackTrace: stackTrace,
      );
      return Failure(message);
    }
  }

  @override
  Future<Result<Deal>> getDealById(String id) async {
    try {
      logger.debug('getDealById: id=$id', context: _logContext);

      final model = await apiClient.getDealById(id);
      if (model == null) {
        logger.warning('getDealById: deal not found for id=$id', context: _logContext);
        return const Failure('Deal not found');
      }
      logger.debug('getDealById: fetched deal successfully', context: _logContext);
      return Success(model.toDomain());
    } catch (e, stackTrace) {
      final message = _mapExceptionToMessage(e);
      logger.warning(
        'getDealById failed: $message',
        context: _logContext,
        error: e,
        stackTrace: stackTrace,
      );
      return Failure(message);
    }
  }

  @override
  Future<Result<List<String>>> getCategories() async {
    try {
      logger.debug('getCategories called', context: _logContext);

      final categories = await apiClient.getCategories();
      logger.debug('getCategories: fetched ${categories.length} categories', context: _logContext);
      return Success(categories);
    } catch (e, stackTrace) {
      final message = _mapExceptionToMessage(e);
      logger.warning(
        'getCategories failed: $message',
        context: _logContext,
        error: e,
        stackTrace: stackTrace,
      );
      return Failure(message);
    }
  }

  /// Map exceptions to user-friendly error messages
  ///
  /// Why: Centralizes error handling logic and provides
  /// consistent, user-friendly error messages across the app.
  ///
  /// Handles specific HTTP status codes:
  /// - 400: Bad Request - Invalid request parameters
  /// - 401: Unauthorized - Authentication required or token expired
  /// - 403: Forbidden - Access denied to the resource
  /// - 404: Not Found - The requested resource doesn't exist
  /// - 408: Request Timeout - Server took too long to respond
  /// - 429: Too Many Requests - Rate limiting in effect
  /// - 500-599: Server errors - Something went wrong on the server
  String _mapExceptionToMessage(dynamic exception) {
    // Handle Dio-specific exceptions with HTTP status codes
    if (exception is DioException) {
      logger.debug(
        'DioException type: ${exception.type}, statusCode: ${exception.response?.statusCode}',
        context: _logContext,
      );

      // Handle connection/timeout errors first
      switch (exception.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Request timed out. Please check your connection and try again.';

        case DioExceptionType.connectionError:
          return 'Network connection failed. Please check your internet connection.';

        case DioExceptionType.cancel:
          return 'Request was cancelled.';

        case DioExceptionType.badResponse:
          // Handle specific HTTP status codes
          final statusCode = exception.response?.statusCode;
          if (statusCode != null) {
            return _mapStatusCodeToMessage(statusCode, exception.response?.data);
          }
          return 'Server returned an invalid response.';

        case DioExceptionType.badCertificate:
          return 'Security certificate error. Please try again later.';

        case DioExceptionType.unknown:
          // Check for common network issues
          final message = exception.message ?? '';
          if (message.contains('SocketException')) {
            return 'Network connection failed. Please check your internet connection.';
          }
          return 'An unexpected error occurred. Please try again.';
      }
    }

    // Handle generic exceptions
    if (exception is Exception) {
      final message = exception.toString();
      if (message.contains('SocketException')) {
        return 'Network connection failed. Please check your internet connection.';
      } else if (message.contains('TimeoutException')) {
        return 'Request timed out. Please try again.';
      }
    }

    return 'An error occurred while loading deals. Please try again.';
  }

  /// Map HTTP status codes to user-friendly messages
  ///
  /// Why: Provides specific, actionable error messages based on
  /// the HTTP status code to help users understand what went wrong.
  String _mapStatusCodeToMessage(int statusCode, dynamic responseData) {
    // Try to extract server error message if available
    String? serverMessage;
    if (responseData is Map<String, dynamic>) {
      serverMessage = responseData['message'] as String? ??
          responseData['error'] as String?;
    }

    switch (statusCode) {
      // Client errors (4xx)
      case 400:
        return serverMessage ?? 'Invalid request. Please try again.';

      case 401:
        logger.warning(
          'Unauthorized access - session may have expired',
          context: _logContext,
        );
        return 'Your session has expired. Please log in again.';

      case 403:
        logger.warning(
          'Forbidden access attempted',
          context: _logContext,
        );
        return 'You do not have permission to access this content.';

      case 404:
        return 'The requested content was not found.';

      case 408:
        return 'Request timed out. Please try again.';

      case 429:
        return 'Too many requests. Please wait a moment and try again.';

      // Server errors (5xx)
      case 500:
        logger.error(
          'Internal server error (500)',
          context: _logContext,
          data: {'responseData': responseData?.toString()},
        );
        return 'Server error. Our team has been notified. Please try again later.';

      case 501:
        return 'This feature is not yet available.';

      case 502:
        logger.error('Bad gateway error (502)', context: _logContext);
        return 'Server is temporarily unavailable. Please try again later.';

      case 503:
        logger.error('Service unavailable (503)', context: _logContext);
        return 'Service is temporarily unavailable for maintenance. Please try again later.';

      case 504:
        logger.error('Gateway timeout (504)', context: _logContext);
        return 'Server is taking too long to respond. Please try again later.';

      default:
        if (statusCode >= 500) {
          logger.error(
            'Server error ($statusCode)',
            context: _logContext,
            data: {'statusCode': statusCode},
          );
          return 'Server error occurred. Please try again later.';
        } else if (statusCode >= 400) {
          return serverMessage ?? 'Request failed. Please try again.';
        }
        return 'An unexpected error occurred.';
    }
  }
}
