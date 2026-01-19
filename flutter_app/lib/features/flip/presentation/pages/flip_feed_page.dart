import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:money_saver_deals/app_shell.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/core/widgets/app_header.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/flip/presentation/providers/flip_feed_provider.dart';
import 'package:money_saver_deals/features/flip/presentation/widgets/flip_card_widget.dart';
import 'package:money_saver_deals/features/saved/presentation/providers/saved_deals_provider.dart';

/// FlipFeedPage - TikTok-like full-screen deal cards
///
/// Features:
/// - Vertical swipe to navigate between deals
/// - Tap to flip card for details
/// - Heart to save deals
/// - Buy button to open affiliate link
class FlipFeedPage extends ConsumerStatefulWidget {
  const FlipFeedPage({super.key});

  @override
  ConsumerState<FlipFeedPage> createState() => _FlipFeedPageState();
}

class _FlipFeedPageState extends ConsumerState<FlipFeedPage> {
  @override
  void initState() {
    super.initState();
    // Load deals when page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeFlipFeed();
    });
  }

  /// Initialize flip feed - use deals from Feed page and navigate to selected deal if any
  void _initializeFlipFeed() {
    final selectedDeal = ref.read(selectedDealForFlipProvider);
    final dealsState = ref.read(dealsProvider);

    // Get deals from the Feed page if available
    List<Deal> feedDeals = [];
    if (dealsState is DealsSuccess) {
      feedDeals = dealsState.deals;
    }

    if (selectedDeal != null && feedDeals.isNotEmpty) {
      // Clear the selected deal to avoid re-navigating on tab switches
      ref.read(selectedDealForFlipProvider.notifier).state = null;
      // Use the same deals from Feed and scroll to the selected one
      ref.read(flipFeedProvider.notifier).setDealsAndScrollTo(feedDeals, selectedDeal.id);
    } else if (feedDeals.isNotEmpty) {
      // Use deals from Feed page
      ref.read(flipFeedProvider.notifier).setDeals(feedDeals);
    } else {
      // Fallback: load deals from API if Feed has no deals
      ref.read(flipFeedProvider.notifier).loadDeals();
    }
  }

  @override
  Widget build(BuildContext context) {
    final flipFeedState = ref.watch(flipFeedProvider);

    // Listen for selected deal changes (when user taps card from Feed/Saved)
    ref.listen<Deal?>(selectedDealForFlipProvider, (previous, next) {
      if (next != null) {
        ref.read(selectedDealForFlipProvider.notifier).state = null;

        // Get deals from the Feed page
        final dealsState = ref.read(dealsProvider);
        if (dealsState is DealsSuccess && dealsState.deals.isNotEmpty) {
          // Use deals from Feed and scroll to the selected one
          ref.read(flipFeedProvider.notifier).setDealsAndScrollTo(dealsState.deals, next.id);
        } else {
          // Fallback to loading from API
          ref.read(flipFeedProvider.notifier).loadDealsAndScrollTo(next.id);
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header - using shared AppHeader component
            const AppHeader(pageTitle: 'Flip'),

            // Main content
            Expanded(
              child: _buildContent(flipFeedState),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(FlipFeedState state) {
    if (state.isLoading && state.deals.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading deals...'),
          ],
        ),
      );
    }

    if (state.error != null && state.deals.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text(
                'Error loading deals',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                state.error!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  ref.read(flipFeedProvider.notifier).loadDeals();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Try Again'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.deals.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No deals available',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Check back later for new deals!',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return _buildDealCards(state);
  }

  Widget _buildDealCards(FlipFeedState state) {
    final notifier = ref.read(flipFeedProvider.notifier);

    return PageView.builder(
      controller: notifier.pageController,
      scrollDirection: Axis.vertical,
      itemCount: state.deals.length,
      onPageChanged: (index) {
        notifier.updateIndex(index);
      },
      itemBuilder: (context, index) {
        final deal = state.deals[index];
        final isSaved = ref.watch(isDealSavedProvider(deal.id));

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: FlipCardWidget(
            deal: deal,
            isSaved: isSaved,
            currentIndex: index,
            totalDeals: state.deals.length,
            onSaveToggle: () {
              ref.read(savedDealsProvider.notifier).toggleSave(deal);
            },
            onBuyPressed: () {
              _openAffiliateLink(deal.affiliateLink);
            },
            onCopyCoupon: () {
              // Coupon copy handled in widget
            },
          ),
        );
      },
    );
  }

  Future<void> _openAffiliateLink(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not open link'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Error launching URL: $e');
    }
  }
}
