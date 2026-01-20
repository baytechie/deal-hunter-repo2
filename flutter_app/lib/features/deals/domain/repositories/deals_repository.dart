import 'package:money_saver_deals/features/deals/domain/core/result.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// Abstract repository for deals data access
/// 
/// SOLID Principles:
/// - Dependency Inversion: Data layer implements this abstract class
/// - Interface Segregation: Only deals-related methods
/// - Single Responsibility: Only defines data access contracts
/// 
/// Why: This abstract class defines the contract that any implementation
/// must follow. It allows swapping implementations (e.g., from API to cache)
/// without changing the presentation layer.
abstract class DealsRepository {
  /// Fetch all deals with optional filters and pagination
  /// 
  /// Parameters:
  /// - [page]: Page number for pagination
  /// - [limit]: Number of results per page
  /// - [category]: Filter deals by category
  /// - [isHot]: Filter hot deals
  /// 
  /// Returns: Result containing list of deals or error message
  Future<Result<List<Deal>>> getAllDeals({
    int page = 1,
    int limit = 10,
    String? category,
    bool? isHot,
  });

  /// Fetch top deals sorted by discount percentage
  /// 
  /// Parameters:
  /// - [limit]: Maximum number of deals to return
  /// 
  /// Returns: Result containing list of top deals or error message
  Future<Result<List<Deal>>> getTopDeals({int limit = 10});

  /// Fetch hot/trending deals
  /// 
  /// Parameters:
  /// - [limit]: Maximum number of deals to return
  /// 
  /// Returns: Result containing list of hot deals or error message
  Future<Result<List<Deal>>> getHotDeals({int limit = 10});

  /// Fetch featured deals
  /// 
  /// Parameters:
  /// - [limit]: Maximum number of deals to return
  /// 
  /// Returns: Result containing list of featured deals or error message
  Future<Result<List<Deal>>> getFeaturedDeals({int limit = 10});

  /// Fetch a single deal by ID
  /// 
  /// Parameters:
  /// - [id]: The deal ID
  /// 
  /// Returns: Result containing the deal or error message
  Future<Result<Deal>> getDealById(String id);

  /// Fetch all available categories
  ///
  /// Returns: Result containing list of category strings or error message
  Future<Result<List<String>>> getCategories();

  /// Search for deals by query
  ///
  /// Parameters:
  /// - [query]: Search query string
  /// - [page]: Page number for pagination
  /// - [limit]: Number of results per page
  ///
  /// Returns: Result containing list of matching deals or error message
  Future<Result<List<Deal>>> searchDeals({
    required String query,
    int page = 1,
    int limit = 20,
  });
}
