import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';
import 'package:money_saver_deals/features/rss_feed/presentation/providers/rss_feed_provider.dart';
import 'package:money_saver_deals/features/rss_feed/presentation/widgets/rss_feed_deal_card.dart';

/// Related Deals Page - Shows all related deals from multiple sources
///
/// When a user selects a deal, this page displays:
/// - The selected deal at the top
/// - Related deals grouped by source
/// - Ability to compare prices across sources
class RelatedDealsPage extends ConsumerStatefulWidget {
  final RssFeedDeal deal;

  const RelatedDealsPage({super.key, required this.deal});

  @override
  ConsumerState<RelatedDealsPage> createState() => _RelatedDealsPageState();
}

class _RelatedDealsPageState extends ConsumerState<RelatedDealsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(relatedDealsProvider.notifier).fetchRelatedDeals(widget.deal);
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _launchDealUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(relatedDealsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App bar with deal image
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: widget.deal.imageUrl != null && widget.deal.imageUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: widget.deal.imageUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.image, size: 64),
                      ),
                    )
                  : Container(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      child: Icon(
                        Icons.local_offer,
                        size: 64,
                        color: theme.colorScheme.primary,
                      ),
                    ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {
                  // Share functionality
                },
              ),
              IconButton(
                icon: const Icon(Icons.bookmark_border),
                onPressed: () {
                  // Save deal functionality
                },
              ),
            ],
          ),
          // Selected deal details
          SliverToBoxAdapter(
            child: _SelectedDealCard(
              deal: widget.deal,
              onViewDeal: () => _launchDealUrl(widget.deal.link),
            ),
          ),
          // Related deals section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Row(
                children: [
                  Icon(Icons.compare_arrows, color: theme.colorScheme.primary),
                  const SizedBox(width: 8),
                  const Text(
                    'Related Deals From All Sources',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Related deals content
          _buildRelatedDealsContent(state),
        ],
      ),
    );
  }

  Widget _buildRelatedDealsContent(RelatedDealsState state) {
    return switch (state) {
      RelatedDealsInitial() => const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: Text('Loading related deals...')),
          ),
        ),
      RelatedDealsLoading() => const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: CircularProgressIndicator()),
          ),
        ),
      RelatedDealsError(:final message) => SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Icon(Icons.error_outline, size: 48, color: Colors.grey[400]),
                const SizedBox(height: 16),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    ref.read(relatedDealsProvider.notifier).fetchRelatedDeals(widget.deal);
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      RelatedDealsSuccess(:final relatedDeals, :final dealsBySource) =>
        _buildRelatedDealsList(relatedDeals, dealsBySource),
    };
  }

  Widget _buildRelatedDealsList(
    List<RssFeedDeal> relatedDeals,
    Map<String, List<RssFeedDeal>> dealsBySource,
  ) {
    if (relatedDeals.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              Icon(Icons.search_off, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No related deals found',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We couldn\'t find similar deals from other sources.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    // Build grouped list by source
    final sourceEntries = dealsBySource.entries.toList();

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final entry = sourceEntries[index];
          final sourceName = entry.key;
          final deals = entry.value;

          return _SourceDealsSection(
            sourceName: sourceName,
            deals: deals,
            onDealTap: (deal) {
              ref.read(relatedDealsProvider.notifier).recordClick(deal.id);
              _launchDealUrl(deal.link);
            },
          );
        },
        childCount: sourceEntries.length,
      ),
    );
  }
}

/// Card showing the selected deal details
class _SelectedDealCard extends StatelessWidget {
  final RssFeedDeal deal;
  final VoidCallback onViewDeal;

  const _SelectedDealCard({
    required this.deal,
    required this.onViewDeal,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge
          if (deal.badgeText != null)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: deal.isHot ? Colors.red : Colors.blue,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                deal.badgeText!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          // Title
          Text(
            deal.title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          // Price row
          Row(
            children: [
              if (deal.price != null) ...[
                Text(
                  '\$${deal.price!.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: Colors.green[700],
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 12),
              ],
              if (deal.originalPrice != null && deal.originalPrice! > (deal.price ?? 0)) ...[
                Text(
                  '\$${deal.originalPrice!.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 16,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
                const SizedBox(width: 12),
              ],
              if (deal.discountPercentage != null && deal.discountPercentage! > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green[100],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '-${deal.discountPercentage!.toStringAsFixed(0)}%',
                    style: TextStyle(
                      color: Colors.green[800],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          // Store and time
          Row(
            children: [
              if (deal.store != null) ...[
                Icon(Icons.store, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  deal.store!,
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(width: 16),
              ],
              Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                deal.timeAgo,
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
          // Coupon code
          if (deal.couponCode != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange[200]!, style: BorderStyle.solid),
              ),
              child: Row(
                children: [
                  Icon(Icons.confirmation_number, color: Colors.orange[700]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Coupon Code',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.orange[700],
                          ),
                        ),
                        Text(
                          deal.couponCode!,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy),
                    onPressed: () {
                      // Copy to clipboard
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Coupon code copied!')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
          // Description
          if (deal.description != null && deal.description!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              deal.description!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.grey[700],
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 16),
          // View deal button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onViewDeal,
              icon: const Icon(Icons.open_in_new),
              label: const Text('View Deal'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Section showing deals from a specific source
class _SourceDealsSection extends StatelessWidget {
  final String sourceName;
  final List<RssFeedDeal> deals;
  final Function(RssFeedDeal) onDealTap;

  const _SourceDealsSection({
    required this.sourceName,
    required this.deals,
    required this.onDealTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Source header
        Container(
          margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                Icons.rss_feed,
                size: 20,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Text(
                sourceName,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${deals.length} deals',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
        // Deals from this source
        ...deals.map((deal) => RssFeedDealCardCompact(
          deal: deal,
          onTap: () => onDealTap(deal),
        )),
      ],
    );
  }
}
