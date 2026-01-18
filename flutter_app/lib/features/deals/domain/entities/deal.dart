/// Price trend data for deal analysis
///
/// Contains historical price information to help users decide
/// whether to buy now or wait.
class PriceTrend {
  /// Percentage change from average (negative means lower than avg)
  final double percentChange;

  /// Average price over the tracking period
  final double averagePrice;

  /// Human-readable trend description (e.g., "8% lower than avg")
  final String trendDescription;

  const PriceTrend({
    required this.percentChange,
    required this.averagePrice,
    required this.trendDescription,
  });

  /// Check if current price is below average
  bool get isBelowAverage => percentChange < 0;

  PriceTrend copyWith({
    double? percentChange,
    double? averagePrice,
    String? trendDescription,
  }) {
    return PriceTrend(
      percentChange: percentChange ?? this.percentChange,
      averagePrice: averagePrice ?? this.averagePrice,
      trendDescription: trendDescription ?? this.trendDescription,
    );
  }
}

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

  // ============ NEW FIELDS FOR FLIP CARD DESIGN ============

  /// Coupon code if available (e.g., "SAVE20NOW")
  final String? couponCode;

  /// Retailer name (e.g., "AMAZON", "WALMART", "EBAY")
  final String retailer;

  /// AI verdict for the deal ("BUY NOW", "WAIT", "PASS")
  final String? verdict;

  /// Analysis of whether user should wait for better price
  final String? shouldYouWaitAnalysis;

  /// Price trend data for historical analysis
  final PriceTrend? priceTrend;

  /// Bullet point features/highlights of the product
  final List<String> bulletPoints;

  /// Number of likes/upvotes
  final int likes;

  /// Number of comments
  final int comments;

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
    // New fields for flip card
    this.couponCode,
    this.retailer = 'AMAZON',
    this.verdict,
    this.shouldYouWaitAnalysis,
    this.priceTrend,
    this.bulletPoints = const [],
    this.likes = 0,
    this.comments = 0,
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
    String? couponCode,
    String? retailer,
    String? verdict,
    String? shouldYouWaitAnalysis,
    PriceTrend? priceTrend,
    List<String>? bulletPoints,
    int? likes,
    int? comments,
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
      couponCode: couponCode ?? this.couponCode,
      retailer: retailer ?? this.retailer,
      verdict: verdict ?? this.verdict,
      shouldYouWaitAnalysis: shouldYouWaitAnalysis ?? this.shouldYouWaitAnalysis,
      priceTrend: priceTrend ?? this.priceTrend,
      bulletPoints: bulletPoints ?? this.bulletPoints,
      likes: likes ?? this.likes,
      comments: comments ?? this.comments,
    );
  }

  @override
  String toString() {
    return 'Deal(id: $id, title: $title, price: $price, discount: $discountPercentage%)';
  }
}
