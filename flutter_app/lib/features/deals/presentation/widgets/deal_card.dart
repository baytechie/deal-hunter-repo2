import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/saved/presentation/providers/saved_deals_provider.dart';
import 'package:money_saver_deals/app_shell.dart';


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
                              cacheWidth: 300,
                              cacheHeight: 300,
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
                                debugPrint('[DealCard] Image load error: $error');
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

                    // Promo Code Section (if available)
                    if (deal.couponCode != null || deal.promoDescription != null)
                      _buildPromoSection(context),

                    // Engagement Row (only show if no promo)
                    if (deal.couponCode == null && deal.promoDescription == null)
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
                              Text(
                                '${deal.likes}',
                                style: const TextStyle(
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

  /// Build promo code section with copy functionality
  Widget _buildPromoSection(BuildContext context) {
    return GestureDetector(
      onTap: () => _copyPromoCode(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFDCFCE7), // Light green
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: const Color(0xFF10B981), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.local_offer,
              size: 12,
              color: Color(0xFF10B981),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                deal.couponCode ?? 'PROMO',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: Color(0xFF047857),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const Icon(
              Icons.copy,
              size: 12,
              color: Color(0xFF10B981),
            ),
          ],
        ),
      ),
    );
  }

  /// Copy promo code to clipboard
  void _copyPromoCode(BuildContext context) {
    final code = deal.couponCode ?? deal.promoDescription ?? '';
    if (code.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: code));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Copied: $code'),
          duration: const Duration(seconds: 2),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  /// Navigate to Flip tab and show this deal
  void _handleDealTap(BuildContext context, WidgetRef ref) {
    // Set the selected deal for Flip page
    ref.read(selectedDealForFlipProvider.notifier).state = deal;
    // Navigate to Flip tab (index 1)
    ref.read(selectedTabProvider.notifier).state = 1;
  }
}
