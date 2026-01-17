import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// Provider for managing saved deals
final savedDealsProvider = StateNotifierProvider<SavedDealsNotifier, List<Deal>>((ref) {
  return SavedDealsNotifier();
});

/// Notifier for saved deals state
class SavedDealsNotifier extends StateNotifier<List<Deal>> {
  SavedDealsNotifier() : super([]);

  /// Check if a deal is saved
  bool isSaved(String dealId) {
    return state.any((deal) => deal.id == dealId);
  }

  /// Toggle save state of a deal
  void toggleSave(Deal deal) {
    if (isSaved(deal.id)) {
      // Remove from saved
      state = state.where((d) => d.id != deal.id).toList();
    } else {
      // Add to saved
      state = [...state, deal];
    }
  }

  /// Remove a deal from saved
  void removeDeal(String dealId) {
    state = state.where((deal) => deal.id != dealId).toList();
  }

  /// Clear all saved deals
  void clearAll() {
    state = [];
  }
}
