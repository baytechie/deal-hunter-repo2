import { Deal } from '../entities/deal.entity';

/**
 * Filter options for querying deals
 */
export interface DealFilterOptions {
  category?: string;
  isHot?: boolean;
  isFeatured?: boolean;
  minDiscount?: number;
  maxPrice?: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
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
 * DealsRepository Interface - Dependency Inversion Principle (SOLID)
 * 
 * This interface defines the contract for deal data access.
 * Concrete implementations can use TypeORM, MongoDB, or any other data source.
 * The service layer depends on this abstraction, not concrete implementations.
 */
export interface IDealsRepository {
  /**
   * Find all deals with optional filtering and pagination
   */
  findAll(
    filters?: DealFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<Deal>>;

  /**
   * Find a single deal by ID
   */
  findById(id: string): Promise<Deal | null>;

  /**
   * Find hot deals (limited)
   */
  findHotDeals(limit?: number): Promise<Deal[]>;

  /**
   * Find top deals by discount percentage
   */
  findTopDeals(limit?: number): Promise<Deal[]>;

  /**
   * Find featured deals
   */
  findFeaturedDeals(limit?: number): Promise<Deal[]>;

  /**
   * Create a new deal
   */
  create(deal: Partial<Deal>): Promise<Deal>;

  /**
   * Update an existing deal
   */
  update(id: string, deal: Partial<Deal>): Promise<Deal | null>;

  /**
   * Delete a deal
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get all unique categories
   */
  getCategories(): Promise<string[]>;
}

/**
 * Injection token for the repository interface
 * Used for dependency injection in NestJS
 */
export const DEALS_REPOSITORY = Symbol('DEALS_REPOSITORY');
