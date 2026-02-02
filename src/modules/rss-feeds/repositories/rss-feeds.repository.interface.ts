import { RssFeedSource } from '../entities/rss-feed-source.entity';
import { RssFeedDeal } from '../entities/rss-feed-deal.entity';

/**
 * Filter options for querying RSS feed deals
 */
export interface RssFeedDealFilterOptions {
  category?: string;
  store?: string;
  search?: string;
  isHot?: boolean;
  isFeatured?: boolean;
  minDiscount?: number;
  sourceId?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Sorting options
 */
export interface SortingOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * IRssFeedsRepository Interface - Dependency Inversion Principle (SOLID)
 *
 * This interface defines the contract for RSS feed data access.
 * Concrete implementations can use TypeORM, MongoDB, or any other data source.
 */
export interface IRssFeedsRepository {
  // RSS Feed Source operations
  findAllSources(): Promise<RssFeedSource[]>;
  findSourceById(id: string): Promise<RssFeedSource | null>;
  findActiveSources(): Promise<RssFeedSource[]>;
  findSourcesDueForCrawl(): Promise<RssFeedSource[]>;
  createSource(source: Partial<RssFeedSource>): Promise<RssFeedSource>;
  updateSource(id: string, source: Partial<RssFeedSource>): Promise<RssFeedSource | null>;
  deleteSource(id: string): Promise<boolean>;

  // RSS Feed Deal operations
  findAllDeals(
    filters?: RssFeedDealFilterOptions,
    pagination?: PaginationOptions,
    sorting?: SortingOptions,
  ): Promise<PaginatedResult<RssFeedDeal>>;
  findDealById(id: string): Promise<RssFeedDeal | null>;
  findDealByGuid(guid: string): Promise<RssFeedDeal | null>;
  findHotDeals(limit?: number): Promise<RssFeedDeal[]>;
  findFeaturedDeals(limit?: number): Promise<RssFeedDeal[]>;
  findDealsBySource(sourceId: string, limit?: number): Promise<RssFeedDeal[]>;
  createDeal(deal: Partial<RssFeedDeal>): Promise<RssFeedDeal>;
  createDeals(deals: Partial<RssFeedDeal>[]): Promise<RssFeedDeal[]>;
  updateDeal(id: string, deal: Partial<RssFeedDeal>): Promise<RssFeedDeal | null>;
  deleteDeal(id: string): Promise<boolean>;
  deleteExpiredDeals(): Promise<number>;
  incrementViewCount(id: string): Promise<void>;
  incrementClickCount(id: string): Promise<void>;
  getCategories(): Promise<string[]>;
  getStores(): Promise<string[]>;
}

/**
 * Injection token for the repository interface
 */
export const RSS_FEEDS_REPOSITORY = Symbol('RSS_FEEDS_REPOSITORY');
