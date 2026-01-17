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
/// and handles error mapping.
class DealsRepositoryImpl extends DealsRepository {
  /// API client for making HTTP requests
  final ApiClient apiClient;

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
      final models = await apiClient.getDeals(
        page: page,
        limit: limit,
        category: category,
        isHot: isHot,
      );

      final deals = models.map((model) => model.toDomain()).toList();
      return Success(deals);
    } catch (e) {
      return Failure(_mapExceptionToMessage(e));
    }
  }

  @override
  Future<Result<List<Deal>>> getTopDeals({int limit = 10}) async {
    try {
      final models = await apiClient.getTopDeals(limit: limit);
      final deals = models.map((model) => model.toDomain()).toList();
      return Success(deals);
    } catch (e) {
      return Failure(_mapExceptionToMessage(e));
    }
  }

  @override
  Future<Result<List<Deal>>> getHotDeals({int limit = 10}) async {
    try {
      final models = await apiClient.getHotDeals(limit: limit);
      final deals = models.map((model) => model.toDomain()).toList();
      return Success(deals);
    } catch (e) {
      return Failure(_mapExceptionToMessage(e));
    }
  }

  @override
  Future<Result<List<Deal>>> getFeaturedDeals({int limit = 10}) async {
    try {
      final models = await apiClient.getFeaturedDeals(limit: limit);
      final deals = models.map((model) => model.toDomain()).toList();
      return Success(deals);
    } catch (e) {
      return Failure(_mapExceptionToMessage(e));
    }
  }

  @override
  Future<Result<Deal>> getDealById(String id) async {
    try {
      final model = await apiClient.getDealById(id);
      if (model == null) {
        return Failure('Deal not found');
      }
      return Success(model.toDomain());
    } catch (e) {
      return Failure(_mapExceptionToMessage(e));
    }
  }

  @override
  Future<Result<List<String>>> getCategories() async {
    try {
      final categories = await apiClient.getCategories();
      return Success(categories);
    } catch (e) {
      return Failure(_mapExceptionToMessage(e));
    }
  }

  /// Map exceptions to user-friendly error messages
  /// 
  /// Why: Centralizes error handling logic and provides
  /// consistent error messages across the app
  String _mapExceptionToMessage(dynamic exception) {
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
}
