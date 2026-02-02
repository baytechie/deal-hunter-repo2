import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';

/// Deal card widget for RSS feed (similar to Slickdeals design)
///
/// Shows:
/// - Product image on the left
/// - Badge (Frontpage, Popular, Hot Deals)
/// - Title with price
/// - Original price crossed out
/// - Store name
/// - Vote count and comment count
/// - Time posted
class RssFeedDealCard extends StatelessWidget {
  final RssFeedDeal deal;
  final VoidCallback? onTap;
  final VoidCallback? onVoteUp;
  final VoidCallback? onVoteDown;

  const RssFeedDealCard({
    super.key,
    required this.deal,
    this.onTap,
    this.onVoteUp,
    this.onVoteDown,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product image with badge
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: deal.imageUrl != null && deal.imageUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: deal.imageUrl!,
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              width: 80,
                              height: 80,
                              color: Colors.grey[200],
                              child: const Center(
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              width: 80,
                              height: 80,
                              color: Colors.grey[200],
                              child: const Icon(Icons.image_not_supported, color: Colors.grey),
                            ),
                          )
                        : Container(
                            width: 80,
                            height: 80,
                            color: Colors.grey[200],
                            child: const Icon(Icons.local_offer, color: Colors.grey),
                          ),
                  ),
                  // Badge
                  if (deal.badgeText != null)
                    Positioned(
                      top: 0,
                      left: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getBadgeColor(deal.badgeText!),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(8),
                            bottomRight: Radius.circular(8),
                          ),
                        ),
                        child: Text(
                          deal.badgeText!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              // Deal info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title with price
                    Text(
                      _buildTitleWithPrice(),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    // Price row
                    Row(
                      children: [
                        if (deal.price != null) ...[
                          Text(
                            '\$${deal.price!.toStringAsFixed(2)}',
                            style: TextStyle(
                              color: Colors.green[700],
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        if (deal.originalPrice != null && deal.originalPrice! > (deal.price ?? 0)) ...[
                          Text(
                            '\$${deal.originalPrice!.toStringAsFixed(2)}',
                            style: TextStyle(
                              color: Colors.grey[500],
                              decoration: TextDecoration.lineThrough,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        if (deal.store != null)
                          Text(
                            'at ${deal.store}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Bottom row: votes, comments, time
                    Row(
                      children: [
                        // Vote buttons
                        _buildVoteButton(
                          icon: Icons.thumb_up_outlined,
                          count: deal.viewCount,
                          onTap: onVoteUp,
                        ),
                        const SizedBox(width: 4),
                        Icon(Icons.thumb_down_outlined, size: 16, color: Colors.grey[400]),
                        const SizedBox(width: 16),
                        // Comments
                        Icon(Icons.chat_bubble_outline, size: 16, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(
                          '${deal.clickCount}',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 13,
                          ),
                        ),
                        const Spacer(),
                        // Time
                        Text(
                          deal.timeAgo,
                          style: TextStyle(
                            color: Colors.grey[500],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _buildTitleWithPrice() {
    if (deal.price != null) {
      return '\$${deal.price!.toStringAsFixed(0)}* | ${deal.title}';
    }
    return deal.title;
  }

  Color _getBadgeColor(String badge) {
    switch (badge.toLowerCase()) {
      case 'hot deal':
        return Colors.red;
      case 'featured':
      case 'frontpage':
        return Colors.blue;
      case 'popular':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  Widget _buildVoteButton({
    required IconData icon,
    required int count,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[500]),
          const SizedBox(width: 4),
          Text(
            '$count',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

/// Compact deal card for related deals section
class RssFeedDealCardCompact extends StatelessWidget {
  final RssFeedDeal deal;
  final VoidCallback? onTap;

  const RssFeedDealCardCompact({
    super.key,
    required this.deal,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              // Image
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: deal.imageUrl != null && deal.imageUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: deal.imageUrl!,
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                        errorWidget: (context, url, error) => Container(
                          width: 60,
                          height: 60,
                          color: Colors.grey[200],
                          child: const Icon(Icons.image, size: 24),
                        ),
                      )
                    : Container(
                        width: 60,
                        height: 60,
                        color: Colors.grey[200],
                        child: const Icon(Icons.local_offer, size: 24),
                      ),
              ),
              const SizedBox(width: 10),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      deal.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (deal.price != null)
                          Text(
                            '\$${deal.price!.toStringAsFixed(2)}',
                            style: TextStyle(
                              color: Colors.green[700],
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        if (deal.store != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            deal.store!,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              // Source indicator
              if (deal.source != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    deal.source!.name,
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
