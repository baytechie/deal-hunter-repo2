import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/features/notifications/domain/entities/app_notification.dart';
import 'package:money_saver_deals/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:money_saver_deals/features/flip/presentation/pages/flip_feed_page.dart';

/// Notifications Page - Shows user notifications from API
class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  @override
  void initState() {
    super.initState();
    // Fetch notifications when page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationsProvider.notifier).fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final notificationsState = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryLight],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.notifications_outlined,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Notifications',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
                fontSize: 18,
              ),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(notificationsProvider.notifier).refresh(),
        color: AppColors.primary,
        child: _buildBody(notificationsState),
      ),
    );
  }

  Widget _buildBody(NotificationsState state) {
    return switch (state) {
      NotificationsInitial() => const _LoadingView(),
      NotificationsLoading() => const _LoadingView(),
      NotificationsSuccess(notifications: final notifications) =>
        notifications.isEmpty
            ? const _EmptyView()
            : _NotificationsList(notifications: notifications),
      NotificationsError(message: final message) => _ErrorView(message: message),
    };
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(color: AppColors.primary),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              shape: BoxShape.circle,
              boxShadow: AppShadows.subtleShadow,
            ),
            child: const Icon(
              Icons.notifications_none_outlined,
              size: 64,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'No notifications yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "You'll be notified about new deals\nand price changes here",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;

  const _ErrorView({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load notifications',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationsList extends StatelessWidget {
  final List<AppNotification> notifications;

  const _NotificationsList({required this.notifications});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: notifications.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return _NotificationItem(notification: notification);
      },
    );
  }
}

class _NotificationItem extends StatelessWidget {
  final AppNotification notification;

  const _NotificationItem({required this.notification});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: notification.hasDeal
          ? () => _navigateToDeal(context, notification.dealId!)
          : null,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon based on notification type
            _buildIcon(),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    notification.title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Message
                  Text(
                    notification.message,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Timestamp
                  Text(
                    notification.timeAgo,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            // Thumbnail if available
            if (notification.imageUrl != null &&
                notification.imageUrl!.isNotEmpty)
              _buildThumbnail(),
          ],
        ),
      ),
    );
  }

  Widget _buildIcon() {
    IconData iconData;
    Color iconColor;
    Color bgColor;

    switch (notification.type) {
      case NotificationType.newDeal:
        iconData = Icons.star_rounded;
        iconColor = Colors.amber;
        bgColor = Colors.amber.withOpacity(0.15);
        break;
      case NotificationType.priceDrop:
        iconData = Icons.trending_down_rounded;
        iconColor = AppColors.success;
        bgColor = AppColors.success.withOpacity(0.15);
        break;
      case NotificationType.priceIncrease:
        iconData = Icons.trending_up_rounded;
        iconColor = AppColors.error;
        bgColor = AppColors.error.withOpacity(0.15);
        break;
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(
        iconData,
        color: iconColor,
        size: 24,
      ),
    );
  }

  Widget _buildThumbnail() {
    return Container(
      margin: const EdgeInsets.only(left: 12),
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: AppColors.surface,
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.network(
        notification.imageUrl!,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          color: AppColors.surface,
          child: const Icon(
            Icons.image_not_supported_outlined,
            color: AppColors.textMuted,
            size: 24,
          ),
        ),
      ),
    );
  }

  void _navigateToDeal(BuildContext context, String dealId) {
    // Navigate to Flip view with the deal
    // We'll navigate to the flip page and let it show the deal
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FlipFeedPage(initialDealId: dealId),
      ),
    );
  }
}
