# Hunt Deals - UI Design Specifications

## Table of Contents

1. [Design System Reference](#1-design-system-reference)
2. [Feature 1: Deal Sharing](#2-feature-1-deal-sharing)
3. [Feature 2: Working Search](#3-feature-2-working-search)
4. [Feature 3: Click Tracking Analytics](#4-feature-3-click-tracking-analytics-admin)
5. [Feature 4: User Authentication](#5-feature-4-user-authentication)
6. [Feature 5: Price Drop Alerts](#6-feature-5-price-drop-alerts)
7. [Component Library](#7-component-library)
8. [Accessibility Guidelines](#8-accessibility-guidelines)

---

## 1. Design System Reference

### 1.1 Color Palette

```dart
// Primary palette - Brand greens
primary:        #059669  // Main brand color
primaryLight:   #10B981  // Hover/active states
primaryDark:    #047857  // Pressed states
primarySurface: #DCFCE7  // Light green backgrounds

// Secondary palette - Orange for urgency/hot deals
secondary:        #F59E0B  // Alert/urgency color
secondaryLight:   #FBBF24  // Hot deal accents
secondarySurface: #FEF3C7  // Light orange backgrounds

// Error/Sale - Red for discounts and errors
error:        #DC2626  // Discount badges, errors
errorLight:   #EF4444  // Error hover
errorSurface: #FEE2E2  // Error backgrounds

// Neutral palette
background:     #FAFAFA  // Page background
surface:        #FFFFFF  // Cards, modals
surfaceVariant: #F8FAFC  // Subtle backgrounds
border:         #E5E7EB  // Standard borders
borderLight:    #F3F4F6  // Subtle borders

// Text colors
textPrimary:   #111827  // Headings, important text
textSecondary: #374151  // Body text
textMuted:     #6B7280  // Captions, hints
textDisabled:  #9CA3AF  // Disabled states

// Semantic colors
success: #059669  // Same as primary
warning: #F59E0B  // Same as secondary
info:    #3B82F6  // Informational blue
```

### 1.2 Typography Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| displayLarge | 28px | Bold (700) | 1.2 | Page titles |
| headline | 20px | SemiBold (600) | 1.3 | Section headers |
| titleMedium | 14px | SemiBold (600) | 1.3 | Card titles |
| bodyMedium | 14px | Regular (400) | 1.5 | Body text |
| labelMedium | 12px | Medium (500) | 1.4 | Chips, badges |
| caption | 11px | Regular (400) | 1.3 | Metadata, timestamps |
| priceLarge | 18px | ExtraBold (800) | 1.0 | Current price |
| priceOriginal | 12px | Regular (400) | 1.0 | Strikethrough price |
| discountBadge | 11px | Bold (700) | 1.0 | Discount labels |

### 1.3 Spacing System

```dart
xs:   4px   // Tight spacing within components
sm:   8px   // Standard component padding
md:   12px  // Medium spacing
lg:   16px  // Standard section padding
xl:   20px  // Large spacing
xxl:  24px  // Section margins
xxxl: 32px  // Page margins
```

### 1.4 Border Radius

```dart
xs:   4px   // Small badges
sm:   6px   // Buttons, inputs
md:   8px   // Cards
lg:   12px  // Large cards
xl:   16px  // Modals
xxl:  24px  // Pills, chips
full: 999px // Circular elements
```

### 1.5 Shadow System

```dart
// Card shadow - layered for depth
cardShadow: [
  BoxShadow(color: black.08, blur: 24, offset: (0, 8)),
  BoxShadow(color: black.04, blur: 8, offset: (0, 2)),
]

// Subtle shadow for interactive elements
subtleShadow: BoxShadow(color: black.04, blur: 8, offset: (0, 2))

// Elevated shadow for selected/focused states
elevatedShadow: BoxShadow(color: color.30, blur: 12, offset: (0, 4))

// Search bar shadow
searchShadow: BoxShadow(color: black.06, blur: 16, offset: (0, 4))
```

### 1.6 Touch Target Guidelines

- **Minimum touch target**: 44x44px (WCAG 2.1 AAA)
- **Recommended touch target**: 48x48px
- **Spacing between targets**: Minimum 8px

---

## 2. Feature 1: Deal Sharing

### 2.1 Overview

Enable users to share deals via native share sheets and direct links. Share functionality appears on deal cards (grid view) and flip view (full-screen cards).

### 2.2 Component Hierarchy

```
DealCard / DealCardFront / DealCardBack
  └── ActionBar
      └── ShareButton
          ├── Icon (share_rounded)
          └── Tooltip ("Share deal")

ShareBottomSheet (on tap)
  ├── Header
  │   ├── CloseButton
  │   └── Title ("Share this deal")
  ├── DealPreviewCard
  │   ├── ProductImage (56x56)
  │   ├── DealTitle (max 2 lines)
  │   ├── Price
  │   └── DiscountBadge
  ├── ShareOptions (horizontal scroll)
  │   ├── CopyLinkButton
  │   ├── ShareToTwitterButton
  │   ├── ShareToFacebookButton
  │   ├── ShareToWhatsAppButton
  │   └── MoreButton (native share sheet)
  └── Footer
      └── ShareLinkPreview (shortened URL)
```

### 2.3 Share Button Specifications

#### 2.3.1 Deal Card (Grid View)

**Placement**: Bottom action bar, right side, next to Save button

```
┌─────────────────────────────────────┐
│  [Image Area with badges]           │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Title text that spans two       ││
│  │ lines maximum truncated...      ││
│  │                                 ││
│  │ $29.99  $49.99  -40%           ││
│  │                                 ││
│  │ ┌─────────────────────────────┐││
│  │ │     View Deal               │││
│  │ └─────────────────────────────┘││
│  │                                 ││
│  │ [Heart]  [Share]               ││  <- Share button here
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Button Specifications**:
```dart
ShareButton {
  // Container
  width: 44px (touch target)
  height: 44px (touch target)

  // Visual element
  innerContainer: {
    width: 36px
    height: 36px
    backgroundColor: AppColors.surface
    borderRadius: full (circular)
    boxShadow: subtleShadow
  }

  // Icon
  icon: Icons.share_rounded
  iconSize: 18px
  iconColor: {
    default: AppColors.textMuted
    pressed: AppColors.primary
  }

  // Accessibility
  semanticLabel: "Share ${deal.title}"

  // States
  default: {
    backgroundColor: surface
    iconColor: textMuted
  }
  pressed: {
    backgroundColor: primarySurface
    iconColor: primary
    transform: scale(0.95)
  }
  disabled: {
    backgroundColor: surfaceVariant
    iconColor: textDisabled
    opacity: 0.5
  }
}
```

#### 2.3.2 Flip View (Full Card)

**Placement**: Top action bar, between Save button and card counter

```
┌───────────────────────────────────────────────────┐
│  [HOT DEAL]  1 of 24     [Share] [Heart]         │
│                                                   │
│                  [Product Image]                  │
│                                                   │
│  ┌───────────────────────────────────────────────┐│
│  │ Electronics                                   ││
│  │ Product Title Here That May Span Two Lines   ││
│  │                                               ││
│  │ $29.99  $49.99  40% OFF                      ││
│  │                                               ││
│  │ [Tap to see details & verdict]               ││
│  │                                               ││
│  │ 42 likes  12 comments           [BUY NOW]    ││
│  └───────────────────────────────────────────────┘│
└───────────────────────────────────────────────────┘
```

**Button Specifications (Flip View)**:
```dart
ShareButtonFlip {
  // Container (larger for flip view)
  width: 48px
  height: 48px

  // Visual element
  innerContainer: {
    width: 40px
    height: 40px
    padding: 8px
    backgroundColor: Colors.white
    borderRadius: full
    boxShadow: [
      BoxShadow(color: black.10, blur: 8, offset: (0, 2))
    ]
  }

  // Icon
  icon: Icons.share_rounded
  iconSize: 22px
  iconColor: AppColors.textSecondary

  // Animation on tap
  animation: ScaleTransition(duration: 200ms)
}
```

### 2.4 Share Bottom Sheet

**Trigger**: Tap on share button
**Animation**: Slide up from bottom (300ms, Curves.easeOutCubic)

```dart
ShareBottomSheet {
  // Container
  backgroundColor: AppColors.surface
  borderRadius: BorderRadius.only(
    topLeft: Radius.circular(24),
    topRight: Radius.circular(24)
  )
  maxHeight: 400px
  padding: EdgeInsets.all(20)

  // Drag handle
  dragHandle: {
    width: 40px
    height: 4px
    backgroundColor: AppColors.border
    borderRadius: 2px
    marginBottom: 16px
  }
}
```

#### 2.4.1 Deal Preview Card (in sheet)

```dart
DealPreviewInSheet {
  // Container
  backgroundColor: AppColors.surfaceVariant
  borderRadius: 12px
  padding: 12px
  marginBottom: 20px

  // Layout: Row
  Row {
    // Image
    ClipRRect {
      borderRadius: 8px
      child: Image {
        width: 56px
        height: 56px
        fit: BoxFit.cover
      }
    }

    SizedBox(width: 12)

    // Info
    Column(crossAxisAlignment: start) {
      // Title
      Text {
        style: titleMedium
        maxLines: 2
        overflow: ellipsis
      }

      SizedBox(height: 4)

      // Price row
      Row {
        Text("\$${deal.price}", style: priceLarge.copyWith(fontSize: 16))
        SizedBox(width: 8)
        Text("\$${deal.originalPrice}", style: priceOriginal)
        SizedBox(width: 8)
        DiscountBadge(small: true)
      }
    }
  }
}
```

#### 2.4.2 Share Options Grid

```dart
ShareOptionsRow {
  // Horizontal scroll
  scrollDirection: Axis.horizontal
  padding: EdgeInsets.symmetric(vertical: 12)
  spacing: 16px

  children: [
    ShareOption(
      icon: Icons.link_rounded,
      label: "Copy Link",
      backgroundColor: AppColors.primarySurface,
      iconColor: AppColors.primary,
      onTap: () => copyToClipboard()
    ),
    ShareOption(
      icon: Icons.alternate_email, // Twitter/X icon
      label: "Twitter",
      backgroundColor: Color(0xFF1DA1F2).withOpacity(0.1),
      iconColor: Color(0xFF1DA1F2),
      onTap: () => shareToTwitter()
    ),
    ShareOption(
      icon: Icons.facebook,
      label: "Facebook",
      backgroundColor: Color(0xFF1877F2).withOpacity(0.1),
      iconColor: Color(0xFF1877F2),
      onTap: () => shareToFacebook()
    ),
    ShareOption(
      icon: Icons.chat_bubble,
      label: "WhatsApp",
      backgroundColor: Color(0xFF25D366).withOpacity(0.1),
      iconColor: Color(0xFF25D366),
      onTap: () => shareToWhatsApp()
    ),
    ShareOption(
      icon: Icons.more_horiz,
      label: "More",
      backgroundColor: AppColors.surfaceVariant,
      iconColor: AppColors.textSecondary,
      onTap: () => openNativeSheet()
    ),
  ]
}

ShareOption {
  // Container
  width: 72px
  alignment: center

  // Icon container
  iconContainer: {
    width: 56px
    height: 56px
    borderRadius: 16px
    backgroundColor: [platform specific]
  }

  // Label
  label: {
    style: caption
    color: textSecondary
    marginTop: 8px
  }

  // Touch feedback
  onTapDown: scale(0.95)
  onTapUp: scale(1.0)
}
```

### 2.5 Success/Error Feedback

#### 2.5.1 Copy Link Success

```dart
CopySuccessSnackBar {
  content: Row {
    Icon(Icons.check_circle, color: white, size: 20)
    SizedBox(width: 8)
    Text("Link copied to clipboard")
  }
  backgroundColor: AppColors.primary
  duration: 2 seconds
  behavior: SnackBarBehavior.floating
  shape: RoundedRectangleBorder(borderRadius: 8)
  margin: EdgeInsets.all(16)
}
```

#### 2.5.2 Share Error

```dart
ShareErrorSnackBar {
  content: Row {
    Icon(Icons.error_outline, color: white, size: 20)
    SizedBox(width: 8)
    Text("Couldn't share. Try again.")
  }
  backgroundColor: AppColors.error
  duration: 3 seconds
  action: SnackBarAction(
    label: "RETRY",
    textColor: white,
    onPressed: retryShare
  )
}
```

### 2.6 Share Preview Card (What Gets Shared)

When shared to social media, the link should generate a preview:

```
┌─────────────────────────────────────────┐
│ huntdeals.app                           │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │        [Product Image]              │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Sony WH-1000XM5 Headphones              │
│                                         │
│ $279.99 (was $399.99) - 30% OFF         │
│ Best price in 30 days! Buy now...       │
└─────────────────────────────────────────┘
```

**Open Graph Meta Tags** (Backend):
```html
<meta property="og:title" content="${deal.title}">
<meta property="og:description" content="$${deal.price} (was $${deal.originalPrice}) - ${discount}% OFF">
<meta property="og:image" content="${deal.imageUrl}">
<meta property="og:url" content="https://huntdeals.app/deal/${deal.id}">
```

### 2.7 Edge Cases

| State | UI Behavior |
|-------|-------------|
| Share cancelled | No feedback, sheet closes |
| Network error | Error snackbar with retry |
| Expired deal | Warning dialog before share |
| No share apps | Show "Copy Link" option only |
| Long title | Truncate to 100 chars with "..." |

---

## 3. Feature 2: Working Search

### 3.1 Overview

Full-text search with real-time results, filter chips, recent searches, and suggestions. Enhances the existing search bar in the home feed header.

### 3.2 Component Hierarchy

```
HomeFeedPage
  └── HeaderSection
      └── SearchBarEnhanced
          ├── SearchInput
          │   ├── SearchIcon (prefix)
          │   ├── TextField
          │   ├── ClearButton (when text present)
          │   └── FilterButton (suffix)
          └── SearchOverlay (when focused)
              ├── RecentSearches
              │   ├── SectionHeader ("Recent")
              │   ├── SearchHistoryItem (x5 max)
              │   └── ClearAllButton
              ├── Suggestions
              │   ├── SectionHeader ("Popular")
              │   └── SuggestionChip (x8 max)
              └── SearchResults
                  ├── ResultsHeader ("X results for 'query'")
                  ├── FilterChipsRow
                  └── ResultsList / ResultsGrid
```

### 3.3 Search Bar Specifications

#### 3.3.1 Default State

```dart
SearchBar {
  // Container
  height: 48px
  backgroundColor: AppColors.surface
  borderRadius: 24px (AppRadius.xxl)
  border: Border.all(color: AppColors.border, width: 1)
  boxShadow: searchShadow

  // Layout
  padding: EdgeInsets.symmetric(horizontal: 0) // handled by prefix/suffix

  // Input
  TextField {
    decoration: InputDecoration(
      hintText: "Search deals, brands, categories..."
      hintStyle: {
        color: AppColors.textDisabled
        fontSize: 15
        fontWeight: 400
      }
      border: InputBorder.none
      contentPadding: EdgeInsets.symmetric(vertical: 14)
    )

    // Prefix
    prefixIcon: Padding(
      padding: EdgeInsets.only(left: 16, right: 12)
      child: Icon(
        Icons.search_rounded
        color: AppColors.textMuted
        size: 22
      )
    )

    // Suffix (filter button)
    suffixIcon: FilterIconButton
  }
}
```

#### 3.3.2 Focused State (with overlay)

```dart
SearchBarFocused {
  // Container changes
  border: Border.all(color: AppColors.primary, width: 2)
  boxShadow: [
    ...searchShadow,
    BoxShadow(color: primary.15, blur: 8, spread: 2)
  ]
}

SearchOverlay {
  // Positioned below search bar
  position: absolute
  top: searchBar.bottom + 8
  left: 0
  right: 0

  // Container
  backgroundColor: AppColors.surface
  borderRadius: 16px
  boxShadow: cardShadow
  maxHeight: MediaQuery.of(context).size.height * 0.6

  // Animation
  animation: SlideTransition + FadeTransition
  duration: 200ms
  curve: Curves.easeOutCubic
}
```

#### 3.3.3 With Text (Clear button visible)

```dart
// Show clear button when text.isNotEmpty
ClearButton {
  width: 32px
  height: 32px
  margin: EdgeInsets.only(right: 4)

  Icon {
    Icons.close_rounded
    size: 18
    color: AppColors.textMuted
  }

  onTap: () {
    controller.clear()
    focusNode.requestFocus()
  }
}
```

### 3.4 Recent Searches Section

```dart
RecentSearchesSection {
  padding: EdgeInsets.all(16)

  // Header row
  Row {
    Text("Recent", style: labelMedium.copyWith(color: textMuted))
    Spacer()
    TextButton(
      "Clear all"
      style: { fontSize: 12, color: textMuted }
      onTap: clearAllRecent
    )
  }

  SizedBox(height: 12)

  // History items
  Column(spacing: 0) {
    for (search in recentSearches.take(5)) {
      RecentSearchItem(search)
    }
  }
}

RecentSearchItem {
  // Container
  height: 44px
  padding: EdgeInsets.symmetric(horizontal: 4)

  // Layout
  Row {
    Icon(Icons.history, size: 18, color: textMuted)
    SizedBox(width: 12)
    Expanded(
      Text(search.query, style: bodyMedium)
    )
    IconButton(
      Icons.north_west // Arrow indicating will populate search
      size: 18
      color: textDisabled
      onTap: () => populateSearch(search.query)
    )
  }

  // Divider below
  Divider(height: 1, indent: 34)

  // Tap behavior
  onTap: () => executeSearch(search.query)
}
```

### 3.5 Search Suggestions

```dart
SuggestionsSection {
  padding: EdgeInsets.fromLTRB(16, 8, 16, 16)

  // Header
  Text("Popular", style: labelMedium.copyWith(color: textMuted))

  SizedBox(height: 12)

  // Chips wrap
  Wrap(
    spacing: 8
    runSpacing: 8
    children: suggestions.map((s) => SuggestionChip(s))
  )
}

SuggestionChip {
  // Container
  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)
  backgroundColor: AppColors.surfaceVariant
  borderRadius: 16px
  border: Border.all(color: borderLight)

  // Content
  Row(mainAxisSize: min) {
    Icon(Icons.trending_up, size: 14, color: textMuted)
    SizedBox(width: 6)
    Text(suggestion, style: labelMedium)
  }

  // States
  onTap: executeSearch(suggestion)
  pressed: { backgroundColor: primarySurface }
}
```

### 3.6 Search Results Page

#### 3.6.1 Results Header

```dart
SearchResultsHeader {
  padding: EdgeInsets.all(16)

  // Query info
  Row {
    Text(
      "${results.length} results for "
      style: bodyMedium.copyWith(color: textMuted)
    )
    Text(
      "'$query'"
      style: bodyMedium.copyWith(fontWeight: 600)
    )
    Spacer()
    // Sort dropdown
    SortDropdown()
  }
}
```

#### 3.6.2 Filter Chips Row

```dart
FilterChipsRow {
  // Horizontal scroll
  height: 48px
  padding: EdgeInsets.symmetric(horizontal: 16)

  SingleChildScrollView(
    scrollDirection: Axis.horizontal
    child: Row(spacing: 8) {
      FilterChip(
        label: "All"
        isSelected: selectedCategory == null
        onTap: () => clearCategoryFilter()
      )
      FilterChip(
        label: "Electronics"
        icon: Icons.devices_rounded
        count: categoryCount["Electronics"]
        isSelected: selectedCategory == "Electronics"
      )
      FilterChip(
        label: "Under \$50"
        icon: Icons.attach_money
        isSelected: priceFilter == "<50"
      )
      FilterChip(
        label: "Hot Deals"
        icon: Icons.local_fire_department
        isSelected: hotOnly
      )
      // ... more filters
    }
  )
}

FilterChip {
  // Container
  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)
  borderRadius: 20px

  // States
  default: {
    backgroundColor: surface
    border: Border.all(color: border)
    textColor: textSecondary
  }
  selected: {
    backgroundColor: primary
    border: none
    textColor: white
  }

  // With count badge
  Row {
    if (icon != null) Icon(icon, size: 16)
    SizedBox(width: 6)
    Text(label)
    if (count != null) {
      SizedBox(width: 4)
      CountBadge(count)
    }
  }
}

CountBadge {
  padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2)
  backgroundColor: selected ? white.20 : surfaceVariant
  borderRadius: 10px

  Text(
    count.toString()
    style: caption.copyWith(
      color: selected ? white : textMuted
    )
  )
}
```

### 3.7 Empty States

#### 3.7.1 No Results Found

```dart
NoResultsState {
  padding: EdgeInsets.all(32)
  alignment: center

  Column {
    // Icon
    Container(
      width: 80
      height: 80
      backgroundColor: surfaceVariant
      borderRadius: full
      child: Icon(
        Icons.search_off_rounded
        size: 40
        color: textDisabled
      )
    )

    SizedBox(height: 24)

    // Title
    Text(
      "No deals found"
      style: headline
    )

    SizedBox(height: 8)

    // Subtitle
    Text(
      "Try different keywords or browse categories"
      style: bodyMedium.copyWith(color: textMuted)
      textAlign: center
    )

    SizedBox(height: 24)

    // Suggestions
    Wrap(spacing: 8, runSpacing: 8) {
      SuggestionChip("Electronics")
      SuggestionChip("Headphones")
      SuggestionChip("Under \$50")
    }
  }
}
```

#### 3.7.2 Initial Empty (No Recent Searches)

```dart
InitialSearchState {
  // Show only suggestions/trending
  Column {
    // Trending icon header
    Row {
      Icon(Icons.trending_up, color: secondary, size: 20)
      SizedBox(width: 8)
      Text("Trending Now", style: titleMedium)
    }

    SizedBox(height: 16)

    // Trending suggestions
    Wrap { /* trending chips */ }
  }
}
```

### 3.8 Loading State

```dart
SearchLoadingState {
  // Skeleton grid
  GridView(
    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
      crossAxisCount: 2
      childAspectRatio: 0.68
      mainAxisSpacing: 14
      crossAxisSpacing: 12
    )
    children: List.generate(6, (_) => SkeletonDealCard())
  )
}

SkeletonDealCard {
  Container(
    decoration: BoxDecoration(
      color: surface
      borderRadius: 16
      border: Border.all(color: border)
    )
    child: Column {
      // Image skeleton
      Container(
        flex: 10
        color: shimmerBase
        child: ShimmerAnimation()
      )

      // Content skeleton
      Padding(
        padding: 12
        child: Column {
          SkeletonLine(width: 100%, height: 14)
          SizedBox(height: 8)
          SkeletonLine(width: 60%, height: 14)
          SizedBox(height: 12)
          SkeletonLine(width: 40%, height: 20)
        }
      )
    }
  )
}
```

### 3.9 Debouncing and Performance

```dart
// Search input debouncing
final _debouncer = Debouncer(milliseconds: 300);

void onSearchChanged(String query) {
  _debouncer.run(() {
    if (query.length >= 2) {
      ref.read(searchProvider.notifier).search(query);
    }
  });
}
```

---

## 4. Feature 3: Click Tracking Analytics (Admin)

### 4.1 Overview

Admin dashboard for viewing affiliate click analytics, including time-series charts, top deals by clicks, and CTR metrics.

### 4.2 Component Hierarchy (React/Ant Design)

```
AnalyticsPage
  ├── PageHeader
  │   ├── Title ("Click Analytics")
  │   ├── DateRangePicker
  │   └── ExportButton
  ├── MetricCards (Row of 4)
  │   ├── TotalClicksCard
  │   ├── UniqueUsersCard
  │   ├── CTRCard
  │   └── RevenueEstimateCard
  ├── ChartsSection
  │   ├── ClicksOverTimeChart (Line/Area)
  │   └── ClicksByDealChart (Bar)
  ├── TopDealsTable
  │   └── DataTable with columns
  └── RecentClicksLog
      └── Timeline/List
```

### 4.3 Analytics Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Click Analytics                          [Jan 1 - Jan 20 ▼]  [Export CSV]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Total Clicks│ │Unique Users │ │ Avg CTR     │ │Est. Revenue │            │
│ │   12,456    │ │   3,421     │ │   4.2%      │ │  $1,245     │            │
│ │   +12.5%    │ │   +8.3%     │ │   +0.5%     │ │   +15.2%    │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                                             │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Clicks Over Time                                           [7D][30D]  │  │
│ │ ▲                                                                     │  │
│ │ │         ╱╲    ╱╲                                                    │  │
│ │ │    ╱╲  ╱  ╲  ╱  ╲   ╱╲                                             │  │
│ │ │   ╱  ╲╱    ╲╱    ╲ ╱  ╲                                            │  │
│ │ │  ╱                 ╲    ╲                                           │  │
│ │ └──────────────────────────────────────────────────────────────────▶  │  │
│ │   Jan 1    Jan 5    Jan 10    Jan 15    Jan 20                        │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Top Deals by Clicks                                                    │  │
│ ├───────────────────────────────────────────────────────────────────────┤  │
│ │ Image  Title                     Clicks  Impressions  CTR    Revenue  │  │
│ │ [img]  Sony WH-1000XM5          2,456    48,234      5.1%   $245.60  │  │
│ │ [img]  Apple AirPods Pro 2      1,892    42,123      4.5%   $189.20  │  │
│ │ [img]  Samsung Galaxy Watch     1,234    35,678      3.5%   $123.40  │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Metric Cards

```tsx
// MetricCard component specification
interface MetricCardProps {
  title: string;
  value: string | number;
  trend: number; // percentage change
  trendPeriod: string; // "vs last week"
  icon: ReactNode;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, value, trend, trendPeriod, icon, loading
}) => (
  <Card
    style={{
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}
    bodyStyle={{ padding: 20 }}
  >
    <Space direction="vertical" size={8}>
      <Space>
        <span style={{
          padding: 8,
          backgroundColor: '#DCFCE7', // primarySurface
          borderRadius: 8
        }}>
          {icon}
        </span>
        <Typography.Text type="secondary">{title}</Typography.Text>
      </Space>

      <Typography.Title level={3} style={{ margin: 0 }}>
        {loading ? <Skeleton.Input active size="small" /> : value}
      </Typography.Title>

      <Space>
        <Tag color={trend >= 0 ? 'green' : 'red'}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </Tag>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {trendPeriod}
        </Typography.Text>
      </Space>
    </Space>
  </Card>
);
```

### 4.5 Date Range Picker

```tsx
<DatePicker.RangePicker
  style={{ width: 280 }}
  presets={[
    { label: 'Today', value: [dayjs(), dayjs()] },
    { label: 'Last 7 days', value: [dayjs().subtract(7, 'd'), dayjs()] },
    { label: 'Last 30 days', value: [dayjs().subtract(30, 'd'), dayjs()] },
    { label: 'This month', value: [dayjs().startOf('month'), dayjs()] },
    { label: 'Last month', value: [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month')
    ]},
  ]}
  onChange={(dates) => setDateRange(dates)}
  disabledDate={(current) => current > dayjs()}
/>
```

### 4.6 Clicks Over Time Chart

```tsx
// Using Ant Design Charts or Recharts
const ClicksChart: React.FC<{ data: ClickData[] }> = ({ data }) => (
  <Card
    title="Clicks Over Time"
    extra={
      <Radio.Group
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        buttonStyle="solid"
        size="small"
      >
        <Radio.Button value="7d">7D</Radio.Button>
        <Radio.Button value="30d">30D</Radio.Button>
        <Radio.Button value="90d">90D</Radio.Button>
      </Radio.Group>
    }
    style={{ marginTop: 24 }}
  >
    <Area
      data={data}
      xField="date"
      yField="clicks"
      smooth={true}
      color="#059669" // primary color
      areaStyle={{
        fill: 'l(270) 0:#DCFCE7 1:#059669', // gradient
      }}
      xAxis={{
        tickCount: 7,
        label: {
          formatter: (v) => dayjs(v).format('MMM D'),
        },
      }}
      yAxis={{
        label: {
          formatter: (v) => `${v.toLocaleString()}`,
        },
      }}
      tooltip={{
        formatter: (datum) => ({
          name: 'Clicks',
          value: datum.clicks.toLocaleString(),
        }),
      }}
      height={300}
    />
  </Card>
);
```

### 4.7 Top Deals Table

```tsx
const TopDealsTable: React.FC = () => {
  const columns: ColumnsType<DealAnalytics> = [
    {
      title: 'Deal',
      key: 'deal',
      render: (_, record) => (
        <Space>
          <Image
            src={record.imageUrl}
            width={48}
            height={48}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
          <div>
            <Typography.Text strong ellipsis style={{ maxWidth: 200 }}>
              {record.title}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.category}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      sorter: true,
      render: (v) => <Typography.Text strong>{v.toLocaleString()}</Typography.Text>,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      sorter: true,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      sorter: true,
      render: (v) => (
        <Tag color={v >= 5 ? 'green' : v >= 3 ? 'blue' : 'default'}>
          {v.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Est. Revenue',
      dataIndex: 'revenue',
      sorter: true,
      render: (v) => (
        <Typography.Text style={{ color: '#059669' }}>
          ${v.toFixed(2)}
        </Typography.Text>
      ),
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      render: (v) => (
        <Sparkline data={v} color={v[v.length-1] > v[0] ? '#059669' : '#DC2626'} />
      ),
    },
  ];

  return (
    <Card title="Top Deals by Clicks" style={{ marginTop: 24 }}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};
```

### 4.8 Export Functionality

```tsx
const ExportButton: React.FC = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const data = await fetchAnalyticsExport(dateRange, format);
      downloadFile(data, `analytics-${dayjs().format('YYYY-MM-DD')}.${format}`);
      message.success('Export complete');
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dropdown
      menu={{
        items: [
          { key: 'csv', label: 'Export as CSV', icon: <FileTextOutlined /> },
          { key: 'json', label: 'Export as JSON', icon: <CodeOutlined /> },
        ],
        onClick: ({ key }) => handleExport(key as 'csv' | 'json'),
      }}
    >
      <Button icon={<DownloadOutlined />} loading={exporting}>
        Export
      </Button>
    </Dropdown>
  );
};
```

### 4.9 Loading States

```tsx
// Skeleton for metric cards
const MetricCardSkeleton = () => (
  <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Skeleton.Avatar active size={40} shape="square" />
      <Skeleton.Input active style={{ width: 120, height: 32 }} />
      <Skeleton.Button active size="small" style={{ width: 80 }} />
    </Space>
  </Card>
);

// Skeleton for chart
const ChartSkeleton = () => (
  <Card style={{ marginTop: 24 }}>
    <Skeleton active paragraph={{ rows: 8 }} />
  </Card>
);
```

---

## 5. Feature 4: User Authentication

### 5.1 Overview

OAuth-based authentication with Google and Apple sign-in, plus email/password fallback. Updates the existing Profile page with authenticated/guest states.

### 5.2 Component Hierarchy

```
ProfilePage
  ├── [Guest State] SignInView
  │   ├── LogoSection
  │   ├── WelcomeText
  │   ├── SocialSignInButtons
  │   │   ├── GoogleSignInButton
  │   │   └── AppleSignInButton
  │   ├── Divider ("or")
  │   ├── EmailSignInForm
  │   │   ├── EmailInput
  │   │   ├── PasswordInput
  │   │   └── SignInButton
  │   └── SignUpLink
  │
  └── [Authenticated State] ProfileView
      ├── ProfileHeader
      │   ├── Avatar
      │   ├── UserName
      │   └── UserEmail
      ├── StatsSection
      │   ├── SavedDealsCount
      │   ├── AlertsCount
      │   └── MemberSince
      ├── SettingsSection
      │   ├── NotificationSettings
      │   ├── PriceAlertSettings
      │   └── AppearanceSettings
      └── SignOutButton
```

### 5.3 Sign In View (Guest State)

```dart
SignInView {
  // Container
  backgroundColor: AppColors.background
  padding: EdgeInsets.all(24)

  Column(crossAxisAlignment: center) {
    SizedBox(height: 16)

    // Logo
    Container {
      width: 80
      height: 80
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [primary, primaryLight])
        borderRadius: 16
      )
      child: Center(
        Text("\$", style: { color: white, fontSize: 40, fontWeight: bold })
      )
    }

    SizedBox(height: 32)

    // Welcome text
    Text(
      "Join the Community to\nVote and Save Deals."
      style: { fontSize: 24, fontWeight: bold }
      textAlign: center
    )

    SizedBox(height: 48)

    // Social sign-in buttons
    GoogleSignInButton()
    SizedBox(height: 12)
    AppleSignInButton()

    SizedBox(height: 24)

    // Divider
    OrDivider()

    SizedBox(height: 24)

    // Email form
    EmailSignInForm()

    SizedBox(height: 16)

    // Sign up link
    SignUpLink()
  }
}
```

### 5.4 Google Sign-In Button

**Important**: Follow Google's branding guidelines exactly.

```dart
GoogleSignInButton {
  // Container - per Google branding
  width: double.infinity
  height: 48

  OutlinedButton(
    onPressed: handleGoogleSignIn
    style: OutlinedButton.styleFrom(
      padding: EdgeInsets.symmetric(vertical: 12)
      side: BorderSide(color: Color(0xFFDADCE0), width: 1)
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12)
      )
      backgroundColor: Colors.white
    )
    child: Row(
      mainAxisAlignment: center
      children: [
        // Google G logo (must use official asset)
        SvgPicture.asset(
          'assets/icons/google_g_logo.svg'
          width: 20
          height: 20
        )
        SizedBox(width: 12)
        Text(
          "Sign in with Google"
          style: TextStyle(
            color: Color(0xFF1F1F1F) // Google's specified text color
            fontSize: 16
            fontWeight: FontWeight.w500
            fontFamily: 'Roboto' // Required by Google
          )
        )
      ]
    )
  )

  // States
  hovered: { backgroundColor: Color(0xFFF8F9FA) }
  pressed: { backgroundColor: Color(0xFFEEEEEE) }
  loading: {
    child: CircularProgressIndicator(strokeWidth: 2)
    disabled: true
  }
}
```

### 5.5 Apple Sign-In Button

**Important**: Follow Apple's Human Interface Guidelines.

```dart
AppleSignInButton {
  // Container - per Apple guidelines
  width: double.infinity
  height: 48

  ElevatedButton(
    onPressed: handleAppleSignIn
    style: ElevatedButton.styleFrom(
      padding: EdgeInsets.symmetric(vertical: 12)
      backgroundColor: Colors.black
      foregroundColor: Colors.white
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12)
      )
      elevation: 0
    )
    child: Row(
      mainAxisAlignment: center
      children: [
        // Apple logo (use official SF Symbol or asset)
        Icon(
          Icons.apple // Or custom Apple logo asset
          color: Colors.white
          size: 20
        )
        SizedBox(width: 12)
        Text(
          "Sign in with Apple"
          style: TextStyle(
            color: Colors.white
            fontSize: 16
            fontWeight: FontWeight.w500
            fontFamily: 'SF Pro Display' // Preferred, falls back to system
          )
        )
      ]
    )
  )

  // States
  pressed: { backgroundColor: Color(0xFF333333) }
  loading: {
    child: CircularProgressIndicator(color: white, strokeWidth: 2)
  }
}
```

### 5.6 Email Sign-In Form

```dart
EmailSignInForm {
  Form(
    key: _formKey
    child: Column {
      // Email input
      TextFormField(
        controller: _emailController
        keyboardType: TextInputType.emailAddress
        autocorrect: false
        textInputAction: TextInputAction.next
        decoration: InputDecoration(
          labelText: "Email"
          hintText: "Enter your email address"
          prefixIcon: Icon(Icons.email_outlined, color: textMuted)
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12)
            borderSide: BorderSide(color: border)
          )
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12)
            borderSide: BorderSide(color: border)
          )
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12)
            borderSide: BorderSide(color: primary, width: 2)
          )
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12)
            borderSide: BorderSide(color: error)
          )
          filled: true
          fillColor: surfaceVariant
        )
        validator: (v) => EmailValidator.validate(v) ? null : "Invalid email"
      )

      SizedBox(height: 12)

      // Password input
      TextFormField(
        controller: _passwordController
        obscureText: !_passwordVisible
        textInputAction: TextInputAction.done
        decoration: InputDecoration(
          labelText: "Password"
          hintText: "Enter your password"
          prefixIcon: Icon(Icons.lock_outlined, color: textMuted)
          suffixIcon: IconButton(
            icon: Icon(
              _passwordVisible ? Icons.visibility : Icons.visibility_off
              color: textMuted
            )
            onPressed: togglePasswordVisibility
            tooltip: _passwordVisible ? "Hide password" : "Show password"
          )
          // ... same border styling as email
        )
        validator: (v) => v.length >= 8 ? null : "Min 8 characters"
      )

      SizedBox(height: 8)

      // Forgot password link
      Align(
        alignment: Alignment.centerRight
        child: TextButton(
          onPressed: handleForgotPassword
          style: TextButton.styleFrom(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4)
          )
          child: Text(
            "Forgot password?"
            style: TextStyle(color: primary, fontSize: 13)
          )
        )
      )

      SizedBox(height: 16)

      // Sign in button
      SizedBox(
        width: double.infinity
        child: ElevatedButton(
          onPressed: _isLoading ? null : handleEmailSignIn
          style: ElevatedButton.styleFrom(
            backgroundColor: primary
            foregroundColor: white
            padding: EdgeInsets.symmetric(vertical: 14)
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)
            )
            elevation: 0
          )
          child: _isLoading
            ? SizedBox(
                width: 20
                height: 20
                child: CircularProgressIndicator(
                  strokeWidth: 2
                  color: white
                )
              )
            : Text(
                "Sign In"
                style: TextStyle(
                  fontSize: 16
                  fontWeight: FontWeight.bold
                )
              )
        )
      )
    }
  )
}
```

### 5.7 Profile View (Authenticated State)

```dart
ProfileView {
  SingleChildScrollView(
    padding: EdgeInsets.all(24)
    child: Column {
      // Profile header
      ProfileHeader(user: currentUser)

      SizedBox(height: 24)

      // Stats cards
      StatsSection(user: currentUser)

      SizedBox(height: 24)

      // Settings
      SettingsSection()

      SizedBox(height: 32)

      // Sign out
      SignOutButton()

      SizedBox(height: 40)

      // Footer
      AppFooter()
    }
  )
}

ProfileHeader {
  Row {
    // Avatar
    CircleAvatar(
      radius: 40
      backgroundImage: user.photoUrl != null
        ? NetworkImage(user.photoUrl)
        : null
      backgroundColor: primarySurface
      child: user.photoUrl == null
        ? Text(
            user.displayName?.substring(0, 1).toUpperCase() ?? "?"
            style: TextStyle(fontSize: 32, color: primary, fontWeight: bold)
          )
        : null
    )

    SizedBox(width: 16)

    Column(crossAxisAlignment: start) {
      Text(
        user.displayName ?? "Deal Hunter"
        style: headline
      )
      SizedBox(height: 4)
      Text(
        user.email
        style: bodyMedium.copyWith(color: textMuted)
      )
      SizedBox(height: 8)
      Container(
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4)
        decoration: BoxDecoration(
          color: primarySurface
          borderRadius: 12
        )
        child: Row(mainAxisSize: min) {
          Icon(Icons.verified, size: 14, color: primary)
          SizedBox(width: 4)
          Text("Member", style: caption.copyWith(color: primary))
        }
      )
    }
  }
}

StatsSection {
  Row(mainAxisAlignment: spaceEvenly) {
    StatCard(
      icon: Icons.bookmark
      value: user.savedDealsCount.toString()
      label: "Saved"
      color: primary
    )
    StatCard(
      icon: Icons.notifications_active
      value: user.alertsCount.toString()
      label: "Alerts"
      color: secondary
    )
    StatCard(
      icon: Icons.calendar_today
      value: daysSinceJoined.toString()
      label: "Days"
      color: info
    )
  }
}

StatCard {
  Container(
    width: 100
    padding: EdgeInsets.all(16)
    decoration: BoxDecoration(
      color: surface
      borderRadius: 12
      boxShadow: subtleShadow
    )
    child: Column {
      Container(
        padding: EdgeInsets.all(8)
        decoration: BoxDecoration(
          color: color.withOpacity(0.1)
          borderRadius: 8
        )
        child: Icon(icon, color: color, size: 20)
      )
      SizedBox(height: 8)
      Text(value, style: headline.copyWith(fontSize: 24))
      SizedBox(height: 2)
      Text(label, style: caption)
    }
  )
}
```

### 5.8 Sign Out Confirmation Dialog

```dart
SignOutDialog {
  AlertDialog(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))
    title: Row {
      Icon(Icons.logout, color: error)
      SizedBox(width: 12)
      Text("Sign Out?")
    }
    content: Text(
      "Your saved deals will be preserved, but you'll need to sign in again to access them on other devices."
      style: bodyMedium.copyWith(color: textSecondary)
    )
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context)
        child: Text("Cancel", style: TextStyle(color: textMuted))
      )
      ElevatedButton(
        onPressed: handleSignOut
        style: ElevatedButton.styleFrom(
          backgroundColor: error
          foregroundColor: white
        )
        child: Text("Sign Out")
      )
    ]
  )
}
```

### 5.9 Authentication Error States

```dart
// Network error
AuthErrorSnackBar(error: NetworkError) {
  SnackBar(
    content: Row {
      Icon(Icons.wifi_off, color: white)
      SizedBox(width: 8)
      Text("No internet connection")
    }
    action: SnackBarAction(label: "RETRY", onPressed: retry)
    backgroundColor: error
  )
}

// OAuth cancelled
// No feedback needed - silent return to sign-in screen

// Account exists with different provider
AccountExistsDialog {
  AlertDialog(
    title: Text("Account Exists")
    content: Text(
      "An account with this email already exists. Please sign in with ${existingProvider} instead."
    )
    actions: [
      TextButton(onPressed: dismiss, child: Text("OK"))
    ]
  )
}
```

---

## 6. Feature 5: Price Drop Alerts

### 6.1 Overview

Allow users to set price drop alerts on deals with customizable thresholds. Includes UI for setting alerts, viewing alert history, and price history visualization.

### 6.2 Component Hierarchy

```
DealCard / DealCardFront / DealCardBack
  └── AlertToggle
      ├── AlertButton (inactive)
      └── AlertActiveIndicator (active)

AlertConfigSheet (on first tap)
  ├── Header
  ├── CurrentPriceInfo
  ├── ThresholdSelector
  │   ├── Chip (5%)
  │   ├── Chip (10%)
  │   ├── Chip (20%)
  │   └── CustomInput
  └── ConfirmButton

NotificationsPage
  └── PriceDropAlertsList
      └── PriceDropNotificationItem
          ├── DealThumbnail
          ├── PriceChangeInfo
          └── PriceHistorySparkline

DealCardBack (enhanced)
  └── PriceHistorySection
      ├── PriceChart (30-day sparkline)
      ├── LowestPriceBadge
      └── AveragePriceInfo
```

### 6.3 Alert Toggle Button

#### 6.3.1 On Deal Card (Grid View)

**Placement**: Next to share button in bottom action bar

```dart
AlertToggleButton {
  // Container (meets touch target)
  width: 44
  height: 44
  alignment: center

  // Visual button
  GestureDetector(
    onTap: hasAlert ? removeAlert : showAlertConfigSheet
    child: Container(
      width: 36
      height: 36
      decoration: BoxDecoration(
        color: hasAlert ? primarySurface : surface
        borderRadius: full
        boxShadow: subtleShadow
        border: hasAlert
          ? Border.all(color: primary, width: 2)
          : null
      )
      child: Stack(
        alignment: center
        children: [
          Icon(
            hasAlert
              ? Icons.notifications_active_rounded
              : Icons.notifications_none_rounded
            size: 18
            color: hasAlert ? primary : textMuted
          )
          // Active indicator dot
          if (hasAlert)
            Positioned(
              top: 6
              right: 6
              child: Container(
                width: 8
                height: 8
                decoration: BoxDecoration(
                  color: success
                  borderRadius: full
                  border: Border.all(color: surface, width: 1.5)
                )
              )
            )
        ]
      )
    )
  )

  // Accessibility
  semanticLabel: hasAlert
    ? "Remove price alert for ${deal.title}"
    : "Set price alert for ${deal.title}"
}
```

#### 6.3.2 On Flip View Card Back

**Placement**: In the "Should You Wait?" section or as standalone section

```dart
AlertSectionFlipView {
  Container(
    padding: EdgeInsets.all(16)
    margin: EdgeInsets.only(top: 16)
    decoration: BoxDecoration(
      color: hasAlert ? primarySurface : surfaceVariant
      borderRadius: 12
      border: Border.all(
        color: hasAlert ? primary : border
      )
    )
    child: Row {
      // Icon
      Container(
        padding: EdgeInsets.all(10)
        decoration: BoxDecoration(
          color: hasAlert ? primary : surface
          borderRadius: 10
        )
        child: Icon(
          hasAlert
            ? Icons.notifications_active
            : Icons.notifications_none
          color: hasAlert ? white : textMuted
          size: 22
        )
      )

      SizedBox(width: 12)

      // Text
      Expanded(
        child: Column(crossAxisAlignment: start) {
          Text(
            hasAlert ? "Price Alert Active" : "Get Price Drop Alert"
            style: titleMedium
          )
          SizedBox(height: 2)
          Text(
            hasAlert
              ? "We'll notify you when price drops ${threshold}%"
              : "Get notified when this deal gets even better"
            style: caption.copyWith(color: textMuted)
          )
        }
      )

      // Toggle/Configure button
      if (hasAlert)
        IconButton(
          icon: Icon(Icons.close, size: 20)
          onPressed: removeAlert
          tooltip: "Remove alert"
        )
      else
        ElevatedButton(
          onPressed: showAlertConfigSheet
          style: ElevatedButton.styleFrom(
            backgroundColor: primary
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8)
          )
          child: Text("Set Alert")
        )
    }
  )
}
```

### 6.4 Alert Configuration Bottom Sheet

```dart
AlertConfigSheet {
  // Container
  DraggableScrollableSheet(
    initialChildSize: 0.5
    minChildSize: 0.3
    maxChildSize: 0.7
    child: Container(
      decoration: BoxDecoration(
        color: surface
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24)
          topRight: Radius.circular(24)
        )
      )
      child: Column {
        // Drag handle
        DragHandle()

        // Content
        Padding(
          padding: EdgeInsets.all(20)
          child: Column {
            // Header
            Text("Set Price Alert", style: headline)
            SizedBox(height: 8)
            Text(
              "We'll notify you when the price drops"
              style: bodyMedium.copyWith(color: textMuted)
            )

            SizedBox(height: 24)

            // Current price info
            CurrentPriceCard(deal: deal)

            SizedBox(height: 24)

            // Threshold selector
            ThresholdSelector(
              selectedThreshold: selectedThreshold
              onChanged: setThreshold
            )

            SizedBox(height: 24)

            // Target price preview
            TargetPricePreview(
              currentPrice: deal.price
              threshold: selectedThreshold
            )

            Spacer()

            // Confirm button
            SizedBox(
              width: double.infinity
              child: ElevatedButton(
                onPressed: confirmAlert
                style: ElevatedButton.styleFrom(
                  backgroundColor: primary
                  padding: EdgeInsets.symmetric(vertical: 16)
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)
                  )
                )
                child: Text(
                  "Set Alert"
                  style: TextStyle(fontSize: 16, fontWeight: bold)
                )
              )
            )
          }
        )
      }
    )
  )
}
```

### 6.5 Threshold Selector

```dart
ThresholdSelector {
  Column(crossAxisAlignment: start) {
    Text("Alert me when price drops by:", style: titleMedium)
    SizedBox(height: 12)

    // Preset chips
    Row(mainAxisAlignment: spaceBetween) {
      ThresholdChip(
        value: 5
        isSelected: selectedThreshold == 5
        onTap: () => onChanged(5)
      )
      ThresholdChip(
        value: 10
        isSelected: selectedThreshold == 10
        onTap: () => onChanged(10)
      )
      ThresholdChip(
        value: 20
        isSelected: selectedThreshold == 20
        onTap: () => onChanged(20)
      )
      ThresholdChip(
        label: "Custom"
        isSelected: isCustom
        onTap: showCustomInput
      )
    }

    // Custom input (if selected)
    if (isCustom)
      Padding(
        padding: EdgeInsets.only(top: 12)
        child: Row {
          Expanded(
            child: TextField(
              controller: customController
              keyboardType: TextInputType.number
              decoration: InputDecoration(
                labelText: "Custom %"
                suffixText: "%"
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8)
                )
              )
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly
                LengthLimitingTextInputFormatter(2)
              ]
            )
          )
        }
      )
  }
}

ThresholdChip {
  GestureDetector(
    onTap: onTap
    child: AnimatedContainer(
      duration: Duration(milliseconds: 200)
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12)
      decoration: BoxDecoration(
        color: isSelected ? primary : surface
        borderRadius: 12
        border: Border.all(
          color: isSelected ? primary : border
          width: isSelected ? 2 : 1
        )
        boxShadow: isSelected ? elevatedShadow(primary) : null
      )
      child: Text(
        label ?? "${value}%"
        style: TextStyle(
          color: isSelected ? white : textSecondary
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500
          fontSize: 14
        )
      )
    )
  )
}
```

### 6.6 Target Price Preview

```dart
TargetPricePreview {
  final targetPrice = currentPrice * (1 - threshold / 100);

  Container(
    padding: EdgeInsets.all(16)
    decoration: BoxDecoration(
      color: primarySurface
      borderRadius: 12
    )
    child: Row {
      // Icon
      Icon(Icons.arrow_downward, color: primary, size: 24)

      SizedBox(width: 12)

      // Info
      Column(crossAxisAlignment: start) {
        Text("We'll alert you at:", style: caption.copyWith(color: textMuted))
        SizedBox(height: 4)
        Text(
          "\$${targetPrice.toStringAsFixed(2)}"
          style: priceLarge.copyWith(fontSize: 24)
        )
        Text(
          "or lower"
          style: caption.copyWith(color: primary)
        )
      }

      Spacer()

      // Savings preview
      Column(crossAxisAlignment: end) {
        Text("You'd save", style: caption.copyWith(color: textMuted))
        Text(
          "\$${(currentPrice - targetPrice).toStringAsFixed(2)}"
          style: titleMedium.copyWith(color: primary)
        )
      }
    }
  )
}
```

### 6.7 Price History Section (Flip View Back)

```dart
PriceHistorySection {
  Container(
    padding: EdgeInsets.all(16)
    decoration: BoxDecoration(
      color: surfaceVariant
      borderRadius: 12
      border: Border.all(color: border)
    )
    child: Column(crossAxisAlignment: start) {
      // Header
      Row {
        Icon(Icons.show_chart, color: primary, size: 20)
        SizedBox(width: 8)
        Text("Price History (30 Days)", style: titleMedium)
      }

      SizedBox(height: 16)

      // Sparkline chart
      PriceSparkline(
        data: priceHistory
        height: 80
        color: primary
        showArea: true
      )

      SizedBox(height: 16)

      // Stats row
      Row(mainAxisAlignment: spaceBetween) {
        PriceStat(
          label: "Lowest"
          value: "\$${priceHistory.lowest.toStringAsFixed(2)}"
          color: success
        )
        PriceStat(
          label: "Average"
          value: "\$${priceHistory.average.toStringAsFixed(2)}"
          color: textSecondary
        )
        PriceStat(
          label: "Highest"
          value: "\$${priceHistory.highest.toStringAsFixed(2)}"
          color: error
        )
      }

      // Current vs average indicator
      if (deal.price < priceHistory.average)
        Padding(
          padding: EdgeInsets.only(top: 12)
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)
            decoration: BoxDecoration(
              color: successSurface
              borderRadius: 8
            )
            child: Row {
              Icon(Icons.check_circle, color: success, size: 16)
              SizedBox(width: 8)
              Text(
                "Current price is ${percentBelowAvg.toStringAsFixed(0)}% below average!"
                style: caption.copyWith(color: success, fontWeight: w500)
              )
            }
          )
        )
    }
  )
}
```

### 6.8 Price Drop Notification Card

**Location**: Notifications page

```dart
PriceDropNotificationCard {
  InkWell(
    onTap: () => navigateToDeal(notification.dealId)
    borderRadius: BorderRadius.circular(12)
    child: Container(
      padding: EdgeInsets.all(16)
      decoration: BoxDecoration(
        color: surface
        borderRadius: 12
        border: Border.all(color: border)
      )
      child: Row {
        // Icon indicator
        Container(
          padding: EdgeInsets.all(10)
          decoration: BoxDecoration(
            color: successSurface
            borderRadius: 12
          )
          child: Icon(
            Icons.trending_down_rounded
            color: success
            size: 24
          )
        )

        SizedBox(width: 12)

        // Content
        Expanded(
          child: Column(crossAxisAlignment: start) {
            // Title
            Text(
              "Price dropped!"
              style: titleMedium.copyWith(color: success)
            )

            SizedBox(height: 4)

            // Deal title
            Text(
              notification.dealTitle
              style: bodyMedium
              maxLines: 2
              overflow: TextOverflow.ellipsis
            )

            SizedBox(height: 8)

            // Price change
            Row {
              Text(
                "\$${notification.newPrice.toStringAsFixed(2)}"
                style: priceLarge
              )
              SizedBox(width: 8)
              Text(
                "\$${notification.oldPrice.toStringAsFixed(2)}"
                style: priceOriginal
              )
              SizedBox(width: 8)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2)
                decoration: BoxDecoration(
                  color: success
                  borderRadius: 4
                )
                child: Text(
                  "-${notification.percentDrop.toStringAsFixed(0)}%"
                  style: discountBadge
                )
              )
            }

            SizedBox(height: 8)

            // Timestamp
            Text(
              notification.timeAgo
              style: caption.copyWith(color: textMuted)
            )
          }
        )

        // Thumbnail
        ClipRRect(
          borderRadius: BorderRadius.circular(8)
          child: Image.network(
            notification.imageUrl
            width: 64
            height: 64
            fit: BoxFit.cover
          )
        )
      }
    )
  )
}
```

### 6.9 Alert Success Feedback

```dart
AlertSetSuccessSnackBar {
  SnackBar(
    content: Row {
      Icon(Icons.notifications_active, color: white, size: 20)
      SizedBox(width: 8)
      Expanded(
        child: Column(crossAxisAlignment: start) {
          Text("Alert set!", style: TextStyle(fontWeight: bold))
          Text(
            "We'll notify you when price drops ${threshold}%"
            style: TextStyle(fontSize: 12)
          )
        }
      )
    }
    backgroundColor: success
    duration: Duration(seconds: 3)
    behavior: SnackBarBehavior.floating
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
    action: SnackBarAction(
      label: "UNDO"
      textColor: white
      onPressed: undoAlert
    )
  )
}
```

---

## 7. Component Library

### 7.1 Shared Components Reference

| Component | Usage | File Location |
|-----------|-------|---------------|
| `DealCard` | Grid deal display | `deals/presentation/widgets/deal_card.dart` |
| `DealCardFront` | Flip view front | `flip/presentation/widgets/deal_card_front.dart` |
| `DealCardBack` | Flip view back | `flip/presentation/widgets/deal_card_back.dart` |
| `AppHeader` | Consistent header | `core/widgets/app_header.dart` |
| `FilterPill` | Category/filter chips | `deals/presentation/pages/home_feed_page.dart` |

### 7.2 New Components to Create

| Component | Feature | Description |
|-----------|---------|-------------|
| `ShareButton` | Deal Sharing | Circular share icon button |
| `ShareBottomSheet` | Deal Sharing | Share options sheet |
| `ShareOption` | Deal Sharing | Individual share target |
| `SearchOverlay` | Search | Dropdown with suggestions |
| `RecentSearchItem` | Search | History item row |
| `SuggestionChip` | Search | Trending/suggested search |
| `FilterChip` | Search | Active filter indicator |
| `SkeletonDealCard` | Search | Loading placeholder |
| `MetricCard` | Analytics | Admin stat card |
| `ClicksChart` | Analytics | Time series chart |
| `GoogleSignInButton` | Auth | OAuth button (branded) |
| `AppleSignInButton` | Auth | OAuth button (branded) |
| `ProfileHeader` | Auth | User info display |
| `StatCard` | Auth | User stat display |
| `AlertToggleButton` | Alerts | Bell icon toggle |
| `ThresholdSelector` | Alerts | Percentage picker |
| `PriceSparkline` | Alerts | Mini price chart |
| `PriceDropNotificationCard` | Alerts | Alert notification |

---

## 8. Accessibility Guidelines

### 8.1 Touch Targets

- All interactive elements: minimum 44x44px
- Recommended: 48x48px for primary actions
- Spacing between targets: minimum 8px

### 8.2 Color Contrast

| Element | Background | Text/Icon | Contrast Ratio |
|---------|------------|-----------|----------------|
| Primary button | #059669 | #FFFFFF | 4.5:1 (AA) |
| Body text | #FAFAFA | #374151 | 7.2:1 (AAA) |
| Muted text | #FFFFFF | #6B7280 | 4.6:1 (AA) |
| Disabled text | #FFFFFF | #9CA3AF | 2.8:1 (fail) |
| Error text | #FFFFFF | #DC2626 | 4.5:1 (AA) |

**Note**: Disabled text intentionally fails contrast as it indicates non-interactive state.

### 8.3 Semantic Labels

All interactive elements must have semantic labels:

```dart
// Good
Semantics(
  label: "Share ${deal.title} on social media"
  button: true
  child: ShareButton()
)

// Bad
ShareButton() // No semantic context
```

### 8.4 Focus States

All focusable elements must have visible focus indicators:

```dart
// Keyboard/Accessibility focus
focusedBorder: OutlineInputBorder(
  borderRadius: BorderRadius.circular(12)
  borderSide: BorderSide(color: primary, width: 2)
)

// Focus ring for buttons
focusColor: primarySurface
highlightColor: primary.withOpacity(0.1)
```

### 8.5 Screen Reader Announcements

```dart
// Announce state changes
SemanticsService.announce(
  "Price alert set for ${deal.title}"
  TextDirection.ltr
)

// Announce search results
SemanticsService.announce(
  "Found ${results.length} deals matching $query"
  TextDirection.ltr
)
```

### 8.6 Motion and Animation

- Respect `MediaQuery.of(context).disableAnimations`
- Provide `reduceMotion` alternatives for all animations
- Keep animations under 200ms for essential feedback
- Avoid continuous/looping animations

```dart
final reduceMotion = MediaQuery.of(context).disableAnimations;

AnimatedContainer(
  duration: reduceMotion ? Duration.zero : Duration(milliseconds: 200)
  // ...
)
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | UI/UX Team | Initial specifications for top 5 features |

---

## Implementation Notes

### Priority Order

1. **Deal Sharing** (RICE: 96.0) - Lowest effort, highest impact
2. **Working Search** (RICE: 90.0) - Critical functionality gap
3. **Click Tracking** (RICE: 90.0) - Revenue visibility
4. **User Auth** (RICE: 60.0) - Foundation for personalization
5. **Price Alerts** (RICE: 56.0) - Depends on auth and price history

### Dependencies

```
Deal Sharing       -> None
Working Search     -> None
Click Tracking     -> None
User Auth          -> None
Price Alerts       -> User Auth, Price History Backend
```

### Estimated Implementation Time

| Feature | Frontend | Backend | Total |
|---------|----------|---------|-------|
| Deal Sharing | 3 days | 1 day | 4 days |
| Working Search | 5 days | 3 days | 8 days |
| Click Tracking | 3 days (admin) | 4 days | 7 days |
| User Auth | 5 days | 5 days | 10 days |
| Price Alerts | 5 days | 4 days | 9 days |

**Total Estimated: 38 days** (single developer)
