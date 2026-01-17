/// Flutter Deal Entity
/// 
/// Represents a single deal in the domain layer.
/// This is a pure data class with no dependencies on external frameworks.
/// 
/// Why: Entities are the core business objects that represent concepts in the domain.
/// They should be independent of any framework or implementation details.
class Deal {
  /// Unique identifier for the deal
  final String id;

  /// Deal title/name
  final String title;

  /// Detailed description of the deal
  final String description;

  /// Current sale price
  final double price;

  /// Original price before discount
  final double originalPrice;

  /// Discount percentage calculated from prices
  final double discountPercentage;

  /// URL to the deal image
  final String imageUrl;

  /// Affiliate link to the product (with Amazon Associate tag)
  final String affiliateLink;

  /// When the deal expires (optional)
  final DateTime? expiryDate;

  /// Whether this is a hot/trending deal
  final bool isHot;

  /// Whether this deal is featured on home page
  final bool isFeatured;

  /// Category of the deal (e.g., Electronics, Fashion, etc.)
  final String category;

  /// When the deal was created
  final DateTime createdAt;

  /// When the deal was last updated
  final DateTime updatedAt;

  /// Constructor with all required parameters
  const Deal({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.originalPrice,
    required this.discountPercentage,
    required this.imageUrl,
    required this.affiliateLink,
    this.expiryDate,
    required this.isHot,
    required this.isFeatured,
    required this.category,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Calculate the savings amount
  /// 
  /// Returns: Absolute savings in currency units
  double get savings => originalPrice - price;

  /// Check if the deal has expired
  /// 
  /// Returns: true if expiry date is in the past
  bool get isExpired {
    if (expiryDate == null) return false;
    return expiryDate!.isBefore(DateTime.now());
  }

  /// Copy constructor for immutability patterns
  /// 
  /// Allows creating a new instance with some properties changed
  Deal copyWith({
    String? id,
    String? title,
    String? description,
    double? price,
    double? originalPrice,
    double? discountPercentage,
    String? imageUrl,
    String? affiliateLink,
    DateTime? expiryDate,
    bool? isHot,
    bool? isFeatured,
    String? category,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Deal(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      discountPercentage: discountPercentage ?? this.discountPercentage,
      imageUrl: imageUrl ?? this.imageUrl,
      affiliateLink: affiliateLink ?? this.affiliateLink,
      expiryDate: expiryDate ?? this.expiryDate,
      isHot: isHot ?? this.isHot,
      isFeatured: isFeatured ?? this.isFeatured,
      category: category ?? this.category,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'Deal(id: $id, title: $title, price: $price, discount: $discountPercentage%)';
  }
}
