import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/deals/domain/repositories/deals_repository.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/saved/presentation/providers/saved_deals_provider.dart';

/// State for the flip feed
class FlipFeedState {
  final List<Deal> deals;
  final int currentIndex;
  final bool isLoading;
  final String? error;
  final Map<String, bool> flippedCards; // Track which cards are flipped

  const FlipFeedState({
    this.deals = const [],
    this.currentIndex = 0,
    this.isLoading = false,
    this.error,
    this.flippedCards = const {},
  });

  FlipFeedState copyWith({
    List<Deal>? deals,
    int? currentIndex,
    bool? isLoading,
    String? error,
    Map<String, bool>? flippedCards,
  }) {
    return FlipFeedState(
      deals: deals ?? this.deals,
      currentIndex: currentIndex ?? this.currentIndex,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      flippedCards: flippedCards ?? this.flippedCards,
    );
  }

  Deal? get currentDeal =>
      deals.isNotEmpty && currentIndex < deals.length
          ? deals[currentIndex]
          : null;
}

/// Notifier for the flip feed state
class FlipFeedNotifier extends StateNotifier<FlipFeedState> {
  final DealsRepository _repository;
  late PageController pageController;

  FlipFeedNotifier(this._repository) : super(const FlipFeedState()) {
    pageController = PageController();
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }

  /// Load deals for the flip feed
  Future<void> loadDeals() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getAllDeals();

    result.when(
      success: (deals) {
        // Add mock data for new fields if not present from API
        final enhancedDeals = deals.map((deal) => _enhanceDeal(deal)).toList();
        state = state.copyWith(isLoading: false, deals: enhancedDeals);
      },
      failure: (error) {
        state = state.copyWith(isLoading: false, error: error);
      },
    );
  }

  /// Enhance deal with mock data for fields not yet in API
  Deal _enhanceDeal(Deal deal) {
    // Generate mock verdict based on discount
    String verdict;
    String analysis;
    if (deal.discountPercentage >= 40) {
      verdict = 'BUY NOW';
      analysis = 'Excellent deal! This is ${deal.discountPercentage.toStringAsFixed(0)}% off - the best price we\'ve seen.';
    } else if (deal.discountPercentage >= 20) {
      verdict = 'BUY NOW';
      analysis = 'Good price. This is a solid deal worth grabbing.';
    } else {
      verdict = 'WAIT';
      analysis = 'Price is okay but we\'ve seen better. Consider waiting for a bigger discount.';
    }

    // Generate mock price trend
    final priceTrend = PriceTrend(
      percentChange: -(deal.discountPercentage * 0.3), // Mock: lower than avg
      averagePrice: deal.originalPrice * 0.9,
      trendDescription: '${(deal.discountPercentage * 0.3).toStringAsFixed(0)}% lower than average',
    );

    // Generate mock coupon for some deals
    String? couponCode;
    if (deal.discountPercentage >= 25 && deal.id.hashCode % 3 == 0) {
      couponCode = 'SAVE${(deal.discountPercentage).toStringAsFixed(0)}';
    }

    return deal.copyWith(
      verdict: deal.verdict ?? verdict,
      shouldYouWaitAnalysis: deal.shouldYouWaitAnalysis ?? analysis,
      priceTrend: deal.priceTrend ?? priceTrend,
      couponCode: deal.couponCode ?? couponCode,
      likes: deal.likes > 0 ? deal.likes : (deal.id.hashCode.abs() % 500) + 10,
      comments: deal.comments > 0 ? deal.comments : (deal.id.hashCode.abs() % 50) + 1,
    );
  }

  /// Go to next deal
  void nextDeal() {
    if (state.currentIndex < state.deals.length - 1) {
      final newIndex = state.currentIndex + 1;
      state = state.copyWith(currentIndex: newIndex);
      pageController.animateToPage(
        newIndex,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  /// Go to previous deal
  void previousDeal() {
    if (state.currentIndex > 0) {
      final newIndex = state.currentIndex - 1;
      state = state.copyWith(currentIndex: newIndex);
      pageController.animateToPage(
        newIndex,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  /// Update current index from page controller
  void updateIndex(int index) {
    state = state.copyWith(currentIndex: index);
  }

  /// Toggle flip state for a card
  void toggleFlip(String dealId) {
    final newFlippedCards = Map<String, bool>.from(state.flippedCards);
    newFlippedCards[dealId] = !(newFlippedCards[dealId] ?? false);
    state = state.copyWith(flippedCards: newFlippedCards);
  }

  /// Check if a card is flipped
  bool isFlipped(String dealId) {
    return state.flippedCards[dealId] ?? false;
  }

  /// Reset all cards to front
  void resetAllCards() {
    state = state.copyWith(flippedCards: {});
  }

  /// Load deals and scroll to a specific deal by ID
  Future<void> loadDealsAndScrollTo(String dealId) async {
    if (state.deals.isEmpty) {
      await loadDeals();
    }

    // Find the index of the target deal
    final index = state.deals.indexWhere((d) => d.id == dealId);
    if (index >= 0 && index < state.deals.length) {
      state = state.copyWith(currentIndex: index);
      // Jump to the page without animation for immediate feedback
      if (pageController.hasClients) {
        pageController.jumpToPage(index);
      }
    }
  }

  /// Jump to a specific page index
  void jumpToPage(int index) {
    if (index >= 0 && index < state.deals.length) {
      state = state.copyWith(currentIndex: index);
      if (pageController.hasClients) {
        pageController.jumpToPage(index);
      }
    }
  }
}

/// Provider for the flip feed
final flipFeedProvider =
    StateNotifierProvider<FlipFeedNotifier, FlipFeedState>((ref) {
  final repository = ref.watch(dealsRepositoryProvider);
  return FlipFeedNotifier(repository);
});

/// Provider to check if a deal is saved
final isDealSavedProvider = Provider.family<bool, String>((ref, dealId) {
  final savedDeals = ref.watch(savedDealsProvider);
  return savedDeals.any((deal) => deal.id == dealId);
});
