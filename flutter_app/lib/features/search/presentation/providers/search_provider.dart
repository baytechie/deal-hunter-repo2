import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/deals/domain/repositories/deals_repository.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/search/domain/entities/search_result.dart';

/// Search State - Represents the current state of search
sealed class SearchState {
  const SearchState();
}

/// Initial state before any search
class SearchInitial extends SearchState {
  const SearchInitial();
}

/// Loading state while searching
class SearchLoading extends SearchState {
  final String query;
  const SearchLoading(this.query);
}

/// Success state with search results
class SearchSuccess extends SearchState {
  final SearchResult result;
  final String? selectedCategory;

  const SearchSuccess(this.result, {this.selectedCategory});

  /// Get filtered deals based on selected category
  List<Deal> get filteredDeals {
    if (selectedCategory == null) return result.deals;
    return result.deals.where((d) => d.category == selectedCategory).toList();
  }

  SearchSuccess copyWith({
    SearchResult? result,
    String? selectedCategory,
    bool clearCategory = false,
  }) {
    return SearchSuccess(
      result ?? this.result,
      selectedCategory: clearCategory ? null : (selectedCategory ?? this.selectedCategory),
    );
  }
}

/// Error state when search fails
class SearchError extends SearchState {
  final String message;
  final String query;
  const SearchError(this.message, this.query);
}

/// Search Notifier - Manages search state and logic
class SearchNotifier extends StateNotifier<SearchState> {
  final DealsRepository repository;
  static const String _logContext = 'SearchNotifier';
  static const String _recentSearchesKey = 'recent_searches';
  static const int _maxRecentSearches = 10;

  Timer? _debounceTimer;
  final Duration _debounceDuration = const Duration(milliseconds: 300);

  SearchNotifier({required this.repository}) : super(const SearchInitial());

  /// Search for deals with debouncing
  void searchWithDebounce(String query) {
    _debounceTimer?.cancel();

    if (query.trim().length < 2) {
      state = const SearchInitial();
      return;
    }

    state = SearchLoading(query);

    _debounceTimer = Timer(_debounceDuration, () {
      _performSearch(query);
    });
  }

  /// Perform immediate search (for recent searches or suggestions)
  Future<void> search(String query) async {
    _debounceTimer?.cancel();

    if (query.trim().length < 2) {
      state = const SearchInitial();
      return;
    }

    state = SearchLoading(query);
    await _performSearch(query);
  }

  /// Internal search execution
  Future<void> _performSearch(String query) async {
    logger.debug('Searching for: $query', context: _logContext);

    final result = await repository.searchDeals(query: query);

    result.when(
      success: (deals) {
        logger.info(
          'Search completed: found ${deals.length} results for "$query"',
          context: _logContext,
        );

        // Calculate category counts
        final categoryCounts = <String, int>{};
        for (final deal in deals) {
          categoryCounts[deal.category] = (categoryCounts[deal.category] ?? 0) + 1;
        }

        final searchResult = SearchResult(
          query: query,
          deals: deals,
          totalCount: deals.length,
          categoryCounts: categoryCounts,
        );

        state = SearchSuccess(searchResult);

        // Save to recent searches
        _saveRecentSearch(query);
      },
      failure: (error) {
        logger.warning(
          'Search failed for "$query": $error',
          context: _logContext,
        );
        state = SearchError(error, query);
      },
    );
  }

  /// Set category filter
  void setCategory(String? category) {
    final currentState = state;
    if (currentState is SearchSuccess) {
      state = currentState.copyWith(
        selectedCategory: category,
        clearCategory: category == null,
      );
    }
  }

  /// Clear search and reset state
  void clearSearch() {
    _debounceTimer?.cancel();
    state = const SearchInitial();
  }

  /// Save search to recent searches
  Future<void> _saveRecentSearch(String query) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final searches = await getRecentSearches();

      // Remove if exists (to move to top)
      searches.removeWhere((s) => s.query.toLowerCase() == query.toLowerCase());

      // Add new search at the beginning
      searches.insert(
        0,
        RecentSearch(query: query, timestamp: DateTime.now()),
      );

      // Keep only max searches
      if (searches.length > _maxRecentSearches) {
        searches.removeLast();
      }

      // Save
      final jsonList = searches.map((s) => s.toJson()).toList();
      await prefs.setString(_recentSearchesKey, jsonEncode(jsonList));
    } catch (e) {
      logger.warning('Failed to save recent search: $e', context: _logContext);
    }
  }

  /// Get recent searches
  Future<List<RecentSearch>> getRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_recentSearchesKey);
      if (jsonString == null) return [];

      final jsonList = jsonDecode(jsonString) as List;
      return jsonList
          .map((json) => RecentSearch.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      logger.warning('Failed to get recent searches: $e', context: _logContext);
      return [];
    }
  }

  /// Clear all recent searches
  Future<void> clearRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_recentSearchesKey);
    } catch (e) {
      logger.warning('Failed to clear recent searches: $e', context: _logContext);
    }
  }

  /// Remove a single recent search
  Future<void> removeRecentSearch(String query) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final searches = await getRecentSearches();
      searches.removeWhere((s) => s.query == query);

      final jsonList = searches.map((s) => s.toJson()).toList();
      await prefs.setString(_recentSearchesKey, jsonEncode(jsonList));
    } catch (e) {
      logger.warning('Failed to remove recent search: $e', context: _logContext);
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

/// Popular search suggestions (static data)
final popularSearchesProvider = Provider<List<String>>((ref) {
  return [
    'Headphones',
    'Electronics',
    'Gaming',
    'Under \$50',
    'Laptops',
    'Phones',
    'Home & Garden',
    'Fashion',
  ];
});

/// Search provider
final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  final repository = ref.watch(dealsRepositoryProvider);
  return SearchNotifier(repository: repository);
});

/// Recent searches provider (async)
final recentSearchesProvider = FutureProvider<List<RecentSearch>>((ref) async {
  final notifier = ref.watch(searchProvider.notifier);
  return notifier.getRecentSearches();
});
