import 'package:money_saver_deals/features/notifications/domain/entities/app_notification.dart';

/// NotificationModel - Data model for JSON serialization
///
/// Extends AppNotification entity with JSON serialization capabilities.
/// Separates network/storage concerns from domain logic.
class NotificationModel extends AppNotification {
  const NotificationModel({
    required super.id,
    required super.type,
    required super.title,
    required super.message,
    super.dealId,
    super.oldPrice,
    super.newPrice,
    super.imageUrl,
    required super.createdAt,
  });

  /// Factory constructor to create NotificationModel from JSON
  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      type: NotificationType.fromString(json['type'] as String),
      title: json['title'] as String,
      message: json['message'] as String,
      dealId: json['dealId'] as String?,
      oldPrice: _parseDouble(json['oldPrice']),
      newPrice: _parseDouble(json['newPrice']),
      imageUrl: json['imageUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Helper to parse double from either String or num
  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  /// Convert NotificationModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toApiString(),
      'title': title,
      'message': message,
      'dealId': dealId,
      'oldPrice': oldPrice,
      'newPrice': newPrice,
      'imageUrl': imageUrl,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  /// Convert NotificationModel to domain entity
  AppNotification toDomain() => AppNotification(
        id: id,
        type: type,
        title: title,
        message: message,
        dealId: dealId,
        oldPrice: oldPrice,
        newPrice: newPrice,
        imageUrl: imageUrl,
        createdAt: createdAt,
      );
}
