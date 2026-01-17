import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/core/providers/service_providers.dart';
import 'package:money_saver_deals/features/saved/presentation/providers/saved_deals_provider.dart';

/// Deal Card Widget - Displays a single deal in the grid
/// 
/// Layout:
/// - Section A (Image - 60%): Product image with HOT badge and save button
/// - Section B (Content - 40%): Title, price, metadata, and engagement metrics
class DealCard extends ConsumerWidget {
  final Deal deal;

  const DealCard({
    required this.deal,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () => _handleDealTap(context, ref),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        child: Column(
          children: [
            // Section A: Image (Flex 3)
            Flexible(
              flex: 3,
              child: Stack(
                children: [
                  // Background image
                  Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(8),
                        topRight: Radius.circular(8),
                      ),
                    ),
                    child: deal.imageUrl.isNotEmpty
                        ? ClipRRect(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(8),
                              topRight: Radius.circular(8),
                            ),
                            child: Image.network(
                              deal.imageUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              loadingBuilder: (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                    strokeWidth: 2,
                                    valueColor: const AlwaysStoppedAnimation<Color>(
                                      Color(0xFF10B981),
                                    ),
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.local_offer,
                                        size: 36,
                                        color: Colors.grey[400],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Deal',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: Colors.grey[500],
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          )
                        : Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.local_offer,
                                  size: 36,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Deal',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey[500],
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),

                  // HOT Badge (Top Left)
                  if (deal.isHot)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444), // Red
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'HOT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                  // Heart Icon (Top Right)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Consumer(
                      builder: (context, ref, _) {
                        final savedDeals = ref.watch(savedDealsProvider);
                        final isSaved = savedDeals.any((d) => d.id == deal.id);
                        
                        return GestureDetector(
                          onTap: () {
                            ref.read(savedDealsProvider.notifier).toggleSave(deal);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  isSaved 
                                    ? '${deal.title} removed from saved' 
                                    : '${deal.title} saved!',
                                ),
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.9),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isSaved ? Icons.favorite : Icons.favorite_border,
                              size: 20,
                              color: isSaved ? Colors.red : Colors.grey,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Section B: Content (Flex 4)
            Flexible(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Title
                    Text(
                      deal.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        height: 1.2,
                      ),
                    ),

                    // Price Row
                    Row(
                      children: [
                        Text(
                          '\$${deal.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF10B981), // Green
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '\$${deal.originalPrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF6B7280), // Grey
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Metadata Row
                    Text(
                      'Store • 2h ago',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF6B7280),
                      ),
                    ),

                    // Engagement Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.thumb_up_outlined,
                              size: 14,
                              color: Color(0xFF6B7280),
                            ),
                            const SizedBox(width: 4),
                            const Text(
                              '125',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ],
                        ),
                        const Icon(
                          Icons.thumb_down_outlined,
                          size: 14,
                          color: Color(0xFF6B7280),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleDealTap(BuildContext context, WidgetRef ref) async {
    final urlLauncher = ref.read(urlLauncherServiceProvider);
    await urlLauncher.launchDeal(
      url: deal.affiliateLink,
      dealId: deal.id,
      dealTitle: deal.title,
      onWebViewRequired: (url) {
        // Handle webview if needed
      },
      onError: (error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: Colors.red,
          ),
        );
      },
    );
  }
}
