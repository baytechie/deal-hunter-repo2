/// NotificationType Enum - Types of notifications in the system
enum NotificationType {
  newDeal,
  priceDrop,
  priceIncrease;

  /// Convert from API string to enum
  static NotificationType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'NEW_DEAL':
        return NotificationType.newDeal;
      case 'PRICE_DROP':
        return NotificationType.priceDrop;
      case 'PRICE_INCREASE':
        return NotificationType.priceIncrease;
      default:
        return NotificationType.newDeal;
    }
  }

  /// Convert enum to API string
  String toApiString() {
    switch (this) {
      case NotificationType.newDeal:
        return 'NEW_DEAL';
      case NotificationType.priceDrop:
        return 'PRICE_DROP';
      case NotificationType.priceIncrease:
        return 'PRICE_INCREASE';
    }
  }
}

/// AppNotification Entity - Represents a notification in the domain layer
///
/// This is a pure data class with no dependencies on external frameworks.
/// Named AppNotification to avoid conflict with Flutter's Notification class.
class AppNotification {
  /// Unique identifier for the notification
  final String id;

  /// Type of notification (new deal, price drop, price increase)
  final NotificationType type;

  /// Notification title
  final String title;

  /// Notification message/body
  final String message;

  /// Associated deal ID (optional)
  final String? dealId;

  /// Previous price (for price changes)
  final double? oldPrice;

  /// New/current price
  final double? newPrice;

  /// Deal image URL
  final String? imageUrl;

  /// When the notification was created
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.dealId,
    this.oldPrice,
    this.newPrice,
    this.imageUrl,
    required this.createdAt,
  });

  /// Check if notification is related to a deal
  bool get hasDeal => dealId != null;

  /// Check if this is a price change notification
  bool get isPriceChange =>
      type == NotificationType.priceDrop || type == NotificationType.priceIncrease;

  /// Get human-readable time ago string
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 0) {
      if (difference.inDays == 1) return 'Yesterday';
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      if (difference.inHours == 1) return '1 hour ago';
      return '${difference.inHours} hours ago';
    } else if (difference.inMinutes > 0) {
      if (difference.inMinutes == 1) return '1 minute ago';
      return '${difference.inMinutes} minutes ago';
    } else {
      return 'Just now';
    }
  }

  AppNotification copyWith({
    String? id,
    NotificationType? type,
    String? title,
    String? message,
    String? dealId,
    double? oldPrice,
    double? newPrice,
    String? imageUrl,
    DateTime? createdAt,
  }) {
    return AppNotification(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      dealId: dealId ?? this.dealId,
      oldPrice: oldPrice ?? this.oldPrice,
      newPrice: newPrice ?? this.newPrice,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() {
    return 'AppNotification(id: $id, type: $type, title: $title)';
  }
}
