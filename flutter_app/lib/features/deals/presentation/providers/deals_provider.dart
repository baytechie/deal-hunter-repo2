import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/deals/domain/repositories/deals_repository.dart';

/// State representing different UI states for deals loading
///
/// Why: Provides a type-safe way to represent the different states
/// the UI can be in: loading data, successfully loaded, or failed.
/// Using a sealed class ensures all states are handled.
sealed class DealsState {
  const DealsState();
}

/// Initial state before any data is loaded
class DealsInitial extends DealsState {
  const DealsInitial();
}

/// Loading state while fetching deals (initial load)
class DealsLoading extends DealsState {
  const DealsLoading();
}

/// Success state with loaded deals data and pagination info
///
/// Supports infinite scroll by tracking:
/// - Current page number
/// - Whether more deals are available
/// - Whether currently loading more
class DealsSuccess extends DealsState {
  /// List of deals that were successfully loaded
  final List<Deal> deals;

  /// Current page number (1-indexed)
  final int currentPage;

  /// Whether there are more deals to load
  final bool hasMore;

  /// Whether currently loading more deals (for infinite scroll)
  final bool isLoadingMore;

  /// Error message if load more failed (null if no error)
  final String? loadMoreError;

  const DealsSuccess(
    this.deals, {
    this.currentPage = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
    this.loadMoreError,
  });

  /// Create a copy with updated values
  DealsSuccess copyWith({
    List<Deal>? deals,
    int? currentPage,
    bool? hasMore,
    bool? isLoadingMore,
    String? loadMoreError,
  }) {
    return DealsSuccess(
      deals ?? this.deals,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      loadMoreError: loadMoreError,
    );
  }
}

/// Error state when loading deals fails
class DealsError extends DealsState {
  /// Error message describing what went wrong
  final String message;

  const DealsError(this.message);
}

/// StateNotifier for managing deals state with infinite scroll support
///
/// SOLID Principles:
/// - Single Responsibility: Only manages deals state and fetching
/// - Dependency Inversion: Uses DealsRepository interface
///
/// Why: StateNotifier encapsulates all business logic for fetching
/// and managing deals state. It:
/// - Handles loading, success, and error states
/// - Supports pagination for infinite scroll
/// - Prevents duplicate deals when loading more
/// - Triggers state changes based on user actions
/// - Includes comprehensive logging via LoggingService for debugging
class DealsNotifier extends StateNotifier<DealsState> {
  /// Repository for fetching deals data
  final DealsRepository repository;

  /// Default number of items per page
  static const int _pageSize = 10;

  /// Context identifier for logging
  static const String _logContext = 'DealsNotifier';

  /// Track current filter parameters for load more
  String? _currentCategory;
  bool? _currentIsHot;

  /// Constructor with initial state and repository
  DealsNotifier({
    required this.repository,
  }) : super(const DealsInitial()) {
    logger.debug('DealsNotifier initialized', context: _logContext);
  }

  /// Fetch all deals with optional filtering (resets pagination)
  ///
  /// Parameters:
  /// - [page]: Page number for pagination (default: 1)
  /// - [limit]: Items per page (default: 10)
  /// - [category]: Optional category filter
  /// - [isHot]: Optional filter for hot deals
  ///
  /// State transitions:
  /// 1. DealsLoading -> fetching from repository
  /// 2. DealsSuccess -> if successful
  /// 3. DealsError -> if error occurs
  Future<void> fetchAllDeals({
    int page = 1,
    int limit = _pageSize,
    String? category,
    bool? isHot,
  }) async {
    logger.debug(
      'fetchAllDeals called: page=$page, limit=$limit, category=$category, isHot=$isHot',
      context: _logContext,
    );

    // Store current filter parameters for load more
    _currentCategory = category;
    _currentIsHot = isHot;

    // Transition to loading state
    state = const DealsLoading();
    logger.debug('State changed to: DealsLoading', context: _logContext);

    // Fetch deals from repository
    final result = await repository.getAllDeals(
      page: page,
      limit: limit,
      category: category,
      isHot: isHot,
    );

    // Handle result and transition to success or error state
    result.when(
      success: (deals) {
        logger.info(
          'fetchAllDeals succeeded: loaded ${deals.length} deals',
          context: _logContext,
        );
        // Determine if there are more deals to load
        final hasMore = deals.length >= limit;
        state = DealsSuccess(
          deals,
          currentPage: page,
          hasMore: hasMore,
          isLoadingMore: false,
        );
        logger.debug(
          'State changed to: DealsSuccess(${deals.length} deals, page=$page, hasMore=$hasMore)',
          context: _logContext,
        );
      },
      failure: (error) {
        logger.warning(
          'fetchAllDeals failed with error: $error',
          context: _logContext,
        );
        state = DealsError(error);
        logger.debug('State changed to: DealsError($error)', context: _logContext);
      },
    );
  }

  /// Load more deals for infinite scroll
  ///
  /// Why: Appends new deals to existing list without duplicates.
  /// Uses current filter parameters to maintain consistency.
  ///
  /// State transitions:
  /// 1. DealsSuccess(isLoadingMore: true) -> fetching more
  /// 2. DealsSuccess(new deals appended) -> if successful
  /// 3. DealsSuccess(loadMoreError set) -> if error occurs
  Future<void> loadMoreDeals() async {
    final currentState = state;

    // Only load more if we're in success state and not already loading
    if (currentState is! DealsSuccess) {
      logger.debug('loadMoreDeals skipped: not in success state', context: _logContext);
      return;
    }

    if (currentState.isLoadingMore) {
      logger.debug('loadMoreDeals skipped: already loading more', context: _logContext);
      return;
    }

    if (!currentState.hasMore) {
      logger.debug('loadMoreDeals skipped: no more deals to load', context: _logContext);
      return;
    }

    final nextPage = currentState.currentPage + 1;
    logger.debug(
      'loadMoreDeals called: loading page $nextPage, category=$_currentCategory, isHot=$_currentIsHot',
      context: _logContext,
    );

    // Set loading more state
    state = currentState.copyWith(isLoadingMore: true, loadMoreError: null);
    logger.debug('State changed to: DealsSuccess(isLoadingMore: true)', context: _logContext);

    // Fetch next page
    final result = await repository.getAllDeals(
      page: nextPage,
      limit: _pageSize,
      category: _currentCategory,
      isHot: _currentIsHot,
    );

    result.when(
      success: (newDeals) {
        logger.info(
          'loadMoreDeals succeeded: loaded ${newDeals.length} more deals',
          context: _logContext,
        );

        // Get existing deal IDs to prevent duplicates
        final existingIds = currentState.deals.map((d) => d.id).toSet();

        // Filter out duplicates
        final uniqueNewDeals = newDeals.where((d) => !existingIds.contains(d.id)).toList();
        logger.debug(
          'After deduplication: ${uniqueNewDeals.length} unique deals',
          context: _logContext,
        );

        // Combine existing and new deals
        final allDeals = [...currentState.deals, ...uniqueNewDeals];

        // Determine if there are more deals
        final hasMore = newDeals.length >= _pageSize;

        state = DealsSuccess(
          allDeals,
          currentPage: nextPage,
          hasMore: hasMore,
          isLoadingMore: false,
        );
        logger.debug(
          'State changed to: DealsSuccess(${allDeals.length} total deals, page=$nextPage, hasMore=$hasMore)',
          context: _logContext,
        );
      },
      failure: (error) {
        logger.warning(
          'loadMoreDeals failed with error: $error',
          context: _logContext,
        );
        // Keep existing deals but show error
        state = currentState.copyWith(
          isLoadingMore: false,
          loadMoreError: error,
        );
        logger.debug(
          'State changed to: DealsSuccess(loadMoreError: $error)',
          context: _logContext,
        );
      },
    );
  }

  /// Fetch top deals sorted by discount percentage
  ///
  /// Parameters:
  /// - [limit]: Maximum deals to return (default: 10)
  ///
  /// State transitions: DealsLoading -> DealsSuccess or DealsError
  ///
  /// Note: Top deals endpoint does not support pagination
  Future<void> fetchTopDeals({int limit = 10}) async {
    logger.debug('fetchTopDeals called: limit=$limit', context: _logContext);

    // Clear filter parameters since this is a different fetch type
    _currentCategory = null;
    _currentIsHot = null;

    state = const DealsLoading();
    logger.debug('State changed to: DealsLoading', context: _logContext);

    final result = await repository.getTopDeals(limit: limit);

    result.when(
      success: (deals) {
        logger.info(
          'fetchTopDeals succeeded: loaded ${deals.length} deals',
          context: _logContext,
        );
        state = DealsSuccess(
          deals,
          currentPage: 1,
          hasMore: false, // Top deals endpoint doesn't support pagination
          isLoadingMore: false,
        );
        logger.debug(
          'State changed to: DealsSuccess(${deals.length} deals)',
          context: _logContext,
        );
      },
      failure: (error) {
        logger.warning(
          'fetchTopDeals failed with error: $error',
          context: _logContext,
        );
        state = DealsError(error);
        logger.debug('State changed to: DealsError($error)', context: _logContext);
      },
    );
  }

  /// Fetch hot/trending deals
  ///
  /// Parameters:
  /// - [limit]: Maximum deals to return (default: 10)
  ///
  /// State transitions: DealsLoading -> DealsSuccess or DealsError
  ///
  /// Note: Hot deals endpoint does not support pagination
  Future<void> fetchHotDeals({int limit = 10}) async {
    logger.debug('fetchHotDeals called: limit=$limit', context: _logContext);

    // Clear filter parameters since this is a different fetch type
    _currentCategory = null;
    _currentIsHot = null;

    state = const DealsLoading();
    logger.debug('State changed to: DealsLoading', context: _logContext);

    final result = await repository.getHotDeals(limit: limit);

    result.when(
      success: (deals) {
        logger.info(
          'fetchHotDeals succeeded: loaded ${deals.length} deals',
          context: _logContext,
        );
        state = DealsSuccess(
          deals,
          currentPage: 1,
          hasMore: false, // Hot deals endpoint doesn't support pagination
          isLoadingMore: false,
        );
        logger.debug(
          'State changed to: DealsSuccess(${deals.length} deals)',
          context: _logContext,
        );
      },
      failure: (error) {
        logger.warning(
          'fetchHotDeals failed with error: $error',
          context: _logContext,
        );
        state = DealsError(error);
        logger.debug('State changed to: DealsError($error)', context: _logContext);
      },
    );
  }

  /// Fetch featured deals
  ///
  /// Parameters:
  /// - [limit]: Maximum deals to return (default: 10)
  ///
  /// State transitions: DealsLoading -> DealsSuccess or DealsError
  ///
  /// Note: Featured deals endpoint does not support pagination
  Future<void> fetchFeaturedDeals({int limit = 10}) async {
    logger.debug('fetchFeaturedDeals called: limit=$limit', context: _logContext);

    // Clear filter parameters since this is a different fetch type
    _currentCategory = null;
    _currentIsHot = null;

    state = const DealsLoading();
    logger.debug('State changed to: DealsLoading', context: _logContext);

    final result = await repository.getFeaturedDeals(limit: limit);

    result.when(
      success: (deals) {
        logger.info(
          'fetchFeaturedDeals succeeded: loaded ${deals.length} deals',
          context: _logContext,
        );
        state = DealsSuccess(
          deals,
          currentPage: 1,
          hasMore: false, // Featured deals endpoint doesn't support pagination
          isLoadingMore: false,
        );
        logger.debug(
          'State changed to: DealsSuccess(${deals.length} deals)',
          context: _logContext,
        );
      },
      failure: (error) {
        logger.warning(
          'fetchFeaturedDeals failed with error: $error',
          context: _logContext,
        );
        state = DealsError(error);
        logger.debug('State changed to: DealsError($error)', context: _logContext);
      },
    );
  }

  /// Reset state to initial
  ///
  /// Useful for clearing cached data or resetting the feed
  void reset() {
    logger.debug('reset called', context: _logContext);
    _currentCategory = null;
    _currentIsHot = null;
    state = const DealsInitial();
    logger.debug('State changed to: DealsInitial', context: _logContext);
  }

  /// Clear current error state
  ///
  /// Returns to initial state
  void clearError() {
    logger.debug('clearError called', context: _logContext);
    if (state is DealsError) {
      state = const DealsInitial();
      logger.debug('State changed to: DealsInitial', context: _logContext);
    }
  }

  /// Clear load more error while keeping current deals
  void clearLoadMoreError() {
    logger.debug('clearLoadMoreError called', context: _logContext);
    final currentState = state;
    if (currentState is DealsSuccess && currentState.loadMoreError != null) {
      state = currentState.copyWith(loadMoreError: null);
      logger.debug('Load more error cleared', context: _logContext);
    }
  }
}

/// Riverpod provider for DealsRepository
///
/// This provider must be overridden in tests or initialization
/// to provide the concrete implementation.
final dealsRepositoryProvider = Provider<DealsRepository>((ref) {
  throw UnimplementedError('dealsRepositoryProvider must be overridden');
});

/// Riverpod StateNotifier provider for managing deals state
///
/// Why: Exposes the DealsNotifier through Riverpod so the UI can:
/// - Listen to state changes
/// - Call methods to trigger actions (fetchAllDeals, loadMoreDeals, etc.)
/// - Automatically rebuild when state changes
final dealsProvider = StateNotifierProvider<DealsNotifier, DealsState>((ref) {
  final repository = ref.watch(dealsRepositoryProvider);
  return DealsNotifier(repository: repository);
});
