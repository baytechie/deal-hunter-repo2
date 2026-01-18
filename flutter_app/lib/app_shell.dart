import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/presentation/pages/home_feed_page.dart';
import 'package:money_saver_deals/features/flip/presentation/pages/flip_feed_page.dart';
import 'package:money_saver_deals/features/saved/presentation/pages/saved_deals_page.dart';
import 'package:money_saver_deals/features/profile/presentation/pages/profile_page.dart';

/// Tab provider to manage which tab is currently selected
final selectedTabProvider = StateProvider<int>((ref) => 0);

/// Main App Shell with Bottom Navigation
///
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
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedTab,
        onDestinationSelected: (index) {
          ref.read(selectedTabProvider.notifier).state = index;
        },
        backgroundColor: Colors.white,
        elevation: 8,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.newspaper),
            selectedIcon: Icon(Icons.newspaper),
            label: 'Feed',
          ),
          NavigationDestination(
            icon: Icon(Icons.flip),
            selectedIcon: Icon(Icons.flip),
            label: 'Flip',
          ),
          NavigationDestination(
            icon: Icon(Icons.bookmark_border),
            selectedIcon: Icon(Icons.bookmark),
            label: 'Saved',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
