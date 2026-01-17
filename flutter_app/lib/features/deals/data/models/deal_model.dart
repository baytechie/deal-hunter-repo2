import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

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
  });

  /// Factory constructor to create DealModel from JSON
  /// 
  /// Handles the conversion from API response JSON to DealModel
  /// Provides default values for optional/missing fields
  factory DealModel.fromJson(Map<String, dynamic> json) {
    return DealModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      price: (json['price'] as num).toDouble(),
      originalPrice: (json['originalPrice'] as num).toDouble(),
      discountPercentage: (json['discountPercentage'] as num).toDouble(),
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
    );
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
  );
}
