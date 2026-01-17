import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Deal } from './entities/deal.entity';
import {
  IDealsRepository,
  DEALS_REPOSITORY,
  DealFilterOptions,
  PaginationOptions,
  PaginatedResult,
} from './repositories/deals.repository.interface';
import { CreateDealDto } from './dto/create-deal.dto';
import { LoggerService } from '../../shared/services/logger.service';
import { AffiliateService } from './services/affiliate.service';

/**
 * DealsService - Handles business logic for deals
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only contains deal-related business logic
 * - Open/Closed: New business rules can be added without modifying existing methods
 * - Dependency Inversion: Depends on IDealsRepository interface and AffiliateService abstraction
 * 
 * Dependencies:
 * - IDealsRepository: Data persistence abstraction
 * - AffiliateService: URL tagging and sanitization
 * - LoggerService: Structured logging
 */
@Injectable()
export class DealsService {
  private readonly context = 'DealsService';

  constructor(
    @Inject(DEALS_REPOSITORY)
    private readonly dealsRepository: IDealsRepository,
    private readonly logger: LoggerService,
    private readonly affiliateService: AffiliateService,
  ) {}

  /**
   * Get all deals with optional filtering and pagination
   */
  async findAll(
    filters?: DealFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<Deal>> {
    this.logger.debug(`Finding all deals with filters: ${JSON.stringify(filters)}`, this.context);
    return this.dealsRepository.findAll(filters, pagination);
  }

  /**
   * Get a single deal by ID
   */
  async findById(id: string): Promise<Deal> {
    this.logger.debug(`Finding deal by ID: ${id}`, this.context);
    
    const deal = await this.dealsRepository.findById(id);
    if (!deal) {
      this.logger.warn(`Deal not found: ${id}`, this.context);
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
    
    return deal;
  }

  /**
   * Get hot deals - deals marked as hot, sorted by discount
   */
  async findHotDeals(limit?: number): Promise<Deal[]> {
    this.logger.debug(`Finding hot deals, limit: ${limit}`, this.context);
    return this.dealsRepository.findHotDeals(limit);
  }

  /**
   * Get top deals - deals with highest discount percentages
   */
  async findTopDeals(limit?: number): Promise<Deal[]> {
    this.logger.debug(`Finding top deals, limit: ${limit}`, this.context);
    return this.dealsRepository.findTopDeals(limit);
  }

  /**
   * Get featured deals
   */
  async findFeaturedDeals(limit?: number): Promise<Deal[]> {
    this.logger.debug(`Finding featured deals, limit: ${limit}`, this.context);
    return this.dealsRepository.findFeaturedDeals(limit);
  }

  /**
   * Create a new deal with automatic discount calculation and affiliate link tagging
   * 
   * Business Logic:
   * - Validates price relationships (sale price shouldn't exceed original)
   * - Calculates discount percentage
   * - Sanitizes and tags affiliate links with Amazon Associate ID
   * - Persists to repository
   * 
   * @param createDealDto - Deal creation data
   * @returns The created deal entity
   */
  async create(createDealDto: CreateDealDto): Promise<Deal> {
    this.logger.debug(`Creating new deal: ${createDealDto.title}`, this.context);

    // Business logic: Validate price relationships
    if (createDealDto.price > createDealDto.originalPrice) {
      this.logger.warn(
        `Deal price (${createDealDto.price}) exceeds original price (${createDealDto.originalPrice})`,
        this.context,
      );
    }

    // Calculate discount percentage (business logic)
    const discountPercentage = this.calculateDiscountPercentage(
      createDealDto.originalPrice,
      createDealDto.price,
    );

    // Sanitize and tag affiliate link before saving
    const sanitizedAffiliateLink = this.affiliateService.sanitizeAffiliateUrl(
      createDealDto.affiliateLink,
    );

    const dealData: Partial<Deal> = {
      ...createDealDto,
      affiliateLink: sanitizedAffiliateLink,
      discountPercentage,
      expiryDate: createDealDto.expiryDate ? new Date(createDealDto.expiryDate) : undefined,
    };

    const deal = await this.dealsRepository.create(dealData);
    this.logger.log(
      `Deal created successfully: ${deal.id} with affiliate link: ${sanitizedAffiliateLink}`,
      this.context,
    );
    
    return deal;
  }

  /**
   * Update an existing deal with validation and link sanitization
   * 
   * Business Logic:
   * - Recalculates discount if prices changed
   * - Sanitizes affiliate link if provided
   * - Validates data before update
   * 
   * @param id - Deal ID
   * @param updateData - Partial deal data to update
   * @returns Updated deal entity
   * @throws NotFoundException if deal doesn't exist
   */
  async update(id: string, updateData: Partial<CreateDealDto>): Promise<Deal> {
    this.logger.debug(`Updating deal: ${id}`, this.context);

    // Recalculate discount if prices changed
    let discountPercentage: number | undefined;
    if (updateData.originalPrice !== undefined || updateData.price !== undefined) {
      const existingDeal = await this.findById(id);
      const originalPrice = updateData.originalPrice ?? existingDeal.originalPrice;
      const price = updateData.price ?? existingDeal.price;
      discountPercentage = this.calculateDiscountPercentage(originalPrice, price);
    }

    // Sanitize affiliate link if provided
    const sanitizedAffiliateLink = updateData.affiliateLink
      ? this.affiliateService.sanitizeAffiliateUrl(updateData.affiliateLink)
      : undefined;

    const dealData: Partial<Deal> = {
      ...updateData,
      ...(sanitizedAffiliateLink && { affiliateLink: sanitizedAffiliateLink }),
      ...(discountPercentage !== undefined && { discountPercentage }),
      ...(updateData.expiryDate && { expiryDate: new Date(updateData.expiryDate) }),
    };

    const updatedDeal = await this.dealsRepository.update(id, dealData);
    if (!updatedDeal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    this.logger.log(
      `Deal updated successfully: ${id}${sanitizedAffiliateLink ? ` with updated affiliate link: ${sanitizedAffiliateLink}` : ''}`,
      this.context,
    );
    return updatedDeal;
  }

  /**
   * Delete a deal
   */
  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting deal: ${id}`, this.context);
    
    const deleted = await this.dealsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    this.logger.log(`Deal deleted successfully: ${id}`, this.context);
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    this.logger.debug('Getting all categories', this.context);
    return this.dealsRepository.getCategories();
  }

  /**
   * Calculate discount percentage
   * Business Logic: Core calculation method
   * 
   * @param originalPrice - Original price before discount
   * @param currentPrice - Current discounted price
   * @returns Discount percentage (0-100)
   */
  calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= 0) {
      return 0;
    }

    if (currentPrice < 0) {
      return 100;
    }

    if (currentPrice >= originalPrice) {
      return 0;
    }

    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Number(discount.toFixed(2));
  }

  /**
   * Check if a deal is expired
   * Business Logic: Expiry validation
   */
  isDealExpired(deal: Deal): boolean {
    if (!deal.expiryDate) {
      return false;
    }
    return new Date(deal.expiryDate) < new Date();
  }

  /**
   * Get deal savings amount
   * Business Logic: Calculate absolute savings
   */
  getDealSavings(deal: Deal): number {
    return Number((deal.originalPrice - deal.price).toFixed(2));
  }
}
