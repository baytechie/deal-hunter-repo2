import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/saved/presentation/providers/saved_deals_provider.dart';
import 'package:money_saver_deals/app_shell.dart';

/// Deal Card Widget - Displays a single deal in the grid
///
/// Design: Modern card with depth, prominent pricing, and discount badges
/// Layout:
/// - Section A (Image - 55%): Product image with discount badge, HOT badge, and save button
/// - Section B (Content - 45%): Title, price with savings, metadata
class DealCard extends ConsumerWidget {
  final Deal deal;

  const DealCard({
    required this.deal,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final discountPercentage = _calculateDiscount();

    return GestureDetector(
      onTap: () => _handleDealTap(context, ref),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.xl),
          boxShadow: AppShadows.cardShadow,
          border: Border.all(
            color: AppColors.border,
            width: 1,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          child: Column(
            children: [
              // Section A: Image (Flex 10 of 20 - more compact)
              Flexible(
                flex: 10,
                child: Stack(
                  children: [
                    // Background image
                    Container(
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        color: AppColors.surfaceVariant,
                      ),
                      child: deal.imageUrl.isNotEmpty
                          ? _buildProductImage()
                          : _buildPlaceholderImage(),
                    ),

                    // Discount Badge (Top Left)
                    if (discountPercentage > 0)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: _buildDiscountBadge(discountPercentage),
                      ),

                    // HOT Badge (Below discount or top left if no discount)
                    if (deal.isHot)
                      Positioned(
                        top: discountPercentage > 0 ? 38 : 8,
                        left: 8,
                        child: _buildHotBadge(),
                      ),

                    // Heart Icon (Top Right)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: _buildSaveButton(ref),
                    ),

                    // Subtle gradient overlay at bottom for depth
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.03),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Section B: Content (Flex 10 of 20 - balanced)
              Flexible(
                flex: 10,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      // Title (compact, no Expanded)
                      Text(
                        deal.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.titleMedium,
                      ),

                      const SizedBox(height: 4),

                      // Price Section
                      _buildPriceSection(),

                      const SizedBox(height: 6),

                      // Promo Code or Engagement Row
                      if (deal.couponCode != null || deal.promoDescription != null)
                        _buildPromoSection(context)
                      else
                        _buildSavingsCallout(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Calculate discount percentage
  double _calculateDiscount() {
    if (deal.originalPrice <= 0 || deal.price >= deal.originalPrice) return 0;
    return ((deal.originalPrice - deal.price) / deal.originalPrice) * 100;
  }

  /// Build product image with loading and error states
  Widget _buildProductImage() {
    return Semantics(
      label: 'Product image for ${deal.title}',
      image: true,
      child: Image.network(
        deal.imageUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        cacheWidth: 300,
        cacheHeight: 300,
        semanticLabel: 'Product image for ${deal.title}',
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return _buildShimmerLoading(loadingProgress);
        },
        errorBuilder: (context, error, stackTrace) {
          debugPrint('[DealCard] Image load error: $error');
          return _buildPlaceholderImage();
        },
      ),
    );
  }

  /// Build shimmer-like loading indicator
  Widget _buildShimmerLoading(ImageChunkEvent loadingProgress) {
    return Container(
      color: AppColors.surfaceVariant,
      child: Center(
        child: SizedBox(
          width: 32,
          height: 32,
          child: CircularProgressIndicator(
            value: loadingProgress.expectedTotalBytes != null
                ? loadingProgress.cumulativeBytesLoaded /
                    loadingProgress.expectedTotalBytes!
                : null,
            strokeWidth: 2.5,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            backgroundColor: AppColors.border,
          ),
        ),
      ),
    );
  }

  /// Build placeholder for missing images
  Widget _buildPlaceholderImage() {
    return Center(
      child: Semantics(
        label: 'No image available for ${deal.title}',
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.border.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.local_offer_rounded,
                size: 28,
                color: AppColors.textDisabled,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Deal',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.textDisabled,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build discount percentage badge with gradient
  Widget _buildDiscountBadge(double percentage) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.error, AppColors.errorLight],
        ),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        boxShadow: [
          BoxShadow(
            color: AppColors.error.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        '-${percentage.toStringAsFixed(0)}%',
        style: AppTypography.discountBadge,
      ),
    );
  }

  /// Build HOT badge with fire icon
  Widget _buildHotBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.secondary, AppColors.secondaryLight],
        ),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        boxShadow: [
          BoxShadow(
            color: AppColors.secondary.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.local_fire_department_rounded,
            size: 12,
            color: Colors.white,
          ),
          SizedBox(width: 2),
          Text(
            'HOT',
            style: TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Build save/heart button
  Widget _buildSaveButton(WidgetRef ref) {
    return Consumer(
      builder: (context, ref, _) {
        final savedDeals = ref.watch(savedDealsProvider);
        final isSaved = savedDeals.any((d) => d.id == deal.id);

        return Semantics(
          label: isSaved
              ? 'Remove ${deal.title} from saved deals'
              : 'Save ${deal.title} to saved deals',
          button: true,
          child: GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              ref.read(savedDealsProvider.notifier).toggleSave(deal);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isSaved
                        ? '${deal.title} removed from saved'
                        : '${deal.title} saved!',
                  ),
                  duration: const Duration(seconds: 1),
                  backgroundColor: AppColors.primary,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              );
            },
            child: Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  size: 18,
                  color: isSaved ? AppColors.error : AppColors.textDisabled,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  /// Build price section with current and original price (larger fonts)
  Widget _buildPriceSection() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          '\$${deal.price.toStringAsFixed(2)}',
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.primary,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(width: 8),
        if (deal.originalPrice > deal.price)
          Flexible(
            child: Text(
              '\$${deal.originalPrice.toStringAsFixed(2)}',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textDisabled,
                decoration: TextDecoration.lineThrough,
                decorationColor: AppColors.textDisabled,
                decorationThickness: 2,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
      ],
    );
  }

  /// Build savings callout badge with thumbs up/down buttons
  Widget _buildSavingsCallout() {
    final savings = deal.originalPrice - deal.price;

    return Row(
      children: [
        // Savings badge (larger)
        if (savings > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.primarySurface,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.savings_outlined,
                  size: 16,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 5),
                Text(
                  'Save \$${savings.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        const Spacer(),
        // Thumbs up/down buttons
        _buildVoteButtons(),
      ],
    );
  }

  /// Build thumbs up and thumbs down vote buttons
  Widget _buildVoteButtons() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Thumbs up button
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            // TODO: Implement vote up functionality
          },
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.primarySurface,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.thumb_up_rounded,
                  size: 16,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 4),
                Text(
                  '${deal.likes > 0 ? deal.likes : ""}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        // Thumbs down button
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            // TODO: Implement vote down functionality
          },
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: const Icon(
              Icons.thumb_down_rounded,
              size: 16,
              color: AppColors.textMuted,
            ),
          ),
        ),
      ],
    );
  }

  /// Build engagement row with vote buttons (for when there are no savings)
  Widget _buildEngagementRow() {
    return _buildVoteButtons();
  }

  /// Build promo code section with copy functionality
  Widget _buildPromoSection(BuildContext context) {
    return GestureDetector(
      onTap: () => _copyPromoCode(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primarySurface,
              AppColors.primarySurface.withOpacity(0.7),
            ],
          ),
          borderRadius: BorderRadius.circular(AppRadius.sm),
          border: Border.all(color: AppColors.primaryLight, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.local_offer_rounded,
              size: 12,
              color: AppColors.primary,
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                deal.couponCode ?? 'PROMO',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppColors.primaryDark,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Icon(
                Icons.copy_rounded,
                size: 10,
                color: AppColors.primary,
              ),
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
      HapticFeedback.mediumImpact();
      Clipboard.setData(ClipboardData(text: code));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text('Copied: $code'),
            ],
          ),
          duration: const Duration(seconds: 2),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
        ),
      );
    }
  }

  /// Navigate to Flip tab and show this deal
  void _handleDealTap(BuildContext context, WidgetRef ref) {
    HapticFeedback.selectionClick();
    // Set the selected deal for Flip page
    ref.read(selectedDealForFlipProvider.notifier).state = deal;
    // Navigate to Flip tab (index 1)
    ref.read(selectedTabProvider.notifier).state = 1;
  }
}
