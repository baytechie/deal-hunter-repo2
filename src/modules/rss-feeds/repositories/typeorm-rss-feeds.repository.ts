import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Like, In } from 'typeorm';
import { RssFeedSource } from '../entities/rss-feed-source.entity';
import { RssFeedDeal } from '../entities/rss-feed-deal.entity';
import {
  IRssFeedsRepository,
  RssFeedDealFilterOptions,
  PaginationOptions,
  SortingOptions,
  PaginatedResult,
} from './rss-feeds.repository.interface';

/**
 * TypeORM implementation of the RSS Feeds Repository
 * Handles all database operations for RSS feed sources and deals
 */
@Injectable()
export class TypeOrmRssFeedsRepository implements IRssFeedsRepository {
  constructor(
    @InjectRepository(RssFeedSource)
    private readonly sourceRepository: Repository<RssFeedSource>,
    @InjectRepository(RssFeedDeal)
    private readonly dealRepository: Repository<RssFeedDeal>,
  ) {}

  // =====================
  // RSS Feed Source Operations
  // =====================

  async findAllSources(): Promise<RssFeedSource[]> {
    return this.sourceRepository.find({
      order: { priority: 'DESC', name: 'ASC' },
    });
  }

  async findSourceById(id: string): Promise<RssFeedSource | null> {
    return this.sourceRepository.findOne({ where: { id } });
  }

  async findActiveSources(): Promise<RssFeedSource[]> {
    return this.sourceRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC', name: 'ASC' },
    });
  }

  async findSourcesDueForCrawl(): Promise<RssFeedSource[]> {
    const now = new Date();
    const sources = await this.sourceRepository.find({
      where: { isActive: true },
    });

    return sources.filter((source) => {
      if (!source.lastCrawledAt) return true;
      const nextCrawlTime = new Date(
        source.lastCrawledAt.getTime() + source.crawlIntervalMinutes * 60 * 1000,
      );
      return now >= nextCrawlTime;
    });
  }

  async createSource(source: Partial<RssFeedSource>): Promise<RssFeedSource> {
    const entity = this.sourceRepository.create(source);
    return this.sourceRepository.save(entity);
  }

  async updateSource(id: string, source: Partial<RssFeedSource>): Promise<RssFeedSource | null> {
    const existing = await this.findSourceById(id);
    if (!existing) return null;

    Object.assign(existing, source);
    return this.sourceRepository.save(existing);
  }

  async deleteSource(id: string): Promise<boolean> {
    const result = await this.sourceRepository.delete(id);
    return result.affected > 0;
  }

  // =====================
  // RSS Feed Deal Operations
  // =====================

  async findAllDeals(
    filters?: RssFeedDealFilterOptions,
    pagination?: PaginationOptions,
    sorting?: SortingOptions,
  ): Promise<PaginatedResult<RssFeedDeal>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.source', 'source')
      .where('deal.isActive = :isActive', { isActive: true });

    // Apply filters
    if (filters?.category) {
      queryBuilder.andWhere('deal.category = :category', { category: filters.category });
    }
    if (filters?.store) {
      queryBuilder.andWhere('deal.store = :store', { store: filters.store });
    }
    if (filters?.isHot !== undefined) {
      queryBuilder.andWhere('deal.isHot = :isHot', { isHot: filters.isHot });
    }
    if (filters?.isFeatured !== undefined) {
      queryBuilder.andWhere('deal.isFeatured = :isFeatured', { isFeatured: filters.isFeatured });
    }
    if (filters?.minDiscount) {
      queryBuilder.andWhere('deal.discountPercentage >= :minDiscount', {
        minDiscount: filters.minDiscount,
      });
    }
    if (filters?.sourceId) {
      queryBuilder.andWhere('deal.sourceId = :sourceId', { sourceId: filters.sourceId });
    }
    if (filters?.search) {
      queryBuilder.andWhere(
        '(deal.title LIKE :search OR deal.description LIKE :search OR deal.store LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply sorting
    const sortField = sorting?.field || 'publishedAt';
    const sortOrder = sorting?.order || 'DESC';
    queryBuilder.orderBy(`deal.${sortField}`, sortOrder);

    // Get total count and paginated results
    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDealById(id: string): Promise<RssFeedDeal | null> {
    return this.dealRepository.findOne({
      where: { id },
      relations: ['source'],
    });
  }

  async findDealByGuid(guid: string): Promise<RssFeedDeal | null> {
    return this.dealRepository.findOne({ where: { guid } });
  }

  async findHotDeals(limit: number = 10): Promise<RssFeedDeal[]> {
    return this.dealRepository.find({
      where: { isHot: true, isActive: true },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['source'],
    });
  }

  async findFeaturedDeals(limit: number = 10): Promise<RssFeedDeal[]> {
    return this.dealRepository.find({
      where: { isFeatured: true, isActive: true },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['source'],
    });
  }

  async findDealsBySource(sourceId: string, limit: number = 20): Promise<RssFeedDeal[]> {
    return this.dealRepository.find({
      where: { sourceId, isActive: true },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['source'],
    });
  }

  async createDeal(deal: Partial<RssFeedDeal>): Promise<RssFeedDeal> {
    const entity = this.dealRepository.create(deal);
    return this.dealRepository.save(entity);
  }

  async createDeals(deals: Partial<RssFeedDeal>[]): Promise<RssFeedDeal[]> {
    const entities = deals.map((deal) => this.dealRepository.create(deal));
    return this.dealRepository.save(entities);
  }

  async updateDeal(id: string, deal: Partial<RssFeedDeal>): Promise<RssFeedDeal | null> {
    const existing = await this.findDealById(id);
    if (!existing) return null;

    Object.assign(existing, deal);
    return this.dealRepository.save(existing);
  }

  async deleteDeal(id: string): Promise<boolean> {
    const result = await this.dealRepository.delete(id);
    return result.affected > 0;
  }

  async deleteExpiredDeals(): Promise<number> {
    const now = new Date();
    const result = await this.dealRepository.delete({
      expiresAt: LessThan(now),
    });
    return result.affected || 0;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.dealRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.dealRepository.increment({ id }, 'clickCount', 1);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.dealRepository
      .createQueryBuilder('deal')
      .select('DISTINCT deal.category', 'category')
      .where('deal.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  async getStores(): Promise<string[]> {
    const result = await this.dealRepository
      .createQueryBuilder('deal')
      .select('DISTINCT deal.store', 'store')
      .where('deal.isActive = :isActive', { isActive: true })
      .andWhere('deal.store IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.store).filter(Boolean);
  }
}
