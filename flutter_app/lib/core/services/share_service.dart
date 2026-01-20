import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';

/// Share Service - Handles sharing deals across different platforms
///
/// Why: Centralized sharing logic with UTM tracking for analytics.
/// Supports native share sheet, clipboard copy, and direct social media links.
class ShareService {
  static const String _logContext = 'ShareService';

  /// Base URL for shared deals
  static const String _baseShareUrl = 'https://huntdeals.app/deal';

  /// UTM parameters for tracking
  static const String _utmSource = 'app';
  static const String _utmMedium = 'share';

  /// Generate shareable URL with UTM tracking
  ///
  /// Parameters:
  /// - [deal]: The deal to generate URL for
  /// - [campaign]: Optional campaign name (defaults to 'general')
  static String generateShareUrl(Deal deal, {String campaign = 'general'}) {
    final utmParams = 'utm_source=$_utmSource&utm_medium=$_utmMedium&utm_campaign=$campaign';
    return '$_baseShareUrl/${deal.id}?$utmParams';
  }

  /// Generate share text for a deal
  ///
  /// Format: "[Deal Title] - [Current Price] (was [Original Price]) - [Discount]% OFF! [URL]"
  static String generateShareText(Deal deal) {
    final discount = deal.discountPercentage.toStringAsFixed(0);
    final url = generateShareUrl(deal);

    final buffer = StringBuffer();
    buffer.write(deal.title);
    buffer.write('\n\n');
    buffer.write('\$${deal.price.toStringAsFixed(2)}');

    if (deal.originalPrice > deal.price) {
      buffer.write(' (was \$${deal.originalPrice.toStringAsFixed(2)})');
      buffer.write(' - $discount% OFF!');
    }

    buffer.write('\n\n');
    buffer.write(url);

    return buffer.toString();
  }

  /// Share deal using native share sheet
  ///
  /// Returns: ShareResult indicating the outcome
  static Future<ShareResult> shareDeal(Deal deal) async {
    logger.debug('Sharing deal: ${deal.id}', context: _logContext);

    try {
      final shareText = generateShareText(deal);

      final result = await Share.shareWithResult(
        shareText,
        subject: deal.title,
      );

      logger.info(
        'Share completed: status=${result.status}, raw=${result.raw}',
        context: _logContext,
      );

      return result;
    } catch (e) {
      logger.warning(
        'Share failed: $e',
        context: _logContext,
      );
      rethrow;
    }
  }

  /// Copy deal link to clipboard
  ///
  /// Returns: true if successful
  static Future<bool> copyDealLink(Deal deal) async {
    logger.debug('Copying link for deal: ${deal.id}', context: _logContext);

    try {
      final url = generateShareUrl(deal, campaign: 'copy_link');
      await Clipboard.setData(ClipboardData(text: url));

      logger.info('Link copied successfully', context: _logContext);
      return true;
    } catch (e) {
      logger.warning('Failed to copy link: $e', context: _logContext);
      return false;
    }
  }

  /// Generate Twitter share URL
  static String getTwitterShareUrl(Deal deal) {
    final text = Uri.encodeComponent(generateShareText(deal));
    return 'https://twitter.com/intent/tweet?text=$text';
  }

  /// Generate Facebook share URL
  static String getFacebookShareUrl(Deal deal) {
    final url = Uri.encodeComponent(generateShareUrl(deal, campaign: 'facebook'));
    return 'https://www.facebook.com/sharer/sharer.php?u=$url';
  }

  /// Generate WhatsApp share URL
  static String getWhatsAppShareUrl(Deal deal) {
    final text = Uri.encodeComponent(generateShareText(deal));
    return 'https://wa.me/?text=$text';
  }
}
