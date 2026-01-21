import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// DealCardBack - The detailed analysis view of a deal card
///
/// Shows: Verdict badge, price trend, should you wait analysis,
/// coupon code, bullet points, and buy button.
class DealCardBack extends StatelessWidget {
  final Deal deal;
  final VoidCallback onBuyPressed;
  final VoidCallback onCopyCoupon;
  final VoidCallback onFlipBack;

  const DealCardBack({
    super.key,
    required this.deal,
    required this.onBuyPressed,
    required this.onCopyCoupon,
    required this.onFlipBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top section with verdict and flip back
            _buildTopSection(context),

            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Price trend section
                    _buildPriceTrendSection(),

                    const SizedBox(height: 16),

                    // Should you wait section
                    _buildShouldWaitSection(),

                    const SizedBox(height: 16),

                    // Coupon section
                    if (deal.couponCode != null && deal.couponCode!.isNotEmpty)
                      _buildCouponSection(context),

                    const SizedBox(height: 16),

                    // Product details/bullet points
                    _buildDetailsSection(),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Buy button at bottom
            _buildBuyButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildTopSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Verdict badge
          _buildVerdictBadge(),

          // Flip back button
          GestureDetector(
            onTap: onFlipBack,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.flip_to_front,
                color: Colors.grey[600],
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerdictBadge() {
    final verdict = deal.verdict ?? 'BUY NOW';
    Color badgeColor;
    IconData badgeIcon;

    switch (verdict.toUpperCase()) {
      case 'BUY NOW':
        badgeColor = const Color(0xFF4CAF50);
        badgeIcon = Icons.check_circle;
        break;
      case 'WAIT':
        badgeColor = const Color(0xFFFFC107);
        badgeIcon = Icons.access_time;
        break;
      case 'PASS':
        badgeColor = const Color(0xFFFF5722);
        badgeIcon = Icons.cancel;
        break;
      default:
        badgeColor = const Color(0xFF4CAF50);
        badgeIcon = Icons.check_circle;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(25),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(badgeIcon, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Text(
            verdict.toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceTrendSection() {
    final priceTrend = deal.priceTrend;
    final percentChange = priceTrend?.percentChange ?? -8.5;
    final isLower = percentChange < 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isLower ? Colors.green[50] : Colors.red[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLower ? Colors.green[200]! : Colors.red[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.trending_down,
                color: isLower ? Colors.green[700] : Colors.red[700],
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Price Trend (30 Days)',
                style: TextStyle(
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(
                '${isLower ? '' : '+'}${percentChange.abs().toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: isLower ? Colors.green[700] : Colors.red[700],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                isLower ? 'lower than avg' : 'higher than avg',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ],
          ),
          if (priceTrend != null && priceTrend.averagePrice > 0) ...[
            const SizedBox(height: 8),
            Text(
              'Average: \$${priceTrend.averagePrice.toStringAsFixed(2)}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 13,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildShouldWaitSection() {
    final analysis = deal.shouldYouWaitAnalysis ?? 'This is a good price. Best deal this month!';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb_outline, color: Colors.blue[700], size: 20),
              const SizedBox(width: 8),
              Text(
                'Should You Wait?',
                style: TextStyle(
                  color: Colors.blue[700],
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            analysis,
            style: TextStyle(
              color: Colors.grey[800],
              fontSize: 14,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5E8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_offer, color: Colors.green[700], size: 20),
              const SizedBox(width: 8),
              Text(
                'Coupon Code',
                style: TextStyle(
                  color: Colors.green[700],
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: Colors.green[300]!,
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: Text(
                    deal.couponCode!,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: deal.couponCode!));
                  onCopyCoupon();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Coupon code copied!'),
                      backgroundColor: Colors.green[700],
                      duration: const Duration(seconds: 2),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green[600],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.copy,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsSection() {
    final bulletPoints = deal.bulletPoints.isNotEmpty
        ? deal.bulletPoints
        : [
            'Premium quality product',
            'Fast shipping available',
            'Great customer reviews',
          ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.article_outlined, color: Colors.grey[700], size: 20),
            const SizedBox(width: 8),
            Text(
              'Product Details',
              style: TextStyle(
                color: Colors.grey[700],
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...bulletPoints.map((point) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: Colors.grey[600],
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      point,
                      style: TextStyle(
                        color: Colors.grey[800],
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildBuyButton(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: GestureDetector(
        onTap: () {
          // Auto-copy coupon code to clipboard if available
          final couponCode = deal.couponCode;
          if (couponCode != null && couponCode.isNotEmpty) {
            Clipboard.setData(ClipboardData(text: couponCode));
            HapticFeedback.mediumImpact();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Expanded(child: Text('Coupon "$couponCode" copied! Opening ${deal.retailer}...')),
                  ],
                ),
                backgroundColor: const Color(0xFF4CAF50),
                duration: const Duration(seconds: 2),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            );
          }
          onBuyPressed();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4CAF50), Color(0xFF45A049)],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF4CAF50).withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _getRetailerIcon(),
              const SizedBox(width: 12),
              Text(
                'BUY AT ${deal.retailer.toUpperCase()}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                '\u2022',
                style: TextStyle(color: Colors.white70),
              ),
              const SizedBox(width: 8),
              Text(
                '\$${deal.price.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _getRetailerIcon() {
    switch (deal.retailer.toUpperCase()) {
      case 'AMAZON':
        return const Icon(Icons.shopping_cart, color: Colors.white, size: 22);
      case 'WALMART':
        return const Icon(Icons.store, color: Colors.white, size: 22);
      case 'EBAY':
        return const Icon(Icons.local_mall, color: Colors.white, size: 22);
      default:
        return const Icon(Icons.link, color: Colors.white, size: 22);
    }
  }
}
