import 'package:money_saver_deals/features/rss_feed/domain/entities/rss_feed_deal.dart';

/// RSS Feed Source Model for JSON serialization
class RssFeedSourceModel extends RssFeedSource {
  const RssFeedSourceModel({
    required super.id,
    required super.name,
    required super.url,
    super.description,
    required super.category,
  });

  factory RssFeedSourceModel.fromJson(Map<String, dynamic> json) {
    return RssFeedSourceModel(
      id: json['id'] as String,
      name: json['name'] as String,
      url: json['url'] as String,
      description: json['description'] as String?,
      category: json['category'] as String? ?? 'General',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'url': url,
      'description': description,
      'category': category,
    };
  }

  RssFeedSource toDomain() => RssFeedSource(
        id: id,
        name: name,
        url: url,
        description: description,
        category: category,
      );
}

/// RSS Feed Deal Model for JSON serialization
///
/// Extends RssFeedDeal entity with JSON serialization capabilities.
class RssFeedDealModel extends RssFeedDeal {
  const RssFeedDealModel({
    required super.id,
    required super.title,
    super.description,
    required super.link,
    required super.guid,
    super.imageUrl,
    required super.category,
    super.price,
    super.originalPrice,
    super.discountPercentage,
    super.store,
    super.couponCode,
    super.publishedAt,
    super.expiresAt,
    required super.isHot,
    required super.isFeatured,
    required super.viewCount,
    required super.clickCount,
    super.source,
    required super.createdAt,
  });

  factory RssFeedDealModel.fromJson(Map<String, dynamic> json) {
    RssFeedSourceModel? sourceModel;
    if (json['source'] != null) {
      sourceModel = RssFeedSourceModel.fromJson(json['source'] as Map<String, dynamic>);
    }

    return RssFeedDealModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      link: json['link'] as String,
      guid: json['guid'] as String,
      imageUrl: json['imageUrl'] as String?,
      category: json['category'] as String? ?? 'General',
      price: _parseDouble(json['price']),
      originalPrice: _parseDouble(json['originalPrice']),
      discountPercentage: _parseDouble(json['discountPercentage']),
      store: json['store'] as String?,
      couponCode: json['couponCode'] as String?,
      publishedAt: json['publishedAt'] != null
          ? DateTime.parse(json['publishedAt'] as String)
          : null,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
      isHot: json['isHot'] as bool? ?? false,
      isFeatured: json['isFeatured'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
      clickCount: json['clickCount'] as int? ?? 0,
      source: sourceModel,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  /// Helper to parse double from either String or num
  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'link': link,
      'guid': guid,
      'imageUrl': imageUrl,
      'category': category,
      'price': price,
      'originalPrice': originalPrice,
      'discountPercentage': discountPercentage,
      'store': store,
      'couponCode': couponCode,
      'publishedAt': publishedAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'isHot': isHot,
      'isFeatured': isFeatured,
      'viewCount': viewCount,
      'clickCount': clickCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  RssFeedDeal toDomain() => RssFeedDeal(
        id: id,
        title: title,
        description: description,
        link: link,
        guid: guid,
        imageUrl: imageUrl,
        category: category,
        price: price,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage,
        store: store,
        couponCode: couponCode,
        publishedAt: publishedAt,
        expiresAt: expiresAt,
        isHot: isHot,
        isFeatured: isFeatured,
        viewCount: viewCount,
        clickCount: clickCount,
        source: source,
        createdAt: createdAt,
      );
}
