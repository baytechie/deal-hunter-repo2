import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// Search Result - Represents search results with metadata
class SearchResult {
  /// Query that produced these results
  final String query;

  /// List of matching deals
  final List<Deal> deals;

  /// Total number of results available
  final int totalCount;

  /// Category counts for filtering
  final Map<String, int> categoryCounts;

  const SearchResult({
    required this.query,
    required this.deals,
    required this.totalCount,
    this.categoryCounts = const {},
  });

  /// Empty search result
  static const empty = SearchResult(
    query: '',
    deals: [],
    totalCount: 0,
  );

  /// Whether the search has results
  bool get hasResults => deals.isNotEmpty;

  /// Whether this is an empty query
  bool get isEmptyQuery => query.isEmpty;
}

/// Recent Search - Represents a previous search query
class RecentSearch {
  /// The search query
  final String query;

  /// When this search was performed
  final DateTime timestamp;

  const RecentSearch({
    required this.query,
    required this.timestamp,
  });

  /// Create from JSON map (for storage)
  factory RecentSearch.fromJson(Map<String, dynamic> json) {
    return RecentSearch(
      query: json['query'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  /// Convert to JSON map (for storage)
  Map<String, dynamic> toJson() {
    return {
      'query': query,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
