import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/deals/presentation/pages/home_feed_page.dart';
import 'package:money_saver_deals/features/flip/presentation/pages/flip_feed_page.dart';
import 'package:money_saver_deals/features/saved/presentation/pages/saved_deals_page.dart';
import 'package:money_saver_deals/features/profile/presentation/pages/profile_page.dart';

/// Tab provider to manage which tab is currently selected
final selectedTabProvider = StateProvider<int>((ref) => 0);

/// Provider to hold a deal that should be shown in Flip tab
/// When set, FlipFeedPage will scroll to show this deal
final selectedDealForFlipProvider = StateProvider<Deal?>((ref) => null);

/// Main App Shell with Bottom Navigation
///
/// Design: Modern bottom navigation with rounded corners and subtle shadow
/// Provides the main navigation structure for the app with 4 main tabs:
/// - Feed (Deals grid/list)
/// - Flip (TikTok-style deal cards)
/// - Saved (Wishlist)
/// - Profile (User account)
class AppShell extends ConsumerWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedTab = ref.watch(selectedTabProvider);

    return Scaffold(
      body: IndexedStack(
        index: selectedTab,
        children: const [
          HomeFeedPage(),
          FlipFeedPage(),
          SavedDealsPage(),
          ProfilePage(),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(ref, selectedTab),
    );
  }

  /// Build the enhanced bottom navigation bar with rounded corners
  Widget _buildBottomNavigationBar(WidgetRef ref, int selectedTab) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: AppShadows.bottomNavShadow,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                selectedIcon: Icons.home_rounded,
                label: 'Feed',
                isSelected: selectedTab == 0,
                onTap: () => ref.read(selectedTabProvider.notifier).state = 0,
              ),
              _NavItem(
                icon: Icons.play_circle_outline_rounded,
                selectedIcon: Icons.play_circle_rounded,
                label: 'Flip',
                isSelected: selectedTab == 1,
                onTap: () => ref.read(selectedTabProvider.notifier).state = 1,
              ),
              _NavItem(
                icon: Icons.bookmark_outline_rounded,
                selectedIcon: Icons.bookmark_rounded,
                label: 'Saved',
                isSelected: selectedTab == 2,
                onTap: () => ref.read(selectedTabProvider.notifier).state = 2,
              ),
              _NavItem(
                icon: Icons.person_outline_rounded,
                selectedIcon: Icons.person_rounded,
                label: 'Profile',
                isSelected: selectedTab == 3,
                onTap: () => ref.read(selectedTabProvider.notifier).state = 3,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Individual navigation item with animated indicator
class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primarySurface : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isSelected ? selectedIcon : icon,
                key: ValueKey(isSelected),
                size: 26,
                color: isSelected ? AppColors.primary : AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 4),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textMuted,
              ),
              child: Text(label),
            ),
          ],
        ),
      ),
    );
  }
}
