import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/services/logging_service.dart';
import 'package:money_saver_deals/features/notifications/domain/entities/app_notification.dart';
import 'package:money_saver_deals/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:money_saver_deals/features/notifications/data/repositories/notifications_repository_impl.dart';
import 'package:money_saver_deals/features/deals/data/datasources/api_client.dart';
import 'package:dio/dio.dart';

/// State representing different UI states for notifications loading
sealed class NotificationsState {
  const NotificationsState();
}

/// Initial state before any data is loaded
class NotificationsInitial extends NotificationsState {
  const NotificationsInitial();
}

/// Loading state while fetching notifications
class NotificationsLoading extends NotificationsState {
  const NotificationsLoading();
}

/// Success state with loaded notifications data
class NotificationsSuccess extends NotificationsState {
  final List<AppNotification> notifications;

  const NotificationsSuccess(this.notifications);
}

/// Error state when loading notifications fails
class NotificationsError extends NotificationsState {
  final String message;

  const NotificationsError(this.message);
}

/// StateNotifier for managing notifications state
class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationsRepository repository;
  static const String _logContext = 'NotificationsNotifier';

  NotificationsNotifier({required this.repository}) : super(const NotificationsInitial()) {
    logger.debug('NotificationsNotifier initialized', context: _logContext);
  }

  /// Fetch all notifications
  Future<void> fetchNotifications() async {
    logger.debug('fetchNotifications called', context: _logContext);
    state = const NotificationsLoading();

    final result = await repository.getNotifications();

    result.when(
      success: (notifications) {
        logger.info(
          'fetchNotifications succeeded: loaded ${notifications.length} notifications',
          context: _logContext,
        );
        state = NotificationsSuccess(notifications);
      },
      failure: (error) {
        logger.warning('fetchNotifications failed: $error', context: _logContext);
        state = NotificationsError(error);
      },
    );
  }

  /// Refresh notifications (same as fetch, but for pull-to-refresh)
  Future<void> refresh() async {
    logger.debug('refresh called', context: _logContext);
    await fetchNotifications();
  }

  /// Reset state to initial
  void reset() {
    logger.debug('reset called', context: _logContext);
    state = const NotificationsInitial();
  }
}

/// State for unread notification count (for badge)
class UnreadCountState {
  final int count;
  final bool isLoading;

  const UnreadCountState({this.count = 0, this.isLoading = false});

  UnreadCountState copyWith({int? count, bool? isLoading}) {
    return UnreadCountState(
      count: count ?? this.count,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

/// StateNotifier for managing unread count state
class UnreadCountNotifier extends StateNotifier<UnreadCountState> {
  final NotificationsRepository repository;
  static const String _logContext = 'UnreadCountNotifier';

  UnreadCountNotifier({required this.repository}) : super(const UnreadCountState()) {
    logger.debug('UnreadCountNotifier initialized', context: _logContext);
    // Auto-fetch on initialization
    fetchUnreadCount();
  }

  /// Fetch unread notification count
  Future<void> fetchUnreadCount() async {
    logger.debug('fetchUnreadCount called', context: _logContext);
    state = state.copyWith(isLoading: true);

    final result = await repository.getUnreadCount();

    result.when(
      success: (count) {
        logger.info('fetchUnreadCount succeeded: $count', context: _logContext);
        state = UnreadCountState(count: count, isLoading: false);
      },
      failure: (error) {
        logger.warning('fetchUnreadCount failed: $error', context: _logContext);
        state = state.copyWith(isLoading: false);
      },
    );
  }
}

// ============ PROVIDERS ============

/// Provider for ApiClient (reuse existing if available)
final notificationsApiClientProvider = Provider<ApiClient>((ref) {
  final dio = Dio();
  // Use same base URL as deals API
  const baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3000');
  return ApiClient(dio: dio, baseUrl: baseUrl);
});

/// Provider for NotificationsRepository
final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  final apiClient = ref.watch(notificationsApiClientProvider);
  return NotificationsRepositoryImpl(apiClient: apiClient);
});

/// StateNotifier provider for notifications state
final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  final repository = ref.watch(notificationsRepositoryProvider);
  return NotificationsNotifier(repository: repository);
});

/// StateNotifier provider for unread count state
final unreadCountProvider =
    StateNotifierProvider<UnreadCountNotifier, UnreadCountState>((ref) {
  final repository = ref.watch(notificationsRepositoryProvider);
  return UnreadCountNotifier(repository: repository);
});
