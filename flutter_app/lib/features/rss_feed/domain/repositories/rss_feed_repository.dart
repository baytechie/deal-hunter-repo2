import 'package:money_saver_deals/features/deals/domain/core/result.dart';
import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';

/// Filter type for RSS feed deals
enum RssFeedFilterType {
  forYou,
  frontpage,
  popular,
  hotDeals,
}

/// RSS Feed Repository Interface
///
/// Defines the contract for accessing RSS feed deal data.
/// Implementations can use different data sources (API, local cache, etc.)
abstract class RssFeedRepository {
  /// Get all RSS feed deals with pagination and filtering
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
  });

  /// Get hot/trending deals
  Future<Result<List<RssFeedDeal>>> getHotDeals({int limit = 10});

  /// Get featured deals
  Future<Result<List<RssFeedDeal>>> getFeaturedDeals({int limit = 10});

  /// Get a single deal by ID
  Future<Result<RssFeedDeal>> getDealById(String id);

  /// Record a click on a deal
  Future<Result<void>> recordClick(String dealId);

  /// Get all available categories
  Future<Result<List<String>>> getCategories();

  /// Get all available stores
  Future<Result<List<String>>> getStores();
}
