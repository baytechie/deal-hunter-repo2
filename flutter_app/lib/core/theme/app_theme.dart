import 'package:flutter/material.dart';

/// App Theme - Design tokens and theme configuration
///
/// Why: Centralized design system for consistent styling across the app.
/// All colors, typography, and spacing values are defined here for easy
/// maintenance and theming support.

class AppColors {
  // Primary palette - Brand greens
  static const primary = Color(0xFF059669);
  static const primaryLight = Color(0xFF10B981);
  static const primaryDark = Color(0xFF047857);
  static const primarySurface = Color(0xFFDCFCE7); // Light green surface

  // Secondary palette - Orange for urgency/hot deals
  static const secondary = Color(0xFFF59E0B);
  static const secondaryLight = Color(0xFFFBBF24);
  static const secondarySurface = Color(0xFFFEF3C7);

  // Error/Sale - Red for discounts
  static const error = Color(0xFFDC2626);
  static const errorLight = Color(0xFFEF4444);
  static const errorSurface = Color(0xFFFEE2E2);

  // Neutral palette
  static const background = Color(0xFFFAFAFA);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceVariant = Color(0xFFF8FAFC);
  static const border = Color(0xFFE5E7EB);
  static const borderLight = Color(0xFFF3F4F6);

  // Text colors
  static const textPrimary = Color(0xFF111827);
  static const textSecondary = Color(0xFF374151);
  static const textMuted = Color(0xFF6B7280);
  static const textDisabled = Color(0xFF9CA3AF);

  // Semantic colors
  static const success = Color(0xFF059669);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF3B82F6);
}

class AppShadows {
  // Card shadow - layered for depth
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: const Color(0xFF000000).withOpacity(0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
      spreadRadius: 0,
    ),
    BoxShadow(
      color: const Color(0xFF000000).withOpacity(0.04),
      blurRadius: 8,
      offset: const Offset(0, 2),
      spreadRadius: 0,
    ),
  ];

  // Subtle shadow for buttons and chips
  static List<BoxShadow> subtleShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.04),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  // Elevated shadow for selected/focused elements
  static List<BoxShadow> elevatedShadow(Color color) => [
    BoxShadow(
      color: color.withOpacity(0.3),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  // Bottom navigation shadow
  static List<BoxShadow> bottomNavShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 24,
      offset: const Offset(0, -4),
    ),
  ];

  // Search bar shadow
  static List<BoxShadow> searchShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.06),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];
}

class AppRadius {
  static const double xs = 4;
  static const double sm = 6;
  static const double md = 8;
  static const double lg = 12;
  static const double xl = 16;
  static const double xxl = 24;
  static const double full = 999;
}

class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
}

class AppTypography {
  // Display - Page titles
  static const TextStyle displayLarge = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  // Headline - Section headers
  static const TextStyle headline = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // Title - Card titles
  static const TextStyle titleMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // Body - Regular text
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  // Label - Chips, badges
  static const TextStyle labelMedium = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  // Caption - Small metadata
  static const TextStyle caption = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
    height: 1.3,
  );

  // Price - Current price (prominent)
  static const TextStyle priceLarge = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: AppColors.primary,
    letterSpacing: -0.5,
  );

  // Price - Original price (strikethrough)
  static const TextStyle priceOriginal = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textDisabled,
    decoration: TextDecoration.lineThrough,
    decorationColor: AppColors.textDisabled,
    decorationThickness: 2,
  );

  // Discount badge
  static const TextStyle discountBadge = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  );
}

/// Build the app theme
ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      error: AppColors.error,
      surface: AppColors.surface,
      onSurface: AppColors.textPrimary,
    ),
    scaffoldBackgroundColor: AppColors.background,
    cardTheme: CardTheme(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      color: AppColors.surface,
    ),
    textTheme: const TextTheme(
      displayLarge: AppTypography.displayLarge,
      headlineMedium: AppTypography.headline,
      titleMedium: AppTypography.titleMedium,
      bodyMedium: AppTypography.bodyMedium,
      labelMedium: AppTypography.labelMedium,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.transparent,
      elevation: 0,
      indicatorColor: AppColors.primarySurface,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          );
        }
        return const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: AppColors.textMuted,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(
            color: AppColors.primary,
            size: 26,
          );
        }
        return const IconThemeData(
          color: AppColors.textMuted,
          size: 26,
        );
      }),
    ),
  );
}
