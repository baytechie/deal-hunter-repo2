import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';
import 'package:money_saver_deals/features/rss_feed/presentation/providers/rss_feed_provider.dart';
import 'package:money_saver_deals/features/rss_feed/presentation/widgets/rss_feed_deal_card.dart';
import 'package:money_saver_deals/features/rss_feed/presentation/pages/related_deals_page.dart';

/// RSS Feed Page - Main deals feed with filter tabs
///
/// Similar to Slickdeals layout with:
/// - Filter tabs: For You, Frontpage, Popular, Hot Deals
/// - "Deals based on your interests" section
/// - Infinite scroll with pull-to-refresh
class RssFeedPage extends ConsumerStatefulWidget {
  const RssFeedPage({super.key});

  @override
  ConsumerState<RssFeedPage> createState() => _RssFeedPageState();
}

class _RssFeedPageState extends ConsumerState<RssFeedPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ScrollController _scrollController = ScrollController();

  final List<_TabInfo> _tabs = const [
    _TabInfo(RssFeedTab.forYou, 'For You'),
    _TabInfo(RssFeedTab.frontpage, 'Frontpage'),
    _TabInfo(RssFeedTab.popular, 'Popular'),
    _TabInfo(RssFeedTab.hotDeals, 'Hot Deals'),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(_onTabChanged);
    _scrollController.addListener(_onScroll);

    // Initial fetch
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(rssFeedProvider.notifier).fetchDeals(tab: RssFeedTab.forYou);
    });
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) {
      final tab = _tabs[_tabController.index].tab;
      ref.read(rssFeedProvider.notifier).fetchDeals(tab: tab);
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(rssFeedProvider.notifier).loadMore();
    }
  }

  void _navigateToRelatedDeals(RssFeedDeal deal) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => RelatedDealsPage(deal: deal),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(rssFeedProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(Icons.local_offer, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            const Text('Deal Feed'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showSearchDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterBottomSheet(),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: theme.scaffoldBackgroundColor,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: theme.colorScheme.onSurface,
              unselectedLabelColor: Colors.grey,
              indicatorColor: theme.colorScheme.primary,
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 14),
              tabs: _tabs.map((t) => Tab(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: _tabController.index == _tabs.indexOf(t)
                        ? theme.colorScheme.primary.withOpacity(0.1)
                        : Colors.grey[200],
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(t.label),
                ),
              )).toList(),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(rssFeedProvider.notifier).refresh(),
        child: _buildBody(state),
      ),
    );
  }

  Widget _buildBody(RssFeedState state) {
    return switch (state) {
      RssFeedInitial() => const Center(child: Text('Pull to load deals')),
      RssFeedLoading() => const Center(child: CircularProgressIndicator()),
      RssFeedError(:final message) => _buildErrorWidget(message),
      RssFeedSuccess(:final deals, :final isLoadingMore, :final hasMore) =>
        _buildDealsList(deals, isLoadingMore, hasMore),
    };
  }

  Widget _buildErrorWidget(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Failed to load deals',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.read(rssFeedProvider.notifier).refresh(),
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDealsList(List<RssFeedDeal> deals, bool isLoadingMore, bool hasMore) {
    if (deals.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No deals found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
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

    return CustomScrollView(
      controller: _scrollController,
      slivers: [
        // Header
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Deals based on your interests',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.grid_view, size: 20),
                  onPressed: () {
                    // Toggle grid/list view (future feature)
                  },
                ),
              ],
            ),
          ),
        ),
        // Deals list
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              if (index >= deals.length) {
                return const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              final deal = deals[index];
              return RssFeedDealCard(
                deal: deal,
                onTap: () => _navigateToRelatedDeals(deal),
              );
            },
            childCount: deals.length + (isLoadingMore ? 1 : 0),
          ),
        ),
        // End of list indicator
        if (!hasMore && deals.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'You\'ve seen all the deals!',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ),
            ),
          ),
      ],
    );
  }

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (context) {
        String searchQuery = '';
        return AlertDialog(
          title: const Text('Search Deals'),
          content: TextField(
            autofocus: true,
            decoration: const InputDecoration(
              hintText: 'Enter search terms...',
              prefixIcon: Icon(Icons.search),
            ),
            onChanged: (value) => searchQuery = value,
            onSubmitted: (value) {
              Navigator.pop(context);
              ref.read(rssFeedProvider.notifier).searchDeals(value);
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ref.read(rssFeedProvider.notifier).searchDeals(searchQuery);
              },
              child: const Text('Search'),
            ),
          ],
        );
      },
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.8,
        expand: false,
        builder: (context, scrollController) => _FilterBottomSheet(
          scrollController: scrollController,
        ),
      ),
    );
  }
}

class _TabInfo {
  final RssFeedTab tab;
  final String label;

  const _TabInfo(this.tab, this.label);
}

/// Filter bottom sheet widget
class _FilterBottomSheet extends ConsumerWidget {
  final ScrollController scrollController;

  const _FilterBottomSheet({required this.scrollController});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(rssFeedCategoriesProvider);
    final storesAsync = ref.watch(rssFeedStoresProvider);

    return Column(
      children: [
        // Handle
        Container(
          margin: const EdgeInsets.only(top: 8),
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 16),
        // Title
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filter Deals',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  ref.read(rssFeedProvider.notifier).resetFilters();
                  ref.read(rssFeedProvider.notifier).refresh();
                  Navigator.pop(context);
                },
                child: const Text('Reset'),
              ),
            ],
          ),
        ),
        const Divider(),
        // Filter options
        Expanded(
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(16),
            children: [
              // Categories
              const Text(
                'Categories',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              categoriesAsync.when(
                data: (categories) => Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: categories.map((cat) => FilterChip(
                    label: Text(cat),
                    onSelected: (selected) {
                      ref.read(rssFeedProvider.notifier).filterByCategory(selected ? cat : null);
                      Navigator.pop(context);
                    },
                  )).toList(),
                ),
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const Text('Failed to load categories'),
              ),
              const SizedBox(height: 24),
              // Stores
              const Text(
                'Stores',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              storesAsync.when(
                data: (stores) => Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: stores.map((store) => FilterChip(
                    label: Text(store),
                    onSelected: (selected) {
                      ref.read(rssFeedProvider.notifier).filterByStore(selected ? store : null);
                      Navigator.pop(context);
                    },
                  )).toList(),
                ),
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const Text('Failed to load stores'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
