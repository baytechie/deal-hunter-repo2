import 'package:money_saver_deals/features/deals/domain/core/result.dart';
import 'package:money_saver_deals/features/notifications/domain/entities/app_notification.dart';
import 'package:money_saver_deals/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';

/// NotificationsRepositoryImpl - Concrete implementation of NotificationsRepository
///
/// SOLID Principles Applied:
/// - Single Responsibility: Only handles notification data operations
/// - Liskov Substitution: Implements NotificationsRepository interface
class NotificationsRepositoryImpl implements NotificationsRepository {
  final ApiClient apiClient;

  NotificationsRepositoryImpl({required this.apiClient});

  @override
  Future<Result<List<AppNotification>>> getNotifications() async {
    try {
      final notifications = await apiClient.getNotifications();
      return Success(notifications.map((m) => m.toDomain()).toList());
    } catch (e) {
      return Failure('Failed to fetch notifications: $e');
    }
  }

  @override
  Future<Result<int>> getUnreadCount() async {
    try {
      final count = await apiClient.getUnreadNotificationCount();
      return Success(count);
    } catch (e) {
      return Failure('Failed to fetch unread count: $e');
    }
  }
}
