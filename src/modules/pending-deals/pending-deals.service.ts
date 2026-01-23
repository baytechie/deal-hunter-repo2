import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  Optional,
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
import { NotificationsService } from '../notifications/notifications.service';
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
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  /**
   * Sync deals from Amazon PAAPI.
   * Fetches products and creates pending deals, skipping duplicates by ASIN.
   */
  async syncFromAmazon(
    dto: SyncDealsDto,
  ): Promise<{ created: number; skipped: number; total: number }> {
    this.logger.log(`Starting Amazon sync with params: ${JSON.stringify(dto)}`, this.context);

    const itemCount = dto.itemCount || 10;
    const searchParams = {
      keywords: dto.keywords,
      category: dto.category,
      sortBy: dto.sortBy,
      minSavingPercent: dto.minDiscountPercent,
    };

    // Use pagination for requests > 10 items (Amazon max per request is 10)
    const products = itemCount > 10
      ? await this.amazonPaapiService.searchItemsWithPagination(searchParams, itemCount)
      : await this.amazonPaapiService.searchItems({ ...searchParams, itemCount });

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

      // Auto-generate promo description from promotion data
      let promoDescription = product.promotionDisplayText || null;
      if (!promoDescription && product.isCouponAvailable) {
        promoDescription = 'Clip coupon on Amazon product page for additional savings';
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
        // Amazon deal information
        dealBadge: product.dealBadge || null,
        dealAccessType: product.dealAccessType || null,
        dealEndTime: product.dealEndTime ? new Date(product.dealEndTime) : null,
        dealStartTime: product.dealStartTime ? new Date(product.dealStartTime) : null,
        dealPercentClaimed: product.dealPercentClaimed || null,
        // Enhanced promotion information
        hasPromotion: product.hasPromotion || false,
        promotionType: product.promotionType || null,
        promotionAmount: product.promotionAmount || null,
        promotionPercent: product.promotionPercent || null,
        promotionDisplayText: product.promotionDisplayText || null,
        isSubscribeAndSave: product.isSubscribeAndSave || false,
        isCouponAvailable: product.isCouponAvailable || false,
        // Savings information
        savingBasisType: product.savingBasisType || null,
        savingsAmount: product.savingsAmount || null,
        // Auto-generated promo description
        promoDescription,
        // Store raw promotion data for reference
        rawPromotionData: product.allPromotions ? JSON.stringify(product.allPromotions) : null,
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

    // Determine final promotion values (admin overrides take precedence)
    const isCouponAvailable = dto.isCouponAvailable ?? pendingDeal.isCouponAvailable ?? false;
    const promotionAmount = dto.promotionAmount ?? pendingDeal.promotionAmount ?? null;
    const promotionPercent = dto.promotionPercent ?? pendingDeal.promotionPercent ?? null;
    const promotionDisplayText = dto.promotionDisplayText || pendingDeal.promotionDisplayText || null;

    // If admin provides coupon code or marks as having coupon, ensure hasPromotion is true
    const hasPromotion = !!(
      pendingDeal.hasPromotion ||
      dto.couponCode ||
      dto.isCouponAvailable ||
      dto.promotionAmount ||
      dto.promotionPercent
    );

    // Create the published deal with all promotion data
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
      // Amazon deal information
      dealBadge: pendingDeal.dealBadge || null,
      dealAccessType: pendingDeal.dealAccessType || null,
      dealEndTime: pendingDeal.dealEndTime || null,
      // Enhanced promotion information (with admin overrides)
      hasPromotion,
      promotionType: pendingDeal.promotionType || (dto.couponCode ? 'Coupon' : null),
      promotionAmount,
      promotionPercent,
      promotionDisplayText,
      isSubscribeAndSave: pendingDeal.isSubscribeAndSave || false,
      isCouponAvailable,
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

    // Trigger new deal notification
    if (this.notificationsService) {
      try {
        await this.notificationsService.createNewDealNotification(
          savedDeal.id,
          savedDeal.title,
          savedDeal.price,
          savedDeal.discountPercentage,
          savedDeal.imageUrl,
        );
      } catch (error) {
        this.logger.warn(`Failed to create notification for deal: ${error}`, this.context);
      }
    }

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
