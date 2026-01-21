import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/core/widgets/share_button.dart';
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

    return LayoutBuilder(
      builder: (context, constraints) {
        // Responsive sizing based on card height
        final cardHeight = constraints.maxHeight;
        final isCompact = cardHeight < 320;
        final isVeryCompact = cardHeight < 280;

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
                  // Section A: Image (45% of card height)
                  Expanded(
                    flex: 45,
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
                            top: 6,
                            left: 6,
                            child: _buildDiscountBadge(discountPercentage, isCompact),
                          ),

                        // HOT Badge (Below discount or top left if no discount)
                        if (deal.isHot)
                          Positioned(
                            top: discountPercentage > 0 ? (isCompact ? 32 : 38) : 6,
                            left: 6,
                            child: _buildHotBadge(isCompact),
                          ),

                        // Retailer Badge (Bottom Left)
                        Positioned(
                          bottom: 6,
                          left: 6,
                          child: _buildRetailerBadge(isCompact),
                        ),

                        // Verdict Badge (Bottom Right)
                        if (deal.verdict != null && deal.verdict!.isNotEmpty)
                          Positioned(
                            bottom: 6,
                            right: 6,
                            child: _buildVerdictBadge(isCompact),
                          ),

                        // Heart Icon (Top Right)
                        Positioned(
                          top: 2,
                          right: 2,
                          child: _buildSaveButton(ref, isCompact),
                        ),

                        // Subtle gradient overlay at bottom for depth
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 30,
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

                  // Section B: Content (55% of card height - needs more space)
                  Expanded(
                    flex: 55,
                    child: Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(
                        horizontal: isCompact ? AppSpacing.sm : AppSpacing.md,
                        vertical: isCompact ? 6 : AppSpacing.sm,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title - flexible to take available space
                          Flexible(
                            flex: 2,
                            child: Text(
                              deal.title,
                              maxLines: isVeryCompact ? 1 : 2,
                              overflow: TextOverflow.ellipsis,
                              style: isCompact
                                  ? AppTypography.titleMedium.copyWith(fontSize: 13)
                                  : AppTypography.titleMedium,
                            ),
                          ),

                          SizedBox(height: isCompact ? 2 : 4),

                          // Promo Code Section
                          if (!isVeryCompact) _buildPromoCodeBanner(context, isCompact),

                          if (!isVeryCompact) SizedBox(height: isCompact ? 2 : 4),

                          // Price Section with savings
                          _buildPriceSection(isCompact),

                          SizedBox(height: isCompact ? 4 : 6),

                          // View Deal Button with integrated actions
                          _buildViewDealButtonWithActions(context, ref, isCompact),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  /// Build action buttons row with Save and Share buttons
  Widget _buildActionButtonsRow(WidgetRef ref) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        // Save button (heart)
        _buildCompactSaveButton(ref),
        const SizedBox(width: 8),
        // Share button
        ShareButton(deal: deal, size: ShareButtonSize.small),
      ],
    );
  }

  /// Build compact save button for action row
  Widget _buildCompactSaveButton(WidgetRef ref) {
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
            },
            child: Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isSaved ? AppColors.errorSurface : AppColors.surface,
                  shape: BoxShape.circle,
                  boxShadow: AppShadows.subtleShadow,
                  border: isSaved
                      ? Border.all(color: AppColors.error, width: 2)
                      : null,
                ),
                child: Icon(
                  isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  size: 18,
                  color: isSaved ? AppColors.error : AppColors.textMuted,
                ),
              ),
            ),
          ),
        );
      },
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
  Widget _buildDiscountBadge(double percentage, [bool isCompact = false]) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 6 : 8,
        vertical: isCompact ? 3 : 4,
      ),
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
        style: isCompact
            ? AppTypography.discountBadge.copyWith(fontSize: 10)
            : AppTypography.discountBadge,
      ),
    );
  }

  /// Build HOT badge with fire icon
  Widget _buildHotBadge([bool isCompact = false]) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 4 : 6,
        vertical: isCompact ? 2 : 3,
      ),
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
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.local_fire_department_rounded,
            size: isCompact ? 10 : 12,
            color: Colors.white,
          ),
          const SizedBox(width: 2),
          Text(
            'HOT',
            style: TextStyle(
              color: Colors.white,
              fontSize: isCompact ? 8 : 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Build retailer badge (Amazon, Walmart, etc.)
  Widget _buildRetailerBadge([bool isCompact = false]) {
    final retailerColors = _getRetailerColors(deal.retailer);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 6 : 8,
        vertical: isCompact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: retailerColors.$1,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getRetailerIcon(deal.retailer),
            size: isCompact ? 10 : 12,
            color: retailerColors.$2,
          ),
          const SizedBox(width: 4),
          Text(
            deal.retailer.toUpperCase(),
            style: TextStyle(
              color: retailerColors.$2,
              fontSize: isCompact ? 8 : 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  /// Get colors for retailer badge (background, text)
  (Color, Color) _getRetailerColors(String retailer) {
    switch (retailer.toUpperCase()) {
      case 'AMAZON':
        return (const Color(0xFFFF9900), Colors.black);
      case 'WALMART':
        return (const Color(0xFF0071CE), Colors.white);
      case 'TARGET':
        return (const Color(0xFFCC0000), Colors.white);
      case 'BESTBUY':
      case 'BEST BUY':
        return (const Color(0xFF0046BE), Colors.white);
      case 'EBAY':
        return (const Color(0xFFE53238), Colors.white);
      case 'COSTCO':
        return (const Color(0xFFE31837), Colors.white);
      default:
        return (AppColors.surfaceVariant, AppColors.textPrimary);
    }
  }

  /// Get icon for retailer
  IconData _getRetailerIcon(String retailer) {
    switch (retailer.toUpperCase()) {
      case 'AMAZON':
        return Icons.shopping_bag_rounded;
      case 'WALMART':
        return Icons.store_rounded;
      case 'TARGET':
        return Icons.gps_fixed_rounded;
      case 'BESTBUY':
      case 'BEST BUY':
        return Icons.devices_rounded;
      case 'EBAY':
        return Icons.local_shipping_rounded;
      case 'COSTCO':
        return Icons.warehouse_rounded;
      default:
        return Icons.storefront_rounded;
    }
  }

  /// Build verdict badge (BUY NOW, WAIT, PASS)
  Widget _buildVerdictBadge([bool isCompact = false]) {
    final verdictData = _getVerdictData(deal.verdict ?? '');

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 6 : 8,
        vertical: isCompact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: verdictData.$1,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        boxShadow: [
          BoxShadow(
            color: verdictData.$1.withOpacity(0.4),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            verdictData.$3,
            style: TextStyle(fontSize: isCompact ? 8 : 10),
          ),
          const SizedBox(width: 3),
          Text(
            verdictData.$2,
            style: TextStyle(
              color: Colors.white,
              fontSize: isCompact ? 7 : 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  /// Get verdict badge data (color, text, emoji)
  (Color, String, String) _getVerdictData(String verdict) {
    switch (verdict.toUpperCase()) {
      case 'BUY NOW':
      case 'BUY':
        return (const Color(0xFF059669), 'BUY NOW', '🟢');
      case 'WAIT':
        return (const Color(0xFFF59E0B), 'WAIT', '🟡');
      case 'PASS':
        return (const Color(0xFFDC2626), 'PASS', '🔴');
      default:
        return (AppColors.primary, verdict.toUpperCase(), '✨');
    }
  }

  /// Build save/heart button
  Widget _buildSaveButton(WidgetRef ref, [bool isCompact = false]) {
    return Consumer(
      builder: (context, ref, _) {
        final savedDeals = ref.watch(savedDealsProvider);
        final isSaved = savedDeals.any((d) => d.id == deal.id);

        final buttonSize = isCompact ? 36.0 : 44.0;
        final iconSize = isCompact ? 14.0 : 18.0;
        final padding = isCompact ? 6.0 : 8.0;

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
              width: buttonSize,
              height: buttonSize,
              alignment: Alignment.center,
              child: Container(
                padding: EdgeInsets.all(padding),
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
                  size: iconSize,
                  color: isSaved ? AppColors.error : AppColors.textDisabled,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  /// Build promo code banner for the middle section (only when promo exists)
  Widget _buildPromoCodeBanner(BuildContext context, [bool isCompact = false]) {
    final hasPromo = deal.couponCode != null || deal.promoDescription != null;

    if (!hasPromo) {
      // Return empty space when no promo code
      return const SizedBox.shrink();
    }

    return GestureDetector(
      onTap: () => _copyPromoCode(context),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isCompact ? 8 : 10,
          vertical: isCompact ? 4 : 6,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primarySurface,
              AppColors.primarySurface.withOpacity(0.7),
            ],
          ),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.primaryLight, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.local_offer_rounded,
              size: isCompact ? 12 : 14,
              color: AppColors.primary,
            ),
            SizedBox(width: isCompact ? 4 : 6),
            Flexible(
              child: Text(
                deal.couponCode ?? deal.promoDescription ?? 'PROMO',
                style: TextStyle(
                  fontSize: isCompact ? 10 : 12,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppColors.primaryDark,
                  letterSpacing: 0.5,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            SizedBox(width: isCompact ? 4 : 6),
            Container(
              padding: EdgeInsets.all(isCompact ? 2 : 3),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Icon(
                Icons.copy_rounded,
                size: isCompact ? 10 : 12,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build price section with current and original price (larger fonts)
  Widget _buildPriceSection([bool isCompact = false]) {
    final savings = deal.originalPrice - deal.price;
    final discountPercentage = _calculateDiscount();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              '\$${deal.price.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: isCompact ? 18 : 22,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
                letterSpacing: -0.5,
              ),
            ),
            SizedBox(width: isCompact ? 6 : 8),
            if (deal.originalPrice > deal.price)
              Flexible(
                child: Text(
                  '\$${deal.originalPrice.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: isCompact ? 11 : 14,
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
        ),
        // Savings row with percentage
        if (savings > 0)
          Padding(
            padding: EdgeInsets.only(top: isCompact ? 1 : 2),
            child: Row(
              children: [
                Icon(
                  Icons.savings_outlined,
                  size: isCompact ? 12 : 14,
                  color: AppColors.primary,
                ),
                SizedBox(width: isCompact ? 3 : 4),
                Flexible(
                  child: Text(
                    'Save \$${savings.toStringAsFixed(2)} (${discountPercentage.toStringAsFixed(0)}% off)',
                    style: TextStyle(
                      fontSize: isCompact ? 10 : 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  /// Build View Deal button - Primary CTA for driving affiliate clicks
  Widget _buildViewDealButton(BuildContext context) {
    return GestureDetector(
      onTap: () => _openDealLink(context),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.primaryLight],
          ),
          borderRadius: BorderRadius.circular(AppRadius.md),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.open_in_new_rounded,
              size: 16,
              color: Colors.white,
            ),
            SizedBox(width: 6),
            Text(
              'View Deal',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build View Deal button with integrated action buttons (compact version)
  Widget _buildViewDealButtonWithActions(BuildContext context, WidgetRef ref, [bool isCompact = false]) {
    return Row(
      children: [
        // View Deal Button (takes most space)
        Expanded(
          child: GestureDetector(
            onTap: () => _openDealLink(context),
            child: Container(
              padding: EdgeInsets.symmetric(vertical: isCompact ? 8 : 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryLight],
                ),
                borderRadius: BorderRadius.circular(AppRadius.md),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.open_in_new_rounded,
                    size: isCompact ? 14 : 16,
                    color: Colors.white,
                  ),
                  SizedBox(width: isCompact ? 4 : 6),
                  Text(
                    'View Deal',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: isCompact ? 12 : 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        SizedBox(width: isCompact ? 6 : 8),
        // Save button
        Consumer(
          builder: (context, ref, _) {
            final savedDeals = ref.watch(savedDealsProvider);
            final isSaved = savedDeals.any((d) => d.id == deal.id);

            return GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                ref.read(savedDealsProvider.notifier).toggleSave(deal);
              },
              child: Container(
                width: isCompact ? 34 : 40,
                height: isCompact ? 34 : 40,
                decoration: BoxDecoration(
                  color: isSaved ? AppColors.errorSurface : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(
                    color: isSaved ? AppColors.error : AppColors.border,
                    width: 1.5,
                  ),
                ),
                child: Icon(
                  isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  size: isCompact ? 16 : 18,
                  color: isSaved ? AppColors.error : AppColors.textMuted,
                ),
              ),
            );
          },
        ),
        SizedBox(width: isCompact ? 4 : 6),
        // Share button
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            // Use the ShareButton logic
          },
          child: ShareButton(deal: deal, size: ShareButtonSize.small, isCompact: isCompact),
        ),
      ],
    );
  }

  /// Open deal affiliate link in browser
  /// Automatically copies coupon code to clipboard before opening the link
  Future<void> _openDealLink(BuildContext context) async {
    HapticFeedback.mediumImpact();

    // Auto-copy coupon code to clipboard if available
    final couponCode = deal.couponCode ?? deal.promoDescription;
    if (couponCode != null && couponCode.isNotEmpty) {
      await Clipboard.setData(ClipboardData(text: couponCode));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(child: Text('Coupon "$couponCode" copied! Opening deal...')),
              ],
            ),
            duration: const Duration(seconds: 2),
            backgroundColor: const Color(0xFF4CAF50),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
        );
      }
    }

    final url = deal.affiliateLink;
    if (url.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Deal link not available'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
        );
      }
      return;
    }

    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Could not open deal link'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('[DealCard] Error opening link: $e');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Error opening deal link'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
        );
      }
    }
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
