import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/core/services/share_service.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// ShareBottomSheet - Modal sheet with share options
///
/// Displays deal preview and share options including:
/// - Copy link
/// - Twitter
/// - Facebook
/// - WhatsApp
/// - Native share (More)
class ShareBottomSheet extends StatelessWidget {
  final Deal deal;
  final VoidCallback? onShareComplete;

  const ShareBottomSheet({
    super.key,
    required this.deal,
    this.onShareComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag handle
              _buildDragHandle(),
              const SizedBox(height: 16),

              // Header
              _buildHeader(context),
              const SizedBox(height: 20),

              // Deal preview
              _buildDealPreview(),
              const SizedBox(height: 20),

              // Share options
              _buildShareOptions(context),
              const SizedBox(height: 16),

              // Share link preview
              _buildLinkPreview(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDragHandle() {
    return Container(
      width: 40,
      height: 4,
      decoration: BoxDecoration(
        color: AppColors.border,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Share this deal',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.close,
              size: 18,
              color: AppColors.textMuted,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDealPreview() {
    final discountPercentage = deal.discountPercentage.toStringAsFixed(0);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: deal.imageUrl.isNotEmpty
                ? Image.network(
                    deal.imageUrl,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildPlaceholder(),
                  )
                : _buildPlaceholder(),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  deal.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.titleMedium,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      '\$${deal.price.toStringAsFixed(2)}',
                      style: AppTypography.priceLarge.copyWith(fontSize: 16),
                    ),
                    const SizedBox(width: 8),
                    if (deal.originalPrice > deal.price) ...[
                      Text(
                        '\$${deal.originalPrice.toStringAsFixed(2)}',
                        style: AppTypography.priceOriginal,
                      ),
                      const SizedBox(width: 8),
                      _buildSmallDiscountBadge(discountPercentage),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: 56,
      height: 56,
      color: AppColors.border,
      child: const Icon(
        Icons.local_offer_rounded,
        color: AppColors.textDisabled,
      ),
    );
  }

  Widget _buildSmallDiscountBadge(String percentage) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.error,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        '-$percentage%',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildShareOptions(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _ShareOption(
            icon: Icons.link_rounded,
            label: 'Copy Link',
            backgroundColor: AppColors.primarySurface,
            iconColor: AppColors.primary,
            onTap: () => _copyLink(context),
          ),
          const SizedBox(width: 16),
          _ShareOption(
            icon: Icons.alternate_email,
            label: 'Twitter',
            backgroundColor: const Color(0xFF1DA1F2).withOpacity(0.1),
            iconColor: const Color(0xFF1DA1F2),
            onTap: () => _shareToTwitter(context),
          ),
          const SizedBox(width: 16),
          _ShareOption(
            icon: Icons.facebook_rounded,
            label: 'Facebook',
            backgroundColor: const Color(0xFF1877F2).withOpacity(0.1),
            iconColor: const Color(0xFF1877F2),
            onTap: () => _shareToFacebook(context),
          ),
          const SizedBox(width: 16),
          _ShareOption(
            icon: Icons.chat_bubble_rounded,
            label: 'WhatsApp',
            backgroundColor: const Color(0xFF25D366).withOpacity(0.1),
            iconColor: const Color(0xFF25D366),
            onTap: () => _shareToWhatsApp(context),
          ),
          const SizedBox(width: 16),
          _ShareOption(
            icon: Icons.more_horiz,
            label: 'More',
            backgroundColor: AppColors.surfaceVariant,
            iconColor: AppColors.textSecondary,
            onTap: () => _openNativeShare(context),
          ),
        ],
      ),
    );
  }

  Widget _buildLinkPreview() {
    final url = ShareService.generateShareUrl(deal);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.link,
            size: 16,
            color: AppColors.textMuted,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              url,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _copyLink(BuildContext context) async {
    final success = await ShareService.copyDealLink(deal);
    if (context.mounted) {
      Navigator.of(context).pop();
      _showSnackBar(
        context,
        success ? 'Link copied to clipboard' : 'Failed to copy link',
        success ? Icons.check_circle : Icons.error_outline,
        success ? AppColors.primary : AppColors.error,
      );
      if (success) onShareComplete?.call();
    }
  }

  Future<void> _shareToTwitter(BuildContext context) async {
    final url = ShareService.getTwitterShareUrl(deal);
    await _launchUrl(context, url);
  }

  Future<void> _shareToFacebook(BuildContext context) async {
    final url = ShareService.getFacebookShareUrl(deal);
    await _launchUrl(context, url);
  }

  Future<void> _shareToWhatsApp(BuildContext context) async {
    final url = ShareService.getWhatsAppShareUrl(deal);
    await _launchUrl(context, url);
  }

  Future<void> _launchUrl(BuildContext context, String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (context.mounted) {
          Navigator.of(context).pop();
          onShareComplete?.call();
        }
      } else {
        if (context.mounted) {
          _showSnackBar(
            context,
            'Could not open app',
            Icons.error_outline,
            AppColors.error,
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(
          context,
          'Error sharing deal',
          Icons.error_outline,
          AppColors.error,
        );
      }
    }
  }

  Future<void> _openNativeShare(BuildContext context) async {
    try {
      await ShareService.shareDeal(deal);
      if (context.mounted) {
        Navigator.of(context).pop();
        onShareComplete?.call();
      }
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(
          context,
          'Error sharing deal',
          Icons.error_outline,
          AppColors.error,
        );
      }
    }
  }

  void _showSnackBar(
    BuildContext context,
    String message,
    IconData icon,
    Color color,
  ) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

/// Individual share option button
class _ShareOption extends StatefulWidget {
  final IconData icon;
  final String label;
  final Color backgroundColor;
  final Color iconColor;
  final VoidCallback onTap;

  const _ShareOption({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.iconColor,
    required this.onTap,
  });

  @override
  State<_ShareOption> createState() => _ShareOptionState();
}

class _ShareOptionState extends State<_ShareOption> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            AnimatedScale(
              scale: _isPressed ? 0.95 : 1.0,
              duration: const Duration(milliseconds: 100),
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: widget.backgroundColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  widget.icon,
                  size: 24,
                  color: widget.iconColor,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.label,
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
