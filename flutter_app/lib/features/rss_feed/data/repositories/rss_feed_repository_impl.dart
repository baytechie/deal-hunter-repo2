import 'package:dio/dio.dart';
import 'package:money_saver_deals/features/deals/domain/core/result.dart';
import 'package:money_saver_deals/features/rss_feed/data/datasources/rss_feed_api_client.dart';
import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';
import 'package:money_saver_deals/features/rss_feed/domain/repositories/rss_feed_repository.dart';

/// Concrete implementation of RssFeedRepository
///
/// Uses RssFeedApiClient to fetch data from the backend API.
class RssFeedRepositoryImpl implements RssFeedRepository {
  final RssFeedApiClient apiClient;

  RssFeedRepositoryImpl({required this.apiClient});

  @override
  Future<Result<List<RssFeedDeal>>> getDeals({
    int page = 1,
    int limit = 20,
    String? category,
    String? store,
    String? search,
    bool? isHot,
    bool? isFeatured,
    int? minDiscount,
    String? sortField,
    String? sortOrder,
  }) async {
    try {
      final models = await apiClient.getDeals(
        page: page,
        limit: limit,
        category: category,
        store: store,
        search: search,
        isHot: isHot,
        isFeatured: isFeatured,
        minDiscount: minDiscount,
        sortField: sortField,
        sortOrder: sortOrder,
      );
      return Success(models.map((m) => m.toDomain()).toList());
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  @override
  Future<Result<List<RssFeedDeal>>> getHotDeals({int limit = 10}) async {
    try {
      final models = await apiClient.getHotDeals(limit: limit);
      return Success(models.map((m) => m.toDomain()).toList());
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  @override
  Future<Result<List<RssFeedDeal>>> getFeaturedDeals({int limit = 10}) async {
    try {
      final models = await apiClient.getFeaturedDeals(limit: limit);
      return Success(models.map((m) => m.toDomain()).toList());
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  @override
  Future<Result<RssFeedDeal>> getDealById(String id) async {
    try {
      final model = await apiClient.getDealById(id);
      if (model == null) {
        return Failure('Deal not found');
      }
      return Success(model.toDomain());
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  /// Get related deals from multiple sources
  Future<Result<List<RssFeedDeal>>> getRelatedDeals({
    required String dealId,
    String? category,
    String? search,
    int limit = 20,
  }) async {
    try {
      final models = await apiClient.getRelatedDeals(
        dealId: dealId,
        category: category,
        search: search,
        limit: limit,
      );
      return Success(models.map((m) => m.toDomain()).toList());
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  @override
  Future<Result<void>> recordClick(String dealId) async {
    try {
      await apiClient.recordClick(dealId);
      return Success(null);
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  @override
  Future<Result<List<String>>> getCategories() async {
    try {
      final categories = await apiClient.getCategories();
      return Success(categories);
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  @override
  Future<Result<List<String>>> getStores() async {
    try {
      final stores = await apiClient.getStores();
      return Success(stores);
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure('An unexpected error occurred: $e');
    }
  }

  /// Map DioException to user-friendly error messages
  String _mapDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Please check your internet connection.';
      case DioExceptionType.connectionError:
        return 'Unable to connect to the server. Please check your internet connection.';
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 404) {
          return 'The requested resource was not found.';
        } else if (statusCode == 500) {
          return 'Server error. Please try again later.';
        }
        return 'Server returned an error: $statusCode';
      default:
        return 'An error occurred while fetching data.';
    }
  }
}
