import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/core/widgets/app_header.dart';
import 'package:money_saver_deals/features/saved/presentation/providers/saved_deals_provider.dart';
import 'package:money_saver_deals/features/deals/presentation/widgets/deal_card.dart';
import 'package:money_saver_deals/app_shell.dart';

/// Saved Deals Page - View wishlist/saved deals
class SavedDealsPage extends ConsumerWidget {
  const SavedDealsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedDeals = ref.watch(savedDealsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppHeaderBar(
        title: 'Saved Deals',
        actions: savedDeals.isNotEmpty
            ? [
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: AppColors.textMuted),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Clear All'),
                        content: const Text('Remove all saved deals?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Cancel'),
                          ),
                          TextButton(
                            onPressed: () {
                              ref.read(savedDealsProvider.notifier).clearAll();
                              Navigator.pop(context);
                            },
                            child: const Text(
                              'Clear',
                              style: TextStyle(color: AppColors.error),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ]
            : null,
      ),
      body: savedDeals.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primarySurface,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.bookmark_outline_rounded,
                        size: 56,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'No saved deals yet',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Save your favorite deals by tapping the heart icon',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Navigate to feed tab
                        ref.read(selectedTabProvider.notifier).state = 0;
                      },
                      icon: const Icon(Icons.search_rounded),
                      label: const Text('Find Deals'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 14,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : GridView.builder(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.68,
                mainAxisSpacing: 14,
                crossAxisSpacing: 12,
              ),
              itemCount: savedDeals.length,
              itemBuilder: (context, index) => DealCard(deal: savedDeals[index]),
            ),
    );
  }
}
