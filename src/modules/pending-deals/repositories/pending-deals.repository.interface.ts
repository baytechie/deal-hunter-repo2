import { PendingDeal } from '../entities/pending-deal.entity';

/**
 * Injection token for the pending deals repository
 */
export const PENDING_DEALS_REPOSITORY = 'PENDING_DEALS_REPOSITORY';

/**
 * Filter options for pending deals queries
 */
export interface PendingDealFilterOptions {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  category?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Stats by status
 */
export interface PendingDealStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

/**
 * Abstract interface for pending deals repository.
 * Follows Repository pattern and Dependency Inversion principle.
 */
export interface IPendingDealsRepository {
  findAll(
    filters?: PendingDealFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<PendingDeal>>;

  findById(id: string): Promise<PendingDeal | null>;

  findByAsin(asin: string): Promise<PendingDeal | null>;

  create(dealData: Partial<PendingDeal>): Promise<PendingDeal>;

  update(id: string, dealData: Partial<PendingDeal>): Promise<PendingDeal | null>;

  delete(id: string): Promise<boolean>;

  getStats(): Promise<PendingDealStats>;
}
