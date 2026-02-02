import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';
import 'package:money_saver_deals/features/rss_feed/domain/repositories/rss_feed_repository.dart';
import 'package:money_saver_deals/features/rss_feed/data/repositories/rss_feed_repository_impl.dart';

/// Filter tabs for RSS feed deals (similar to Slickdeals)
enum RssFeedTab {
  forYou,
  frontpage,
  popular,
  hotDeals,
}

/// State for RSS feed deals list
sealed class RssFeedState {
  const RssFeedState();
}

class RssFeedInitial extends RssFeedState {
  const RssFeedInitial();
}

class RssFeedLoading extends RssFeedState {
  const RssFeedLoading();
}

class RssFeedSuccess extends RssFeedState {
  final List<RssFeedDeal> deals;
  final int currentPage;
  final bool hasMore;
  final bool isLoadingMore;
  final String? loadMoreError;
  final RssFeedTab currentTab;

  const RssFeedSuccess(
    this.deals, {
    this.currentPage = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
    this.loadMoreError,
    this.currentTab = RssFeedTab.forYou,
  });

  RssFeedSuccess copyWith({
    List<RssFeedDeal>? deals,
    int? currentPage,
    bool? hasMore,
    bool? isLoadingMore,
    String? loadMoreError,
    RssFeedTab? currentTab,
  }) {
    return RssFeedSuccess(
      deals ?? this.deals,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      loadMoreError: loadMoreError,
      currentTab: currentTab ?? this.currentTab,
    );
  }
}

class RssFeedError extends RssFeedState {
  final String message;
  const RssFeedError(this.message);
}

/// State for related deals (when a deal is selected)
sealed class RelatedDealsState {
  const RelatedDealsState();
}

class RelatedDealsInitial extends RelatedDealsState {
  const RelatedDealsInitial();
}

class RelatedDealsLoading extends RelatedDealsState {
  const RelatedDealsLoading();
}

class RelatedDealsSuccess extends RelatedDealsState {
  final RssFeedDeal selectedDeal;
  final List<RssFeedDeal> relatedDeals;
  final Map<String, List<RssFeedDeal>> dealsBySource;

  const RelatedDealsSuccess({
    required this.selectedDeal,
    required this.relatedDeals,
    required this.dealsBySource,
  });
}

class RelatedDealsError extends RelatedDealsState {
  final String message;
  const RelatedDealsError(this.message);
}

/// StateNotifier for managing RSS feed state
class RssFeedNotifier extends StateNotifier<RssFeedState> {
  final RssFeedRepositoryImpl repository;
  static const int _pageSize = 20;
  static const String _logContext = 'RssFeedNotifier';

  RssFeedTab _currentTab = RssFeedTab.forYou;
  String? _currentCategory;
  String? _currentStore;
  String? _currentSearch;

  RssFeedNotifier({required this.repository}) : super(const RssFeedInitial()) {
    logger.debug('RssFeedNotifier initialized', context: _logContext);
  }

  /// Fetch deals based on the selected tab
  Future<void> fetchDeals({RssFeedTab tab = RssFeedTab.forYou}) async {
    logger.debug('fetchDeals called: tab=$tab', context: _logContext);
    _currentTab = tab;

    state = const RssFeedLoading();

    switch (tab) {
      case RssFeedTab.forYou:
        await _fetchForYouDeals();
        break;
      case RssFeedTab.frontpage:
        await _fetchFrontpageDeals();
        break;
      case RssFeedTab.popular:
        await _fetchPopularDeals();
        break;
      case RssFeedTab.hotDeals:
        await _fetchHotDeals();
        break;
    }
  }

  Future<void> _fetchForYouDeals() async {
    final result = await repository.getDeals(
      page: 1,
      limit: _pageSize,
      category: _currentCategory,
      store: _currentStore,
      search: _currentSearch,
      sortField: 'publishedAt',
      sortOrder: 'DESC',
    );

    result.when(
      success: (deals) {
        logger.info('Loaded ${deals.length} deals for For You tab', context: _logContext);
        state = RssFeedSuccess(
          deals,
          currentPage: 1,
          hasMore: deals.length >= _pageSize,
          currentTab: RssFeedTab.forYou,
        );
      },
      failure: (error) {
        logger.warning('Failed to fetch For You deals: $error', context: _logContext);
        state = RssFeedError(error);
      },
    );
  }

  Future<void> _fetchFrontpageDeals() async {
    final result = await repository.getFeaturedDeals(limit: _pageSize);

    result.when(
      success: (deals) {
        logger.info('Loaded ${deals.length} frontpage deals', context: _logContext);
        state = RssFeedSuccess(
          deals,
          currentPage: 1,
          hasMore: false,
          currentTab: RssFeedTab.frontpage,
        );
      },
      failure: (error) {
        logger.warning('Failed to fetch frontpage deals: $error', context: _logContext);
        state = RssFeedError(error);
      },
    );
  }

  Future<void> _fetchPopularDeals() async {
    final result = await repository.getDeals(
      page: 1,
      limit: _pageSize,
      minDiscount: 30,
      sortField: 'viewCount',
      sortOrder: 'DESC',
    );

    result.when(
      success: (deals) {
        logger.info('Loaded ${deals.length} popular deals', context: _logContext);
        state = RssFeedSuccess(
          deals,
          currentPage: 1,
          hasMore: deals.length >= _pageSize,
          currentTab: RssFeedTab.popular,
        );
      },
      failure: (error) {
        logger.warning('Failed to fetch popular deals: $error', context: _logContext);
        state = RssFeedError(error);
      },
    );
  }

  Future<void> _fetchHotDeals() async {
    final result = await repository.getHotDeals(limit: _pageSize);

    result.when(
      success: (deals) {
        logger.info('Loaded ${deals.length} hot deals', context: _logContext);
        state = RssFeedSuccess(
          deals,
          currentPage: 1,
          hasMore: false,
          currentTab: RssFeedTab.hotDeals,
        );
      },
      failure: (error) {
        logger.warning('Failed to fetch hot deals: $error', context: _logContext);
        state = RssFeedError(error);
      },
    );
  }

  /// Load more deals for infinite scroll
  Future<void> loadMore() async {
    final currentState = state;
    if (currentState is! RssFeedSuccess) return;
    if (currentState.isLoadingMore || !currentState.hasMore) return;

    final nextPage = currentState.currentPage + 1;
    logger.debug('Loading more deals: page=$nextPage', context: _logContext);

    state = currentState.copyWith(isLoadingMore: true);

    final result = await repository.getDeals(
      page: nextPage,
      limit: _pageSize,
      category: _currentCategory,
      store: _currentStore,
      search: _currentSearch,
    );

    result.when(
      success: (newDeals) {
        final existingIds = currentState.deals.map((d) => d.id).toSet();
        final uniqueDeals = newDeals.where((d) => !existingIds.contains(d.id)).toList();
        final allDeals = [...currentState.deals, ...uniqueDeals];

        state = currentState.copyWith(
          deals: allDeals,
          currentPage: nextPage,
          hasMore: newDeals.length >= _pageSize,
          isLoadingMore: false,
        );
      },
      failure: (error) {
        state = currentState.copyWith(
          isLoadingMore: false,
          loadMoreError: error,
        );
      },
    );
  }

  /// Search deals
  Future<void> searchDeals(String query) async {
    _currentSearch = query.isEmpty ? null : query;
    await fetchDeals(tab: _currentTab);
  }

  /// Filter by category
  Future<void> filterByCategory(String? category) async {
    _currentCategory = category;
    await fetchDeals(tab: _currentTab);
  }

  /// Filter by store
  Future<void> filterByStore(String? store) async {
    _currentStore = store;
    await fetchDeals(tab: _currentTab);
  }

  /// Reset filters
  void resetFilters() {
    _currentCategory = null;
    _currentStore = null;
    _currentSearch = null;
  }

  /// Refresh deals
  Future<void> refresh() async {
    await fetchDeals(tab: _currentTab);
  }
}

/// StateNotifier for managing related deals state
class RelatedDealsNotifier extends StateNotifier<RelatedDealsState> {
  final RssFeedRepositoryImpl repository;
  static const String _logContext = 'RelatedDealsNotifier';

  RelatedDealsNotifier({required this.repository}) : super(const RelatedDealsInitial());

  /// Fetch related deals for a selected deal from all sources
  Future<void> fetchRelatedDeals(RssFeedDeal deal) async {
    logger.debug('Fetching related deals for: ${deal.title}', context: _logContext);
    state = const RelatedDealsLoading();

    // Extract search keywords from the deal title
    final searchTerms = _extractSearchTerms(deal.title);

    // Fetch related deals by category and search terms
    final result = await repository.getRelatedDeals(
      dealId: deal.id,
      category: deal.category,
      search: searchTerms,
      limit: 50,
    );

    result.when(
      success: (relatedDeals) {
        // Group deals by source
        final dealsBySource = <String, List<RssFeedDeal>>{};
        for (final relatedDeal in relatedDeals) {
          final sourceName = relatedDeal.source?.name ?? relatedDeal.store ?? 'Other Sources';
          dealsBySource.putIfAbsent(sourceName, () => []).add(relatedDeal);
        }

        logger.info(
          'Found ${relatedDeals.length} related deals from ${dealsBySource.length} sources',
          context: _logContext,
        );

        state = RelatedDealsSuccess(
          selectedDeal: deal,
          relatedDeals: relatedDeals,
          dealsBySource: dealsBySource,
        );
      },
      failure: (error) {
        logger.warning('Failed to fetch related deals: $error', context: _logContext);
        state = RelatedDealsError(error);
      },
    );
  }

  /// Extract meaningful search terms from deal title
  String _extractSearchTerms(String title) {
    // Remove common words and extract key product terms
    final stopWords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'};
    final words = title
        .toLowerCase()
        .replaceAll(RegExp(r'[^\w\s]'), '')
        .split(' ')
        .where((w) => w.length > 2 && !stopWords.contains(w))
        .take(3)
        .toList();
    return words.join(' ');
  }

  /// Record a click on a deal
  Future<void> recordClick(String dealId) async {
    await repository.recordClick(dealId);
  }

  /// Clear state
  void clear() {
    state = const RelatedDealsInitial();
  }
}

/// Provider for RssFeedRepository
final rssFeedRepositoryProvider = Provider<RssFeedRepositoryImpl>((ref) {
  throw UnimplementedError('rssFeedRepositoryProvider must be overridden');
});

/// Provider for RSS feed state
final rssFeedProvider = StateNotifierProvider<RssFeedNotifier, RssFeedState>((ref) {
  final repository = ref.watch(rssFeedRepositoryProvider);
  return RssFeedNotifier(repository: repository);
});

/// Provider for related deals state
final relatedDealsProvider = StateNotifierProvider<RelatedDealsNotifier, RelatedDealsState>((ref) {
  final repository = ref.watch(rssFeedRepositoryProvider);
  return RelatedDealsNotifier(repository: repository);
});

/// Provider for categories
final rssFeedCategoriesProvider = FutureProvider<List<String>>((ref) async {
  final repository = ref.watch(rssFeedRepositoryProvider);
  final result = await repository.getCategories();
  return result.when(
    success: (categories) => categories,
    failure: (_) => <String>[],
  );
});

/// Provider for stores
final rssFeedStoresProvider = FutureProvider<List<String>>((ref) async {
  final repository = ref.watch(rssFeedRepositoryProvider);
  final result = await repository.getStores();
  return result.when(
    success: (stores) => stores,
    failure: (_) => <String>[],
  );
});
