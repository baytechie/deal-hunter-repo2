import 'package:dio/dio.dart';
import 'package:money_saver_deals/features/rss_feed/data/models/rss_feed_deal_model.dart';

/// API Client for RSS Feed endpoints
class RssFeedApiClient {
  final Dio dio;
  final String baseUrl;

  RssFeedApiClient({
    required this.dio,
    required this.baseUrl,
  }) {
    dio.options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    );
  }

  /// Fetch RSS feed deals with pagination and filters
  Future<List<RssFeedDealModel>> getDeals({
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
    String? sourceId,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (category != null) 'category': category,
        if (store != null) 'store': store,
        if (search != null) 'search': search,
        if (isHot != null) 'isHot': isHot,
        if (isFeatured != null) 'isFeatured': isFeatured,
        if (minDiscount != null) 'minDiscount': minDiscount,
        if (sortField != null) 'sortField': sortField,
        if (sortOrder != null) 'sortOrder': sortOrder,
        if (sourceId != null) 'sourceId': sourceId,
      };

      final response = await dio.get('/rss-feeds/deals', queryParameters: queryParams);

      if (response.statusCode == 200) {
        final data = response.data;
        final dealsList = data is Map && data['data'] is List
            ? data['data']
            : data is List
                ? data
                : <dynamic>[];

        return (dealsList as List<dynamic>)
            .map((deal) => RssFeedDealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch hot RSS feed deals
  Future<List<RssFeedDealModel>> getHotDeals({int limit = 10}) async {
    try {
      final response = await dio.get(
        '/rss-feeds/deals/hot',
        queryParameters: {'limit': limit},
      );

      if (response.statusCode == 200) {
        final dealsList = response.data is List ? response.data : <dynamic>[];
        return (dealsList as List<dynamic>)
            .map((deal) => RssFeedDealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch featured RSS feed deals
  Future<List<RssFeedDealModel>> getFeaturedDeals({int limit = 10}) async {
    try {
      final response = await dio.get(
        '/rss-feeds/deals/featured',
        queryParameters: {'limit': limit},
      );

      if (response.statusCode == 200) {
        final dealsList = response.data is List ? response.data : <dynamic>[];
        return (dealsList as List<dynamic>)
            .map((deal) => RssFeedDealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch a single deal by ID
  Future<RssFeedDealModel?> getDealById(String id) async {
    try {
      final response = await dio.get('/rss-feeds/deals/$id');

      if (response.statusCode == 200) {
        return RssFeedDealModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      rethrow;
    }
  }

  /// Search for related deals across all sources
  /// Uses the deal title/category to find similar deals from multiple sources
  Future<List<RssFeedDealModel>> getRelatedDeals({
    required String dealId,
    String? category,
    String? search,
    int limit = 20,
  }) async {
    try {
      // Search for deals with similar keywords across all sources
      final queryParams = <String, dynamic>{
        'limit': limit,
        if (category != null) 'category': category,
        if (search != null) 'search': search,
        'sortField': 'publishedAt',
        'sortOrder': 'DESC',
      };

      final response = await dio.get('/rss-feeds/deals', queryParameters: queryParams);

      if (response.statusCode == 200) {
        final data = response.data;
        final dealsList = data is Map && data['data'] is List
            ? data['data']
            : data is List
                ? data
                : <dynamic>[];

        // Filter out the current deal from results
        return (dealsList as List<dynamic>)
            .map((deal) => RssFeedDealModel.fromJson(deal as Map<String, dynamic>))
            .where((deal) => deal.id != dealId)
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Record a click on a deal
  Future<void> recordClick(String dealId) async {
    try {
      await dio.post('/rss-feeds/deals/$dealId/click');
    } on DioException {
      // Silently fail for analytics
    }
  }

  /// Get all available categories
  Future<List<String>> getCategories() async {
    try {
      final response = await dio.get('/rss-feeds/deals/categories');

      if (response.statusCode == 200) {
        final categoriesList = response.data is List ? response.data : <dynamic>[];
        return (categoriesList as List<dynamic>).cast<String>();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Get all available stores
  Future<List<String>> getStores() async {
    try {
      final response = await dio.get('/rss-feeds/deals/stores');

      if (response.statusCode == 200) {
        final storesList = response.data is List ? response.data : <dynamic>[];
        return (storesList as List<dynamic>).cast<String>();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Get all RSS feed sources
  Future<List<Map<String, dynamic>>> getSources() async {
    try {
      final response = await dio.get('/rss-feeds/sources');

      if (response.statusCode == 200) {
        final sourcesList = response.data is List ? response.data : <dynamic>[];
        return (sourcesList as List<dynamic>).cast<Map<String, dynamic>>();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }
}
