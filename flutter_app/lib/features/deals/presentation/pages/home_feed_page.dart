import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/deals/presentation/widgets/deal_card.dart';
import 'package:money_saver_deals/features/notifications/presentation/pages/notifications_page.dart';
import 'package:money_saver_deals/app_shell.dart';

final selectedCategoryFilterProvider = StateProvider<String?>((ref) => null);
final gridViewModeProvider = StateProvider<bool>((ref) => true); // true = grid, false = list

/// Home Feed Page - Main deals feed with search, filters, grid, and infinite scroll
///
/// Why: This page is the main entry point for users to browse deals.
/// It supports:
/// - Category filtering
/// - Grid/List view toggle
/// - Infinite scroll pagination for smooth browsing experience
/// - Pull-to-refresh for manual refresh
class HomeFeedPage extends ConsumerStatefulWidget {
  const HomeFeedPage({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _HomeFeedPageState();
}

class _HomeFeedPageState extends ConsumerState<HomeFeedPage> {
  bool _initialFetchDone = false;

  /// Scroll controller for detecting when user reaches bottom of list
  late ScrollController _scrollController;

  /// Threshold in pixels before the end to trigger load more
  /// Why: Loading early provides smoother UX by starting load before user hits the end
  static const double _loadMoreThreshold = 200.0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  /// Handle scroll events to trigger infinite scroll
  ///
  /// Why: Check if user has scrolled near the bottom and trigger load more
  /// if there are more deals available and not already loading
  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    // Check if we're near the bottom
    if (maxScroll - currentScroll <= _loadMoreThreshold) {
      final dealsState = ref.read(dealsProvider);

      // Only trigger load more if in success state with more deals available
      if (dealsState is DealsSuccess &&
          dealsState.hasMore &&
          !dealsState.isLoadingMore) {
        ref.read(dealsProvider.notifier).loadMoreDeals();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialFetchDone) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(dealsProvider.notifier).fetchAllDeals();
        _initialFetchDone = true;
      });
    }

    final dealsState = ref.watch(dealsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Top Bar: Logo + Notification
                  Row(
                    children: [
                      // Logo and Title - Clickable to go home
                      GestureDetector(
                        onTap: () {
                          // Reset to home tab (Feed)
                          ref.read(selectedTabProvider.notifier).state = 0;
                          // Reset filters
                          ref.read(selectedCategoryFilterProvider.notifier).state = null;
                          // Reload all deals
                          ref.read(dealsProvider.notifier).fetchAllDeals();
                          // Scroll to top
                          if (_scrollController.hasClients) {
                            _scrollController.animateTo(
                              0,
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeOut,
                            );
                          }
                        },
                        child: Row(
                          children: [
                            const Icon(
                              Icons.local_offer,
                              color: Color(0xFF10B981),
                              size: 28,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Deal Hunter',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF10B981),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),

                      // Notification Bell
                      IconButton(
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: Colors.grey,
                          size: 24,
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const NotificationsPage(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Search Bar (Full Width)
                  Container(
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TextField(
                      decoration: InputDecoration(
                        labelText: 'Search deals',
                        labelStyle: const TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                        hintText: 'Search deals...',
                        prefixIcon: const Icon(
                          Icons.search,
                          color: Colors.grey,
                          size: 20,
                          semanticLabel: 'Search icon',
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 8,
                        ),
                        hintStyle: const TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Filter Pills
                  Consumer(
                    builder: (context, ref, _) {
                      final selectedFilter = ref.watch(selectedCategoryFilterProvider);
                      final isGridView = ref.watch(gridViewModeProvider);

                      return SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _FilterPill(
                              'Frontpage',
                              isSelected: selectedFilter == null,
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = null;
                                ref.read(dealsProvider.notifier).fetchAllDeals();
                                _scrollToTop();
                              },
                            ),
                            const SizedBox(width: 8),
                            _FilterPill(
                              'Popular',
                              isSelected: selectedFilter == 'Popular',
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = 'Popular';
                                ref.read(dealsProvider.notifier).fetchAllDeals(isHot: true);
                                _scrollToTop();
                              },
                            ),
                            const SizedBox(width: 8),
                            _FilterPill(
                              'Tech',
                              isSelected: selectedFilter == 'Tech',
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = 'Tech';
                                ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Tech');
                                _scrollToTop();
                              },
                            ),
                            const SizedBox(width: 8),
                            _FilterPill(
                              'Electronics',
                              isSelected: selectedFilter == 'Electronics',
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = 'Electronics';
                                ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Electronics');
                                _scrollToTop();
                              },
                            ),
                            const SizedBox(width: 8),
                            Semantics(
                              label: isGridView
                                  ? 'Switch to list view'
                                  : 'Switch to grid view',
                              button: true,
                              child: GestureDetector(
                                onTap: () {
                                  ref.read(gridViewModeProvider.notifier).state = !isGridView;
                                },
                                child: Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(color: Colors.grey[300]!),
                                  ),
                                  child: Icon(
                                    isGridView ? Icons.view_list : Icons.dashboard,
                                    color: const Color(0xFF047857),
                                    size: 22,
                                    semanticLabel: isGridView ? 'List view icon' : 'Grid view icon',
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Grid/List Content with Infinite Scroll
            Expanded(
              child: _buildContent(dealsState),
            ),
          ],
        ),
      ),
    );
  }

  /// Scroll to top of the list
  ///
  /// Why: When filters change, scroll to top to show new results
  void _scrollToTop() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  /// Build the main content area based on current state
  Widget _buildContent(DealsState dealsState) {
    if (dealsState is DealsSuccess) {
      return _buildDealsGrid(dealsState);
    } else if (dealsState is DealsLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    } else if (dealsState is DealsError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Error: ${dealsState.message}',
              style: const TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                ref.read(dealsProvider.notifier).fetchAllDeals();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    } else {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_bag,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No deals loaded',
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }
  }

  /// Build the deals grid/list with infinite scroll support
  ///
  /// Why: Combines RefreshIndicator for pull-to-refresh with
  /// scroll detection for infinite scroll pagination
  Widget _buildDealsGrid(DealsSuccess dealsState) {
    final isGridView = ref.watch(gridViewModeProvider);
    final deals = dealsState.deals;

    // Calculate item count: deals + optional loading indicator + optional error message
    int itemCount = deals.length;
    if (dealsState.isLoadingMore || dealsState.loadMoreError != null) {
      itemCount += 1; // Add footer item
    } else if (dealsState.hasMore) {
      itemCount += 1; // Add invisible trigger item
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Get current filter state to maintain filter during refresh
        final selectedFilter = ref.read(selectedCategoryFilterProvider);
        if (selectedFilter == 'Popular') {
          await ref.read(dealsProvider.notifier).fetchAllDeals(isHot: true);
        } else if (selectedFilter == 'Tech') {
          await ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Tech');
        } else if (selectedFilter == 'Electronics') {
          await ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Electronics');
        } else {
          await ref.read(dealsProvider.notifier).fetchAllDeals();
        }
      },
      child: isGridView
          ? _buildGridView(deals, dealsState, itemCount)
          : _buildListView(deals, dealsState, itemCount),
    );
  }

  /// Build grid view with infinite scroll footer
  Widget _buildGridView(List deals, DealsSuccess dealsState, int itemCount) {
    return CustomScrollView(
      controller: _scrollController,
      slivers: [
        // Deals Grid
        SliverPadding(
          padding: const EdgeInsets.all(6),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                if (index < deals.length) {
                  return DealCard(deal: deals[index]);
                }
                return null;
              },
              childCount: deals.length,
            ),
          ),
        ),
        // Footer for loading indicator or error
        SliverToBoxAdapter(
          child: _buildFooter(dealsState),
        ),
      ],
    );
  }

  /// Build list view with infinite scroll footer
  Widget _buildListView(List deals, DealsSuccess dealsState, int itemCount) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(8),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        if (index < deals.length) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: SizedBox(
              height: 140,
              child: DealCard(deal: deals[index]),
            ),
          );
        }
        // Footer item
        return _buildFooter(dealsState);
      },
    );
  }

  /// Build the footer widget for loading indicator, error message, or end message
  ///
  /// Why: Provides visual feedback to users about loading state and
  /// allows retry on error without full page refresh
  Widget _buildFooter(DealsSuccess dealsState) {
    if (dealsState.isLoadingMore) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.0,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Loading more deals...',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (dealsState.loadMoreError != null) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Icon(
                Icons.error_outline,
                color: Colors.red,
                size: 24,
              ),
              const SizedBox(height: 8),
              Text(
                dealsState.loadMoreError!,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  ref.read(dealsProvider.notifier).clearLoadMoreError();
                  ref.read(dealsProvider.notifier).loadMoreDeals();
                },
                child: const Text('Tap to retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (!dealsState.hasMore && dealsState.deals.isNotEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(
          child: Text(
            'You\'ve seen all deals!',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
          ),
        ),
      );
    }

    // Empty placeholder for hasMore state (trigger loading via scroll)
    return const SizedBox.shrink();
  }
}

class _FilterPill extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isSelected;

  const _FilterPill(
    this.label, {
    required this.onTap,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF10B981) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : Colors.grey[300]!,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: isSelected ? Colors.white : const Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
