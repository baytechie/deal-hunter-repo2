import 'package:flutter_riverpod/flutter_riverpod.dart';
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

/// Loading state while fetching deals
class DealsLoading extends DealsState {
  const DealsLoading();
}

/// Success state with loaded deals data
class DealsSuccess extends DealsState {
  /// List of deals that were successfully loaded
  final List<Deal> deals;

  const DealsSuccess(this.deals);
}

/// Error state when loading deals fails
class DealsError extends DealsState {
  /// Error message describing what went wrong
  final String message;

  const DealsError(this.message);
}

/// StateNotifier for managing deals state
/// 
/// SOLID Principles:
/// - Single Responsibility: Only manages deals state and fetching
/// - Dependency Inversion: Uses DealsRepository interface
/// 
/// Why: StateNotifier encapsulates all business logic for fetching
/// and managing deals state. It:
/// - Handles loading, success, and error states
/// - Triggers state changes based on user actions
/// - Includes comprehensive logging via debugPrint for debugging
class DealsNotifier extends StateNotifier<DealsState> {
  /// Repository for fetching deals data
  final DealsRepository repository;

  /// Constructor with initial state and repository
  DealsNotifier({
    required this.repository,
  }) : super(const DealsInitial()) {
    debugPrint('DealsNotifier initialized');
  }

  /// Fetch all deals with optional filtering
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
    int limit = 10,
    String? category,
    bool? isHot,
  }) async {
    debugPrint(
      'fetchAllDeals called: page=$page, limit=$limit, category=$category, isHot=$isHot',
    );

    // Transition to loading state
    state = const DealsLoading();
    debugPrint('State changed to: DealsLoading');

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
        debugPrint(
          'fetchAllDeals succeeded: loaded ${deals.length} deals',
        );
        state = DealsSuccess(deals);
        debugPrint('State changed to: DealsSuccess(${deals.length} deals)');
      },
      failure: (error) {
        debugPrint('fetchAllDeals failed with error: $error');
        state = DealsError(error);
        debugPrint('State changed to: DealsError($error)');
      },
    );
  }

  /// Fetch top deals sorted by discount percentage
  /// 
  /// Parameters:
  /// - [limit]: Maximum deals to return (default: 10)
  /// 
  /// State transitions: DealsLoading -> DealsSuccess or DealsError
  Future<void> fetchTopDeals({int limit = 10}) async {
    debugPrint('fetchTopDeals called: limit=$limit');

    state = const DealsLoading();
    debugPrint('State changed to: DealsLoading');

    final result = await repository.getTopDeals(limit: limit);

    result.when(
      success: (deals) {
        debugPrint('fetchTopDeals succeeded: loaded ${deals.length} deals');
        state = DealsSuccess(deals);
        debugPrint('State changed to: DealsSuccess(${deals.length} deals)');
      },
      failure: (error) {
        debugPrint('fetchTopDeals failed with error: $error');
        state = DealsError(error);
        debugPrint('State changed to: DealsError($error)');
      },
    );
  }

  /// Fetch hot/trending deals
  /// 
  /// Parameters:
  /// - [limit]: Maximum deals to return (default: 10)
  /// 
  /// State transitions: DealsLoading -> DealsSuccess or DealsError
  Future<void> fetchHotDeals({int limit = 10}) async {
    debugPrint('fetchHotDeals called: limit=$limit');

    state = const DealsLoading();
    debugPrint('State changed to: DealsLoading');

    final result = await repository.getHotDeals(limit: limit);

    result.when(
      success: (deals) {
        debugPrint('fetchHotDeals succeeded: loaded ${deals.length} deals');
        state = DealsSuccess(deals);
        debugPrint('State changed to: DealsSuccess(${deals.length} deals)');
      },
      failure: (error) {
        debugPrint('fetchHotDeals failed with error: $error');
        state = DealsError(error);
        debugPrint('State changed to: DealsError($error)');
      },
    );
  }

  /// Fetch featured deals
  /// 
  /// Parameters:
  /// - [limit]: Maximum deals to return (default: 10)
  /// 
  /// State transitions: DealsLoading -> DealsSuccess or DealsError
  Future<void> fetchFeaturedDeals({int limit = 10}) async {
    debugPrint('fetchFeaturedDeals called: limit=$limit');

    state = const DealsLoading();
    debugPrint('State changed to: DealsLoading');

    final result = await repository.getFeaturedDeals(limit: limit);

    result.when(
      success: (deals) {
        debugPrint('fetchFeaturedDeals succeeded: loaded ${deals.length} deals');
        state = DealsSuccess(deals);
        debugPrint('State changed to: DealsSuccess(${deals.length} deals)');
      },
      failure: (error) {
        debugPrint('fetchFeaturedDeals failed with error: $error');
        state = DealsError(error);
        debugPrint('State changed to: DealsError($error)');
      },
    );
  }

  /// Reset state to initial
  /// 
  /// Useful for clearing cached data or resetting the feed
  void reset() {
    debugPrint('reset called');
    state = const DealsInitial();
    debugPrint('State changed to: DealsInitial');
  }

  /// Clear current error state
  /// 
  /// Returns to initial state
  void clearError() {
    debugPrint('clearError called');
    if (state is DealsError) {
      state = const DealsInitial();
      debugPrint('State changed to: DealsInitial');
    }
  }

  /// Helper function for structured logging in StateNotifier
  /// 
  /// Format: [DealsNotifier] message
  /// This makes it easy to identify logs from this notifier in the console
  void debugPrint(String message) {
    // ignore: avoid_print
    print('[DealsNotifier] $message');
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
/// - Call methods to trigger actions (fetchAllDeals, etc.)
/// - Automatically rebuild when state changes
final dealsProvider = StateNotifierProvider<DealsNotifier, DealsState>((ref) {
  final repository = ref.watch(dealsRepositoryProvider);
  return DealsNotifier(repository: repository);
});
