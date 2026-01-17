import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/presentation/providers/deals_provider.dart';
import 'package:money_saver_deals/features/deals/presentation/widgets/deal_card.dart';
import 'package:money_saver_deals/features/notifications/presentation/pages/notifications_page.dart';
import 'package:money_saver_deals/app_shell.dart';

final selectedCategoryFilterProvider = StateProvider<String?>((ref) => null);
final gridViewModeProvider = StateProvider<bool>((ref) => true); // true = grid, false = list

/// Home Feed Page - Main deals feed with search, filters, and grid
class HomeFeedPage extends ConsumerStatefulWidget {
  const HomeFeedPage({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _HomeFeedPageState();
}

class _HomeFeedPageState extends ConsumerState<HomeFeedPage> {
  bool _initialFetchDone = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialFetchDone) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(dealsProvider.notifier).fetchAllDeals();
        _initialFetchDone = true;
      });
    }

    final dealsState = ref.watch(dealsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Top Bar: Logo + Notification
                  Row(
                    children: [
                      // Logo and Title - Clickable to go home
                      GestureDetector(
                        onTap: () {
                          // Reset to home tab (Feed)
                          ref.read(selectedTabProvider.notifier).state = 0;
                          // Reset filters
                          ref.read(selectedCategoryFilterProvider.notifier).state = null;
                          // Reload all deals
                          ref.read(dealsProvider.notifier).fetchAllDeals();
                        },
                        child: Row(
                          children: [
                            const Icon(
                              Icons.local_offer,
                              color: Color(0xFF10B981),
                              size: 28,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Deal Hunter',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF10B981),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),

                      // Notification Bell
                      IconButton(
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: Colors.grey,
                          size: 24,
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const NotificationsPage(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Search Bar (Full Width)
                  Container(
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search deals...',
                        prefixIcon: const Icon(
                          Icons.search,
                          color: Colors.grey,
                          size: 20,
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 8,
                        ),
                        hintStyle: const TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Filter Pills
                  Consumer(
                    builder: (context, ref, _) {
                      final selectedFilter = ref.watch(selectedCategoryFilterProvider);
                      final isGridView = ref.watch(gridViewModeProvider);
                      
                      return SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _FilterPill(
                              'Frontpage',
                              isSelected: selectedFilter == null,
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = null;
                                ref.read(dealsProvider.notifier).fetchAllDeals();
                              },
                            ),
                            const SizedBox(width: 8),
                            _FilterPill(
                              'Popular',
                              isSelected: selectedFilter == 'Popular',
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = 'Popular';
                                ref.read(dealsProvider.notifier).fetchAllDeals(isHot: true);
                              },
                            ),
                            const SizedBox(width: 8),
                            _FilterPill(
                              'Tech',
                              isSelected: selectedFilter == 'Tech',
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = 'Tech';
                                ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Tech');
                              },
                            ),
                            const SizedBox(width: 8),
                            _FilterPill(
                              'Electronics',
                              isSelected: selectedFilter == 'Electronics',
                              onTap: () {
                                ref.read(selectedCategoryFilterProvider.notifier).state = 'Electronics';
                                ref.read(dealsProvider.notifier).fetchAllDeals(category: 'Electronics');
                              },
                            ),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () {
                                ref.read(gridViewModeProvider.notifier).state = !isGridView;
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.grey[300]!),
                                ),
                                child: Icon(
                                  isGridView ? Icons.view_list : Icons.dashboard,
                                  color: const Color(0xFF10B981),
                                  size: 18,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Grid/List Content
            Expanded(
              child: dealsState is DealsSuccess
                  ? Consumer(
                      builder: (context, ref, _) {
                        final isGridView = ref.watch(gridViewModeProvider);
                        
                        return isGridView
                            ? GridView.builder(
                                padding: const EdgeInsets.all(6),
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  childAspectRatio: 0.75,
                                  mainAxisSpacing: 6,
                                  crossAxisSpacing: 6,
                                ),
                                itemCount: dealsState.deals.length,
                                itemBuilder: (context, index) => DealCard(deal: dealsState.deals[index]),
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.all(8),
                                itemCount: dealsState.deals.length,
                                itemBuilder: (context, index) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: SizedBox(
                                    height: 140,
                                    child: DealCard(deal: dealsState.deals[index]),
                                  ),
                                ),
                              );
                      },
                    )
                  : dealsState is DealsLoading
                      ? const Center(
                          child: CircularProgressIndicator(),
                        )
                      : dealsState is DealsError
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Error: ${dealsState.message}',
                                    style: const TextStyle(color: Colors.red),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 16),
                                  ElevatedButton(
                                    onPressed: () {
                                      ref.read(dealsProvider.notifier).fetchAllDeals();
                                    },
                                    child: const Text('Retry'),
                                  ),
                                ],
                              ),
                            )
                          : Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.shopping_bag,
                                    size: 64,
                                    color: Colors.grey[400],
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No deals loaded',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isSelected;

  const _FilterPill(
    this.label, {
    required this.onTap,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF10B981) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : Colors.grey[300]!,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: isSelected ? Colors.white : const Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
