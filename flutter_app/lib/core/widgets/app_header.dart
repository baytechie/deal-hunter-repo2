import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/features/notifications/presentation/pages/notifications_page.dart';
import 'package:money_saver_deals/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:money_saver_deals/app_shell.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/deals/presentation/pages/home_feed_page.dart';

/// Reusable App Header Component
///
/// Provides consistent branding and navigation across all pages.
/// Features:
/// - "Hunt Deals" logo with $ icon
/// - Optional page title (shows below logo for non-home pages)
/// - Notification bell
/// - Optional trailing actions
class AppHeader extends ConsumerWidget {
  /// Optional page title to show (e.g., "Saved Deals", "Flip")
  final String? pageTitle;

  /// Whether to show the notification bell
  final bool showNotifications;

  /// Optional trailing widgets (actions)
  final List<Widget>? actions;

  /// Whether tapping logo should navigate home
  final bool enableHomeNavigation;

  /// Callback when logo is tapped (if custom behavior needed)
  final VoidCallback? onLogoTap;

  const AppHeader({
    super.key,
    this.pageTitle,
    this.showNotifications = true,
    this.actions,
    this.enableHomeNavigation = true,
    this.onLogoTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Logo and Title - Clickable to go home
          GestureDetector(
            onTap: () {
              if (onLogoTap != null) {
                onLogoTap!();
              } else if (enableHomeNavigation) {
                _navigateHome(ref);
              }
            },
            child: Row(
              children: [
                // App Logo
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: Image.asset(
                    'assets/icon/app_icon.png',
                    width: 36,
                    height: 36,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 10),
                // Brand name with gradient
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [AppColors.primary, AppColors.primaryLight],
                      ).createShader(bounds),
                      child: const Text(
                        'Deal Hunt',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    // Show page title if provided, otherwise show tagline
                    Text(
                      pageTitle ?? 'Find the best deals, save big!',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(),

          // Custom actions
          if (actions != null) ...actions!,

          // Notification Bell with Badge
          if (showNotifications) _NotificationBell(),
        ],
      ),
    );
  }

  void _navigateHome(WidgetRef ref) {
    HapticFeedback.selectionClick();
    ref.read(selectedTabProvider.notifier).state = 0;
    ref.read(selectedCategoryFilterProvider.notifier).state = null;
    ref.read(dealsProvider.notifier).fetchAllDeals();
  }
}

/// Simple header variant for pages that use AppBar
/// Returns a PreferredSizeWidget for use in Scaffold.appBar
class AppHeaderBar extends ConsumerWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;

  const AppHeaderBar({
    super.key,
    required this.title,
    this.actions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppBar(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      leading: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          ref.read(selectedTabProvider.notifier).state = 0;
        },
        child: Container(
          margin: const EdgeInsets.all(8),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.sm),
            child: Image.asset(
              'assets/icon/app_icon.png',
              fit: BoxFit.cover,
            ),
          ),
        ),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 18,
        ),
      ),
      actions: actions,
    );
  }
}

/// Notification Bell with Badge
///
/// Shows the notification bell icon with an unread count badge.
/// Fetches unread count on initialization and refreshes when navigating back.
class _NotificationBell extends ConsumerStatefulWidget {
  @override
  ConsumerState<_NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends ConsumerState<_NotificationBell> {
  @override
  void initState() {
    super.initState();
    // Fetch unread count on initialization
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(unreadCountProvider.notifier).fetchUnreadCount();
    });
  }

  @override
  Widget build(BuildContext context) {
    final unreadState = ref.watch(unreadCountProvider);
    final count = unreadState.count;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        shape: BoxShape.circle,
        boxShadow: AppShadows.subtleShadow,
      ),
      child: Stack(
        children: [
          IconButton(
            icon: const Icon(
              Icons.notifications_outlined,
              color: AppColors.textMuted,
              size: 24,
            ),
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationsPage(),
                ),
              );
              // Refresh unread count when returning from notifications page
              ref.read(unreadCountProvider.notifier).fetchUnreadCount();
            },
          ),
          // Badge
          if (count > 0)
            Positioned(
              right: 6,
              top: 6,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.surface, width: 1.5),
                ),
                constraints: const BoxConstraints(
                  minWidth: 18,
                  minHeight: 18,
                ),
                child: Center(
                  child: Text(
                    count > 99 ? '99+' : count.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
