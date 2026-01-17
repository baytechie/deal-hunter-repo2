import 'package:dio/dio.dart';
import 'package:money_saver_deals/features/deals/data/models/deal_model.dart';

/// API Client for making HTTP requests to the backend
class ApiClient {
  final Dio dio;
  final String baseUrl;

  ApiClient({
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

  /// Fetch all deals with pagination and filters
  Future<List<DealModel>> getDeals({
    int page = 1,
    int limit = 10,
    String? category,
    bool? isHot,
  }) async {
    try {
      final queryParams = {
        'page': page,
        'limit': limit,
        if (category != null) 'category': category,
        if (isHot != null) 'isHot': isHot,
      };

      final response = await dio.get('/deals', queryParameters: queryParams);

      if (response.statusCode == 200) {
        final data = response.data;
        final dealsList = data is List
            ? data
            : data['data'] is List
                ? data['data']
                : <dynamic>[];

        return (dealsList as List<dynamic>)
            .map((deal) => DealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch top deals by discount percentage
  Future<List<DealModel>> getTopDeals({int limit = 10}) async {
    try {
      final response = await dio.get('/deals/top', queryParameters: {'limit': limit});

      if (response.statusCode == 200) {
        final dealsList = response.data is List ? response.data : <dynamic>[];
        return (dealsList as List<dynamic>)
            .map((deal) => DealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch hot/trending deals
  Future<List<DealModel>> getHotDeals({int limit = 10}) async {
    try {
      final response = await dio.get('/deals/hot', queryParameters: {'limit': limit});

      if (response.statusCode == 200) {
        final dealsList = response.data is List ? response.data : <dynamic>[];
        return (dealsList as List<dynamic>)
            .map((deal) => DealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch featured deals
  Future<List<DealModel>> getFeaturedDeals({int limit = 10}) async {
    try {
      final response = await dio.get('/deals/featured', queryParameters: {'limit': limit});

      if (response.statusCode == 200) {
        final dealsList = response.data is List ? response.data : <dynamic>[];
        return (dealsList as List<dynamic>)
            .map((deal) => DealModel.fromJson(deal as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }

  /// Fetch a single deal by ID
  Future<DealModel?> getDealById(String id) async {
    try {
      final response = await dio.get('/deals/$id');

      if (response.statusCode == 200) {
        return DealModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      rethrow;
    }
  }

  /// Fetch all available categories
  Future<List<String>> getCategories() async {
    try {
      final response = await dio.get('/deals/categories');

      if (response.statusCode == 200) {
        final categoriesList = response.data is List ? response.data : <dynamic>[];
        return (categoriesList as List<dynamic>).cast<String>();
      }
      return [];
    } on DioException {
      rethrow;
    }
  }
}
