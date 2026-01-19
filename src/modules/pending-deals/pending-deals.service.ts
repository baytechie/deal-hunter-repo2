import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingDeal } from './entities/pending-deal.entity';
import { Deal } from '../deals/entities/deal.entity';
import {
  IPendingDealsRepository,
  PENDING_DEALS_REPOSITORY,
  PaginatedResult,
  PendingDealStats,
} from './repositories/pending-deals.repository.interface';
import { AmazonPaapiService } from '../amazon/services/amazon-paapi.service';
import { AffiliateService } from '../deals/services/affiliate.service';
import { LoggerService } from '../../shared/services/logger.service';
import { SyncDealsDto } from './dto/sync-deals.dto';
import { ApproveDealDto } from './dto/approve-deal.dto';
import { RejectDealDto } from './dto/reject-deal.dto';
import { GetPendingDealsQueryDto } from './dto/get-pending-deals-query.dto';

/**
 * PendingDealsService handles the admin approval workflow for deals.
 * Syncs from Amazon PAAPI and manages approve/reject operations.
 */
@Injectable()
export class PendingDealsService {
  private readonly context = 'PendingDealsService';

  constructor(
    @Inject(PENDING_DEALS_REPOSITORY)
    private readonly pendingDealsRepository: IPendingDealsRepository,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    private readonly amazonPaapiService: AmazonPaapiService,
    private readonly affiliateService: AffiliateService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Sync deals from Amazon PAAPI.
   * Fetches products and creates pending deals, skipping duplicates by ASIN.
   */
  async syncFromAmazon(
    dto: SyncDealsDto,
  ): Promise<{ created: number; skipped: number; total: number }> {
    this.logger.log(`Starting Amazon sync with params: ${JSON.stringify(dto)}`, this.context);

    const products = await this.amazonPaapiService.searchItems({
      keywords: dto.keywords,
      category: dto.category,
      sortBy: dto.sortBy,
      itemCount: dto.itemCount || 10,
      minSavingPercent: dto.minDiscountPercent,
    });

    let created = 0;
    let skipped = 0;

    for (const product of products) {
      // Check if ASIN already exists
      const existing = await this.pendingDealsRepository.findByAsin(product.asin);

      if (existing) {
        this.logger.debug(`Skipping duplicate ASIN: ${product.asin}`, this.context);
        skipped++;
        continue;
      }

      // Filter by minimum discount if specified
      if (dto.minDiscountPercent && product.discountPercentage < dto.minDiscountPercent) {
        this.logger.debug(
          `Skipping product ${product.asin} - discount ${product.discountPercentage}% below minimum ${dto.minDiscountPercent}%`,
          this.context,
        );
        skipped++;
        continue;
      }

      await this.pendingDealsRepository.create({
        asin: product.asin,
        title: product.title,
        description: product.description || null,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        imageUrl: product.imageUrl || null,
        productUrl: product.productUrl,
        category: product.category,
        status: 'PENDING',
      });

      created++;
    }

    this.logger.log(
      `Amazon sync complete: ${created} created, ${skipped} skipped, ${products.length} total fetched`,
      this.context,
    );

    return {
      created,
      skipped,
      total: products.length,
    };
  }

  /**
   * Find all pending deals with filters and pagination
   */
  async findAll(query: GetPendingDealsQueryDto): Promise<PaginatedResult<PendingDeal>> {
    return this.pendingDealsRepository.findAll(
      {
        status: query.status,
        category: query.category,
      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
      },
    );
  }

  /**
   * Find a pending deal by ID
   */
  async findById(id: string): Promise<PendingDeal> {
    const pendingDeal = await this.pendingDealsRepository.findById(id);

    if (!pendingDeal) {
      throw new NotFoundException(`Pending deal with ID ${id} not found`);
    }

    return pendingDeal;
  }

  /**
   * Approve a pending deal and create a published Deal
   */
  async approve(
    id: string,
    userId: string,
    dto: ApproveDealDto,
  ): Promise<Deal> {
    const pendingDeal = await this.findById(id);

    if (pendingDeal.status !== 'PENDING') {
      throw new ConflictException(
        `Pending deal ${id} is already ${pendingDeal.status.toLowerCase()}`,
      );
    }

    // Create affiliate link with tag
    const affiliateLink = this.affiliateService.sanitizeAffiliateUrl(pendingDeal.productUrl);

    // Create the published deal
    const deal = this.dealRepository.create({
      title: dto.customTitle || pendingDeal.title,
      description: pendingDeal.description,
      price: pendingDeal.price,
      originalPrice: pendingDeal.originalPrice,
      discountPercentage: pendingDeal.discountPercentage,
      imageUrl: pendingDeal.imageUrl,
      affiliateLink,
      category: pendingDeal.category,
      isHot: dto.isHot || false,
      isFeatured: dto.isFeatured || false,
      asin: pendingDeal.asin,
      pendingDealId: pendingDeal.id,
      couponCode: dto.couponCode || pendingDeal.couponCode || null,
      promoDescription: dto.promoDescription || pendingDeal.promoDescription || null,
    });

    const savedDeal = await this.dealRepository.save(deal);

    // Update pending deal status
    await this.pendingDealsRepository.update(id, {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    });

    this.logger.log(
      `Pending deal ${id} approved by ${userId}, created deal ${savedDeal.id}`,
      this.context,
    );

    return savedDeal;
  }

  /**
   * Reject a pending deal with a reason
   */
  async reject(id: string, userId: string, dto: RejectDealDto): Promise<PendingDeal> {
    const pendingDeal = await this.findById(id);

    if (pendingDeal.status !== 'PENDING') {
      throw new ConflictException(
        `Pending deal ${id} is already ${pendingDeal.status.toLowerCase()}`,
      );
    }

    const updated = await this.pendingDealsRepository.update(id, {
      status: 'REJECTED',
      approvedBy: userId,
      rejectionReason: dto.reason,
    });

    this.logger.log(
      `Pending deal ${id} rejected by ${userId}: ${dto.reason}`,
      this.context,
    );

    return updated!;
  }

  /**
   * Delete a pending deal
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.pendingDealsRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Pending deal with ID ${id} not found`);
    }

    this.logger.log(`Pending deal ${id} deleted`, this.context);
  }

  /**
   * Delete all pending deals from the database
   */
  async clearAll(): Promise<number> {
    this.logger.warn('Clearing all pending deals from database', this.context);
    const count = await this.pendingDealsRepository.clearAll();
    this.logger.log(`Cleared ${count} pending deals from database`, this.context);
    return count;
  }

  /**
   * Get statistics by status
   */
  async getStats(): Promise<PendingDealStats> {
    return this.pendingDealsRepository.getStats();
  }
}
