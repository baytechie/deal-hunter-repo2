/**
 * Amazon PAAPI configuration interface
 */
export interface AmazonPaapiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string;
}

/**
 * Promotion data extracted from Offers.Listings.Promotions
 */
export interface AmazonPromotion {
  type?: string; // "SNS" (Subscribe & Save), "Coupon", etc.
  amount?: number; // Dollar value of promotion
  currency?: string; // "USD", etc.
  discountPercent?: number; // Percentage off
  pricePerUnit?: number; // Per-unit price for bulk deals
  displayAmount?: string; // Pre-formatted text like "$5.00 off"
}

/**
 * Amazon product from PAAPI response
 */
export interface AmazonProduct {
  asin: string;
  title: string;
  description?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  imageUrl?: string;
  productUrl: string;
  category: string;

  // Deal information from OffersV2.DealDetails
  dealBadge?: string; // e.g., "Limited Time Deal", "Deal of the Day"
  dealAccessType?: string; // "ALL", "PRIME_EXCLUSIVE", "PRIME_EARLY_ACCESS"
  dealStartTime?: string;
  dealEndTime?: string;
  dealPercentClaimed?: number;

  // Promotion/Coupon information from Offers.Listings.Promotions
  hasPromotion: boolean; // Flag indicating if any promotion exists
  promotionType?: string; // "SNS", "Coupon", "Lightning Deal", etc.
  promotionAmount?: number; // Dollar value of promotion
  promotionPercent?: number; // Percentage off from promotion
  promotionDisplayText?: string; // Pre-formatted display text
  isSubscribeAndSave: boolean; // Flag for Subscribe & Save deals
  isCouponAvailable: boolean; // Flag indicating clippable coupon exists
  allPromotions?: AmazonPromotion[]; // All raw promotion data

  // Savings information from Offers.Listings.SavingBasis
  savingBasisType?: string; // "LIST_PRICE", "WAS_PRICE", etc.
  savingsAmount?: number; // Total savings in dollars
  savingsPercent?: number; // Total savings percentage
}

/**
 * Search parameters for Amazon PAAPI
 */
export interface AmazonSearchParams {
  keywords?: string;
  category?: string;
  sortBy?: 'Price:LowToHigh' | 'Price:HighToLow' | 'AvgCustomerReviews' | 'NewestArrivals';
  itemCount?: number;
  minPrice?: number;
  maxPrice?: number;
  minSavingPercent?: number;
  itemPage?: number; // 1-10, for pagination through results
}

/**
 * Amazon search item index (category) mapping
 */
export type AmazonSearchIndex =
  | 'All'
  | 'Electronics'
  | 'Computers'
  | 'HomeAndKitchen'
  | 'Fashion'
  | 'Beauty'
  | 'Sports'
  | 'Books'
  | 'Toys'
  | 'HealthPersonalCare'
  | 'Automotive';

/**
 * Category mapping from our categories to Amazon SearchIndex
 */
export const CATEGORY_TO_SEARCH_INDEX: Record<string, AmazonSearchIndex> = {
  'Electronics': 'Electronics',
  'Computers': 'Computers',
  'Home & Kitchen': 'HomeAndKitchen',
  'Fashion': 'Fashion',
  'Beauty': 'Beauty',
  'Sports': 'Sports',
  'Books': 'Books',
  'Toys': 'Toys',
  'Health': 'HealthPersonalCare',
  'Automotive': 'Automotive',
};
