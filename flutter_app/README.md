# Money Saver Deals - Flutter App

A Flutter application demonstrating **Clean Architecture** principles with **Riverpod** state management.

## Architecture Overview

```
lib/
├── features/
│   └── deals/
│       ├── domain/                      # Business logic (independent)
│       │   ├── entities/
│       │   │   └── deal.dart            # Pure Deal entity
│       │   ├── repositories/
│       │   │   └── deals_repository.dart # Abstract repository interface
│       │   └── core/
│       │       └── result.dart          # Result<T> for error handling
│       │
│       ├── data/                        # Data access layer
│       │   ├── datasources/
│       │   │   └── api_client.dart      # Dio HTTP client
│       │   ├── models/
│       │   │   └── deal_model.dart      # JSON serialization
│       │   └── repositories/
│       │       └── deals_repository_impl.dart  # Concrete implementation
│       │
│       └── presentation/                # UI layer
│           ├── providers/
│           │   └── deals_provider.dart  # Riverpod StateNotifier with logging
│           ├── widgets/
│           │   └── deal_card.dart       # DealCard widget
│           └── pages/
│               └── home_feed_page.dart  # Home feed page
│
└── main.dart                            # App entry point
```

## Key Features

### 1. Domain Layer (Business Logic)
- **Deal Entity**: Pure Dart class representing a deal
- **DealsRepository**: Abstract interface for data access
- **Result<T>**: Type-safe error handling (Success/Failure)

### 2. Data Layer (External Data)
- **ApiClient**: Dio-based HTTP client for backend communication
- **DealModel**: JSON serialization with fromJson/toJson
- **DealsRepositoryImpl**: Concrete repository implementation

### 3. Presentation Layer (UI)
- **DealsNotifier**: StateNotifier with extensive debugPrint logging
- **DealCard**: Beautiful card widget displaying:
  - Deal image with error handling
  - Price and discount percentage
  - "Hot" badge if isHot is true
  - Original price with strikethrough
  - Savings amount
  - Category badge
  - Expiry date with countdown
- **HomeFeedPage**: Main feed with:
  - Loading, Success, Error states
  - Pull-to-refresh
  - Error retry mechanism
  - Detailed logging

### 4. State Management with Riverpod
```dart
// StateNotifier tracks all state transitions
class DealsNotifier extends StateNotifier<DealsState> {
  Future<void> fetchAllDeals() async {
    debugPrint('[DealsNotifier] fetchAllDeals called');
    state = const DealsLoading();
    debugPrint('[DealsNotifier] State changed to: DealsLoading');
    
    final result = await repository.getAllDeals();
    result.when(
      success: (deals) {
        debugPrint('[DealsNotifier] Loaded ${deals.length} deals');
        state = DealsSuccess(deals);
      },
      failure: (error) {
        debugPrint('[DealsNotifier] Error: $error');
        state = DealsError(error);
      },
    );
  }
}
```

## SOLID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each class has one reason to change (Entities, Repository, Service, Widget) |
| **O**pen/Closed | Sealed classes for states; new states don't require modification |
| **L**iskov Substitution | DealsRepositoryImpl can be swapped for other implementations |
| **I**nterface Segregation | DealsRepository only exposes deal-related methods |
| **D**ependency Inversion | UI depends on abstract DealsRepository, not concrete implementation |

## Logging

Extensive logging throughout the app for debugging:

```
[DealsNotifier] fetchAllDeals called: page=1, limit=10, category=null, isHot=null
[DealsNotifier] State changed to: DealsLoading
[DealsNotifier] fetchAllDeals succeeded: loaded 10 deals
[DealsNotifier] State changed to: DealsSuccess(10 deals)

[HomeFeedPage] Build triggered, current state: DealsSuccess(...)
[HomeFeedPage] Building success state UI with 10 deals
[HomeFeedPage] Building deal card for: Amazing Deal Title
[HomeFeedPage] Deal tapped: Amazing Deal Title
```

## State Management

### States
- `DealsInitial`: No data loaded yet
- `DealsLoading`: Fetching deals from API
- `DealsSuccess`: Successfully loaded deals
- `DealsError`: Error occurred during fetch

### State Transitions
```
DealsInitial → DealsLoading → DealsSuccess/DealsError
             ↑________________↓
             (on retry)
```

## Setup

1. Install dependencies:
```bash
flutter pub get
```

2. Update API base URL in `main.dart`:
```dart
baseUrl: 'http://your-backend-url:3000'
```

3. Run the app:
```bash
flutter run
```

## Dependencies

- **flutter_riverpod**: State management
- **dio**: HTTP client for API communication
- **flutter**: Flutter framework

## Testing

The architecture makes testing easy:

```dart
test('DealsNotifier fetches deals successfully', () async {
  final mockRepository = MockDealsRepository();
  final notifier = DealsNotifier(repository: mockRepository);
  
  await notifier.fetchAllDeals();
  
  expect(notifier.state, isA<DealsSuccess>());
});
```

## Future Enhancements

- [ ] Add caching with local storage
- [ ] Implement infinite pagination
- [ ] Add filtering and search
- [ ] Implement favorite deals feature
- [ ] Add deal notifications
- [ ] Integrate analytics
