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
