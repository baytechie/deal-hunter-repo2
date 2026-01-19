import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/core/widgets/app_header.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/deals/presentation/widgets/deal_card.dart';
import 'package:money_saver_deals/app_shell.dart';

final selectedCategoryFilterProvider = StateProvider<String?>((ref) => null);
final gridViewModeProvider = StateProvider<bool>((ref) => true);

/// Home Feed Page - Main deals feed with search, filters, grid, and infinite scroll
///
/// Design: Modern, premium shopping app with depth and visual hierarchy
/// Features:
/// - Enhanced search bar with filter icon
/// - Animated category pills with gradients
/// - Responsive grid layout
/// - Infinite scroll pagination
/// - Pull-to-refresh
class HomeFeedPage extends ConsumerStatefulWidget {
  const HomeFeedPage({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _HomeFeedPageState();
}

class _HomeFeedPageState extends ConsumerState<HomeFeedPage> {
  bool _initialFetchDone = false;
  late ScrollController _scrollController;
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

  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    if (maxScroll - currentScroll <= _loadMoreThreshold) {
      final dealsState = ref.read(dealsProvider);

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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            _buildHeader(),

            // Grid/List Content with Infinite Scroll
            Expanded(
              child: _buildContent(dealsState),
            ),
          ],
        ),
      ),
    );
  }

  /// Build the header with logo, search, and filters
  Widget _buildHeader() {
    return Column(
      children: [
        // App Header with logo and notifications
        AppHeader(
          onLogoTap: () {
            HapticFeedback.selectionClick();
            ref.read(selectedTabProvider.notifier).state = 0;
            ref.read(selectedCategoryFilterProvider.notifier).state = null;
            ref.read(dealsProvider.notifier).fetchAllDeals();
            _scrollToTop();
          },
        ),

        // Search and Filters section
        Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          color: AppColors.background,
          child: Column(
            children: [
              // Search Bar
              _buildSearchBar(),
              const SizedBox(height: 14),

              // Filter Pills
              _buildFilterPills(),
            ],
          ),
        ),
      ],
    );
  }

  /// Build the enhanced search bar
  Widget _buildSearchBar() {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.xxl),
        border: Border.all(color: AppColors.border, width: 1),
        boxShadow: AppShadows.searchShadow,
      ),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search deals, brands, categories...',
          hintStyle: const TextStyle(
            color: AppColors.textDisabled,
            fontSize: 15,
            fontWeight: FontWeight.w400,
          ),
          prefixIcon: const Padding(
            padding: EdgeInsets.only(left: 16, right: 12),
            child: Icon(
              Icons.search_rounded,
              color: AppColors.textMuted,
              size: 22,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
          suffixIcon: Container(
            margin: const EdgeInsets.only(right: 6),
            child: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primarySurface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: const Icon(
                  Icons.tune_rounded,
                  color: AppColors.primary,
                  size: 18,
                ),
              ),
              onPressed: () {
                // TODO: Show filters bottom sheet
                HapticFeedback.lightImpact();
              },
              tooltip: 'Filters',
            ),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  /// Build the filter pills row
  Widget _buildFilterPills() {
    return Consumer(
      builder: (context, ref, _) {
        final selectedFilter = ref.watch(selectedCategoryFilterProvider);
        final isGridView = ref.watch(gridViewModeProvider);

        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _FilterPill(
                'Frontpage',
                icon: Icons.home_rounded,
                isSelected: selectedFilter == null,
                onTap: () {
                  HapticFeedback.selectionClick();
                  ref.read(selectedCategoryFilterProvider.notifier).state = null;
                  ref.read(dealsProvider.notifier).fetchAllDeals();
                  _scrollToTop();
                },
              ),
              const SizedBox(width: 10),
              _FilterPill(
                'Popular',
                icon: Icons.local_fire_department_rounded,
                isSelected: selectedFilter == 'Popular',
                onTap: () {
                  HapticFeedback.selectionClick();
                  ref.read(selectedCategoryFilterProvider.notifier).state = 'Popular';
                  ref.read(dealsProvider.notifier).fetchAllDeals(isHot: true);
                  _scrollToTop();
                },
              ),
              const SizedBox(width: 10),
              _FilterPill(
                'Tech',
                icon: Icons.devices_rounded,
                isSelected: selectedFilter == 'Tech',
                onTap: () {
                  HapticFeedback.selectionClick();
                  ref.read(selectedCategoryFilterProvider.notifier).state = 'Tech';
                  ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Tech');
                  _scrollToTop();
                },
              ),
              const SizedBox(width: 10),
              _FilterPill(
                'Electronics',
                icon: Icons.electrical_services_rounded,
                isSelected: selectedFilter == 'Electronics',
                onTap: () {
                  HapticFeedback.selectionClick();
                  ref.read(selectedCategoryFilterProvider.notifier).state = 'Electronics';
                  ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Electronics');
                  _scrollToTop();
                },
              ),
              const SizedBox(width: 10),
              // Grid/List Toggle
              Semantics(
                label: isGridView ? 'Switch to list view' : 'Switch to grid view',
                button: true,
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    ref.read(gridViewModeProvider.notifier).state = !isGridView;
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 48,
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppShadows.subtleShadow,
                    ),
                    child: Icon(
                      isGridView ? Icons.view_list_rounded : Icons.grid_view_rounded,
                      color: AppColors.primary,
                      size: 22,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _scrollToTop() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Widget _buildContent(DealsState dealsState) {
    if (dealsState is DealsSuccess) {
      return _buildDealsGrid(dealsState);
    } else if (dealsState is DealsLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 48,
              height: 48,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Finding best deals...',
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    } else if (dealsState is DealsError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline_rounded,
                  color: AppColors.error,
                  size: 48,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Oops! Something went wrong',
                style: AppTypography.headline.copyWith(fontSize: 18),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                dealsState.message,
                style: const TextStyle(color: AppColors.textMuted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  ref.read(dealsProvider.notifier).fetchAllDeals();
                },
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    } else {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.shopping_bag_outlined,
                size: 56,
                color: AppColors.textDisabled,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No deals loaded',
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildDealsGrid(DealsSuccess dealsState) {
    final isGridView = ref.watch(gridViewModeProvider);
    final deals = dealsState.deals;

    int itemCount = deals.length;
    if (dealsState.isLoadingMore || dealsState.loadMoreError != null) {
      itemCount += 1;
    } else if (dealsState.hasMore) {
      itemCount += 1;
    }

    return RefreshIndicator(
      onRefresh: () async {
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
      color: AppColors.primary,
      child: isGridView
          ? _buildGridView(deals, dealsState, itemCount)
          : _buildListView(deals, dealsState, itemCount),
    );
  }

  Widget _buildGridView(List deals, DealsSuccess dealsState, int itemCount) {
    return CustomScrollView(
      controller: _scrollController,
      slivers: [
        // Deals Grid with improved spacing
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.68, // Taller cards for more content
              mainAxisSpacing: 14,    // Increased from 6
              crossAxisSpacing: 12,   // Increased from 6
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

  Widget _buildListView(List deals, DealsSuccess dealsState, int itemCount) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        if (index < deals.length) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: SizedBox(
              height: 160,
              child: DealCard(deal: deals[index]),
            ),
          );
        }
        return _buildFooter(dealsState);
      },
    );
  }

  Widget _buildFooter(DealsSuccess dealsState) {
    if (dealsState.isLoadingMore) {
      return Padding(
        padding: const EdgeInsets.all(20.0),
        child: Center(
          child: Column(
            children: [
              const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Loading more deals...',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (dealsState.loadMoreError != null) {
      return Padding(
        padding: const EdgeInsets.all(20.0),
        child: Center(
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline_rounded,
                  color: AppColors.error,
                  size: 24,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                dealsState.loadMoreError!,
                style: const TextStyle(
                  color: AppColors.error,
                  fontSize: 13,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              TextButton.icon(
                onPressed: () {
                  ref.read(dealsProvider.notifier).clearLoadMoreError();
                  ref.read(dealsProvider.notifier).loadMoreDeals();
                },
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Tap to retry'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (!dealsState.hasMore && dealsState.deals.isNotEmpty) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primarySurface,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_outline_rounded,
                  color: AppColors.primary,
                  size: 28,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                "You've seen all deals!",
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}

/// Enhanced Filter Pill with animation and optional icon
class _FilterPill extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback onTap;
  final bool isSelected;

  const _FilterPill(
    this.label, {
    this.icon,
    required this.onTap,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryLight],
                )
              : null,
          color: isSelected ? null : AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.xxl),
          border: Border.all(
            color: isSelected ? Colors.transparent : AppColors.border,
            width: 1,
          ),
          boxShadow: isSelected
              ? AppShadows.elevatedShadow(AppColors.primary)
              : AppShadows.subtleShadow,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 16,
                color: isSelected ? Colors.white : AppColors.textMuted,
              ),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: isSelected ? Colors.white : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
