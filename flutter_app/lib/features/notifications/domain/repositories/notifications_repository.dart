import 'package:money_saver_deals/features/deals/domain/core/result.dart';
import 'package:money_saver_deals/features/notifications/domain/entities/app_notification.dart';

/// NotificationsRepository Interface - Dependency Inversion Principle
///
/// Defines the contract for notification data access.
/// Concrete implementations handle API communication.
abstract class NotificationsRepository {
  /// Fetch all recent notifications (last 7 days)
  Future<Result<List<AppNotification>>> getNotifications();

  /// Get unread notification count for badge
  Future<Result<int>> getUnreadCount();
}
