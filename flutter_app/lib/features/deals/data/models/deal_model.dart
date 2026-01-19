import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// PriceTrend Data Model for JSON serialization
class PriceTrendModel extends PriceTrend {
  const PriceTrendModel({
    required super.percentChange,
    required super.averagePrice,
    required super.trendDescription,
  });

  factory PriceTrendModel.fromJson(Map<String, dynamic> json) {
    return PriceTrendModel(
      percentChange: (json['percentChange'] as num?)?.toDouble() ?? 0.0,
      averagePrice: (json['averagePrice'] as num?)?.toDouble() ?? 0.0,
      trendDescription: json['trendDescription'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'percentChange': percentChange,
      'averagePrice': averagePrice,
      'trendDescription': trendDescription,
    };
  }

  PriceTrend toDomain() => PriceTrend(
        percentChange: percentChange,
        averagePrice: averagePrice,
        trendDescription: trendDescription,
      );
}

/// Deal Data Model for JSON serialization
///
/// Extends Deal entity with JSON serialization capabilities.
/// Separates network/storage concerns from domain logic.
///
/// Why: Models handle JSON (de)serialization from the API/database.
/// Domain entities remain framework-agnostic. This keeps serialization
/// logic in one place and makes testing easier.
class DealModel extends Deal {
  const DealModel({
    required super.id,
    required super.title,
    required super.description,
    required super.price,
    required super.originalPrice,
    required super.discountPercentage,
    required super.imageUrl,
    required super.affiliateLink,
    required super.isHot,
    required super.isFeatured,
    required super.category,
    super.expiryDate,
    required super.createdAt,
    required super.updatedAt,
    // New fields for flip card
    super.couponCode,
    super.promoDescription,
    super.retailer,
    super.verdict,
    super.shouldYouWaitAnalysis,
    super.priceTrend,
    super.bulletPoints,
    super.likes,
    super.comments,
  });

  /// Factory constructor to create DealModel from JSON
  ///
  /// Handles the conversion from API response JSON to DealModel
  /// Provides default values for optional/missing fields
  factory DealModel.fromJson(Map<String, dynamic> json) {
    // Parse bullet points from description or dedicated field
    List<String> parsedBulletPoints = [];
    if (json['bulletPoints'] != null) {
      parsedBulletPoints = (json['bulletPoints'] as List<dynamic>)
          .map((e) => e.toString())
          .toList();
    } else if (json['description'] != null) {
      // Extract bullet points from description if not provided separately
      final desc = json['description'] as String;
      parsedBulletPoints = _extractBulletPoints(desc);
    }

    // Parse price trend if available
    PriceTrendModel? priceTrendModel;
    if (json['priceTrend'] != null) {
      priceTrendModel =
          PriceTrendModel.fromJson(json['priceTrend'] as Map<String, dynamic>);
    }

    return DealModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      price: _parseDouble(json['price']),
      originalPrice: _parseDouble(json['originalPrice']),
      discountPercentage: _parseDouble(json['discountPercentage']),
      imageUrl: json['imageUrl'] as String? ?? '',
      affiliateLink: json['affiliateLink'] as String,
      isHot: json['isHot'] as bool? ?? false,
      isFeatured: json['isFeatured'] as bool? ?? false,
      category: json['category'] as String,
      expiryDate: json['expiryDate'] != null
          ? DateTime.parse(json['expiryDate'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      // New fields for flip card
      couponCode: json['couponCode'] as String?,
      promoDescription: json['promoDescription'] as String?,
      retailer: json['retailer'] as String? ?? 'AMAZON',
      verdict: json['verdict'] as String?,
      shouldYouWaitAnalysis: json['shouldYouWaitAnalysis'] as String?,
      priceTrend: priceTrendModel,
      bulletPoints: parsedBulletPoints,
      likes: json['likes'] as int? ?? 0,
      comments: json['comments'] as int? ?? 0,
    );
  }

  /// Helper to parse double from either String or num
  /// PostgreSQL decimal columns return strings to preserve precision
  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  /// Helper to extract bullet points from description text
  static List<String> _extractBulletPoints(String description) {
    if (description.isEmpty) return [];

    // Split by common bullet patterns or sentences
    final lines = description
        .split(RegExp(r'[.•\n]'))
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty && s.length > 10)
        .take(5)
        .toList();

    return lines;
  }

  /// Convert DealModel to JSON for sending to API
  ///
  /// Returns: JSON representation of the deal
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'originalPrice': originalPrice,
      'discountPercentage': discountPercentage,
      'imageUrl': imageUrl,
      'affiliateLink': affiliateLink,
      'isHot': isHot,
      'isFeatured': isFeatured,
      'category': category,
      'expiryDate': expiryDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      // New fields for flip card
      'couponCode': couponCode,
      'promoDescription': promoDescription,
      'retailer': retailer,
      'verdict': verdict,
      'shouldYouWaitAnalysis': shouldYouWaitAnalysis,
      'priceTrend': priceTrend != null
          ? {
              'percentChange': priceTrend!.percentChange,
              'averagePrice': priceTrend!.averagePrice,
              'trendDescription': priceTrend!.trendDescription,
            }
          : null,
      'bulletPoints': bulletPoints,
      'likes': likes,
      'comments': comments,
    };
  }

  /// Convert DealModel to Deal entity
  ///
  /// Returns: Pure domain Deal entity
  Deal toDomain() => Deal(
        id: id,
        title: title,
        description: description,
        price: price,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage,
        imageUrl: imageUrl,
        affiliateLink: affiliateLink,
        expiryDate: expiryDate,
        isHot: isHot,
        isFeatured: isFeatured,
        category: category,
        createdAt: createdAt,
        updatedAt: updatedAt,
        couponCode: couponCode,
        promoDescription: promoDescription,
        retailer: retailer,
        verdict: verdict,
        shouldYouWaitAnalysis: shouldYouWaitAnalysis,
        priceTrend: priceTrend,
        bulletPoints: bulletPoints,
        likes: likes,
        comments: comments,
      );
}
