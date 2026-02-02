/// RSS Feed Deal Entity
///
/// Represents a deal crawled from an RSS feed in the domain layer.
/// This is a pure data class with no dependencies on external frameworks.
class RssFeedDeal {
  /// Unique identifier for the deal
  final String id;

  /// Deal title
  final String title;

  /// Detailed description
  final String? description;

  /// Link to the original deal page
  final String link;

  /// Unique identifier from the RSS feed
  final String guid;

  /// URL to the deal image
  final String? imageUrl;

  /// Deal category (e.g., Electronics, Fashion)
  final String category;

  /// Current sale price
  final double? price;

  /// Original price before discount
  final double? originalPrice;

  /// Discount percentage
  final double? discountPercentage;

  /// Store/retailer name (e.g., Amazon, Walmart)
  final String? store;

  /// Coupon code if available
  final String? couponCode;

  /// When the deal was published in the feed
  final DateTime? publishedAt;

  /// When the deal expires
  final DateTime? expiresAt;

  /// Whether this is a hot/trending deal
  final bool isHot;

  /// Whether this deal is featured
  final bool isFeatured;

  /// Number of views
  final int viewCount;

  /// Number of clicks
  final int clickCount;

  /// Source feed information
  final RssFeedSource? source;

  /// When the deal was crawled
  final DateTime createdAt;

  const RssFeedDeal({
    required this.id,
    required this.title,
    this.description,
    required this.link,
    required this.guid,
    this.imageUrl,
    required this.category,
    this.price,
    this.originalPrice,
    this.discountPercentage,
    this.store,
    this.couponCode,
    this.publishedAt,
    this.expiresAt,
    required this.isHot,
    required this.isFeatured,
    required this.viewCount,
    required this.clickCount,
    this.source,
    required this.createdAt,
  });

  /// Calculate savings amount if prices are available
  double? get savings {
    if (originalPrice != null && price != null) {
      return originalPrice! - price!;
    }
    return null;
  }

  /// Check if the deal has expired
  bool get isExpired {
    if (expiresAt == null) return false;
    return expiresAt!.isBefore(DateTime.now());
  }

  /// Get a human-readable time ago string
  String get timeAgo {
    final now = DateTime.now();
    final publishDate = publishedAt ?? createdAt;
    final difference = now.difference(publishDate);

    if (difference.inDays > 0) {
      final days = difference.inDays;
      if (days == 1) return 'Yesterday';
      if (days < 7) return '$days days ago';
      if (days < 30) return '${(days / 7).floor()} weeks ago';
      return '${(days / 30).floor()} months ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  /// Get badge text based on deal properties
  String? get badgeText {
    if (isHot) return 'Hot Deal';
    if (isFeatured) return 'Featured';
    if (discountPercentage != null && discountPercentage! >= 50) return 'Popular';
    return null;
  }

  RssFeedDeal copyWith({
    String? id,
    String? title,
    String? description,
    String? link,
    String? guid,
    String? imageUrl,
    String? category,
    double? price,
    double? originalPrice,
    double? discountPercentage,
    String? store,
    String? couponCode,
    DateTime? publishedAt,
    DateTime? expiresAt,
    bool? isHot,
    bool? isFeatured,
    int? viewCount,
    int? clickCount,
    RssFeedSource? source,
    DateTime? createdAt,
  }) {
    return RssFeedDeal(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      link: link ?? this.link,
      guid: guid ?? this.guid,
      imageUrl: imageUrl ?? this.imageUrl,
      category: category ?? this.category,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      discountPercentage: discountPercentage ?? this.discountPercentage,
      store: store ?? this.store,
      couponCode: couponCode ?? this.couponCode,
      publishedAt: publishedAt ?? this.publishedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      isHot: isHot ?? this.isHot,
      isFeatured: isFeatured ?? this.isFeatured,
      viewCount: viewCount ?? this.viewCount,
      clickCount: clickCount ?? this.clickCount,
      source: source ?? this.source,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

/// RSS Feed Source Entity
///
/// Represents an RSS feed source from which deals are crawled.
class RssFeedSource {
  final String id;
  final String name;
  final String url;
  final String? description;
  final String category;

  const RssFeedSource({
    required this.id,
    required this.name,
    required this.url,
    this.description,
    required this.category,
  });

  RssFeedSource copyWith({
    String? id,
    String? name,
    String? url,
    String? description,
    String? category,
  }) {
    return RssFeedSource(
      id: id ?? this.id,
      name: name ?? this.name,
      url: url ?? this.url,
      description: description ?? this.description,
      category: category ?? this.category,
    );
  }
}
