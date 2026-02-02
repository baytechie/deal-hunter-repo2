import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '../../shared/services/logger.service';
import { RssFeedSource } from './entities/rss-feed-source.entity';
import { RssFeedDeal } from './entities/rss-feed-deal.entity';
import {
  IRssFeedsRepository,
  RSS_FEEDS_REPOSITORY,
  RssFeedDealFilterOptions,
  PaginationOptions,
  SortingOptions,
  PaginatedResult,
} from './repositories/rss-feeds.repository.interface';
import { RssCrawlerService, ParsedRssItem, CrawlResult } from './services/rss-crawler.service';
import { CreateRssFeedSourceDto } from './dto/create-rss-feed-source.dto';
import { UpdateRssFeedSourceDto } from './dto/update-rss-feed-source.dto';

/**
 * RssFeedsService - Business logic for RSS feed management
 *
 * Handles:
 * - CRUD operations for RSS feed sources
 * - Crawling and importing deals from RSS feeds
 * - Scheduled crawling based on source configuration
 * - Deal filtering and retrieval
 */
@Injectable()
export class RssFeedsService {
  private readonly context = 'RssFeedsService';

  constructor(
    @Inject(RSS_FEEDS_REPOSITORY)
    private readonly repository: IRssFeedsRepository,
    private readonly crawler: RssCrawlerService,
    private readonly logger: LoggerService,
  ) {}

  // =====================
  // RSS Feed Source Operations
  // =====================

  /**
   * Get all RSS feed sources
   */
  async getAllSources(): Promise<RssFeedSource[]> {
    this.logger.log('Retrieving all RSS feed sources', this.context);
    return this.repository.findAllSources();
  }

  /**
   * Get a single RSS feed source by ID
   */
  async getSourceById(id: string): Promise<RssFeedSource> {
    this.logger.log(`Retrieving RSS feed source: ${id}`, this.context);
    const source = await this.repository.findSourceById(id);
    if (!source) {
      throw new NotFoundException(`RSS feed source with ID ${id} not found`);
    }
    return source;
  }

  /**
   * Create a new RSS feed source
   */
  async createSource(dto: CreateRssFeedSourceDto): Promise<RssFeedSource> {
    this.logger.log(`Creating new RSS feed source: ${dto.name} - url: ${dto.url}`, this.context);
    return this.repository.createSource(dto);
  }

  /**
   * Update an RSS feed source
   */
  async updateSource(id: string, dto: UpdateRssFeedSourceDto): Promise<RssFeedSource> {
    this.logger.log(`Updating RSS feed source: ${id}`, this.context);
    const source = await this.repository.updateSource(id, dto);
    if (!source) {
      throw new NotFoundException(`RSS feed source with ID ${id} not found`);
    }
    return source;
  }

  /**
   * Delete an RSS feed source
   */
  async deleteSource(id: string): Promise<void> {
    this.logger.log(`Deleting RSS feed source: ${id}`, this.context);
    const deleted = await this.repository.deleteSource(id);
    if (!deleted) {
      throw new NotFoundException(`RSS feed source with ID ${id} not found`);
    }
  }

  // =====================
  // RSS Feed Deal Operations
  // =====================

  /**
   * Get all RSS feed deals with filtering and pagination
   */
  async getDeals(
    filters?: RssFeedDealFilterOptions,
    pagination?: PaginationOptions,
    sorting?: SortingOptions,
  ): Promise<PaginatedResult<RssFeedDeal>> {
    this.logger.log(`Retrieving RSS feed deals - page: ${pagination?.page}, limit: ${pagination?.limit}`, this.context);
    return this.repository.findAllDeals(filters, pagination, sorting);
  }

  /**
   * Get a single RSS feed deal by ID
   */
  async getDealById(id: string): Promise<RssFeedDeal> {
    this.logger.log(`Retrieving RSS feed deal: ${id}`, this.context);
    const deal = await this.repository.findDealById(id);
    if (!deal) {
      throw new NotFoundException(`RSS feed deal with ID ${id} not found`);
    }

    // Increment view count
    await this.repository.incrementViewCount(id);

    return deal;
  }

  /**
   * Get hot deals from RSS feeds
   */
  async getHotDeals(limit: number = 10): Promise<RssFeedDeal[]> {
    this.logger.log(`Retrieving hot RSS feed deals - limit: ${limit}`, this.context);
    return this.repository.findHotDeals(limit);
  }

  /**
   * Get featured deals from RSS feeds
   */
  async getFeaturedDeals(limit: number = 10): Promise<RssFeedDeal[]> {
    this.logger.log(`Retrieving featured RSS feed deals - limit: ${limit}`, this.context);
    return this.repository.findFeaturedDeals(limit);
  }

  /**
   * Get deals from a specific source
   */
  async getDealsBySource(sourceId: string, limit: number = 20): Promise<RssFeedDeal[]> {
    this.logger.log(`Retrieving deals from source: ${sourceId} - limit: ${limit}`, this.context);
    return this.repository.findDealsBySource(sourceId, limit);
  }

  /**
   * Record a click on a deal
   */
  async recordClick(id: string): Promise<void> {
    this.logger.log(`Recording click for deal: ${id}`, this.context);
    const deal = await this.repository.findDealById(id);
    if (!deal) {
      throw new NotFoundException(`RSS feed deal with ID ${id} not found`);
    }
    await this.repository.incrementClickCount(id);
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    return this.repository.getCategories();
  }

  /**
   * Get all available stores
   */
  async getStores(): Promise<string[]> {
    return this.repository.getStores();
  }

  // =====================
  // Crawling Operations
  // =====================

  /**
   * Crawl a specific RSS feed source
   */
  async crawlSource(sourceId: string): Promise<CrawlResult> {
    const source = await this.getSourceById(sourceId);
    return this.crawlFeed(source);
  }

  /**
   * Crawl all active RSS feed sources
   */
  async crawlAllSources(): Promise<CrawlResult[]> {
    this.logger.log('Starting crawl of all active RSS feed sources', this.context);
    const sources = await this.repository.findActiveSources();
    const results: CrawlResult[] = [];

    for (const source of sources) {
      try {
        const result = await this.crawlFeed(source);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to crawl source ${source.name}: ${error.message}`,
          error.stack,
          this.context,
        );
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: false,
          itemsCrawled: 0,
          newItems: 0,
          errors: [error.message],
        });
      }
    }

    this.logger.log(
      `Completed crawl - total: ${sources.length}, successful: ${results.filter((r) => r.success).length}`,
      this.context,
    );

    return results;
  }

  /**
   * Scheduled crawl - runs every 10 minutes
   * Only crawls sources that are due for crawling based on their interval
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async scheduledCrawl(): Promise<void> {
    this.logger.log('Starting scheduled RSS feed crawl', this.context);

    const sourcesDue = await this.repository.findSourcesDueForCrawl();
    if (sourcesDue.length === 0) {
      this.logger.log('No RSS feed sources due for crawling', this.context);
      return;
    }

    this.logger.log(`Found ${sourcesDue.length} sources due for crawling`, this.context);

    for (const source of sourcesDue) {
      try {
        await this.crawlFeed(source);
      } catch (error) {
        this.logger.error(
          `Scheduled crawl failed for ${source.name}: ${error.message}`,
          error.stack,
          this.context,
        );
      }
    }
  }

  /**
   * Scheduled cleanup - runs daily at midnight
   * Removes expired deals and old inactive items
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledCleanup(): Promise<void> {
    this.logger.log('Starting scheduled RSS feed cleanup', this.context);

    const deleted = await this.repository.deleteExpiredDeals();
    this.logger.log(`Deleted ${deleted} expired RSS feed deals`, this.context);
  }

  /**
   * Crawl a single feed and import deals
   */
  private async crawlFeed(source: RssFeedSource): Promise<CrawlResult> {
    const result: CrawlResult = {
      sourceId: source.id,
      sourceName: source.name,
      success: false,
      itemsCrawled: 0,
      newItems: 0,
      errors: [],
    };

    try {
      this.logger.log(`Crawling RSS feed: ${source.name}`, this.context);

      const items = await this.crawler.fetchFeed(source);
      result.itemsCrawled = items.length;

      // Import each item, skipping duplicates
      for (const item of items) {
        try {
          const existing = await this.repository.findDealByGuid(item.guid);
          if (!existing) {
            await this.importDeal(item, source);
            result.newItems++;
          }
        } catch (importError) {
          this.logger.warn(`Failed to import deal: ${item.title} - ${importError.message}`, this.context);
          result.errors.push(`Import failed for "${item.title}": ${importError.message}`);
        }
      }

      // Update source crawl metadata
      await this.repository.updateSource(source.id, {
        lastCrawledAt: new Date(),
        totalItemsCrawled: source.totalItemsCrawled + result.newItems,
        errorCount: result.errors.length > 0 ? source.errorCount + 1 : 0,
        lastError: result.errors.length > 0 ? result.errors[0] : null,
      });

      result.success = true;
      this.logger.log(
        `Crawl complete for ${source.name} - crawled: ${result.itemsCrawled}, new: ${result.newItems}`,
        this.context,
      );
    } catch (error) {
      result.errors.push(error.message);

      // Update source error count
      await this.repository.updateSource(source.id, {
        errorCount: source.errorCount + 1,
        lastError: error.message,
      });

      this.logger.error(`Crawl failed for ${source.name}: ${error.message}`, error.stack, this.context);
    }

    return result;
  }

  /**
   * Import a parsed RSS item as a deal
   */
  private async importDeal(item: ParsedRssItem, source: RssFeedSource): Promise<RssFeedDeal> {
    // Calculate discount percentage if we have both prices
    let discountPercentage: number | undefined;
    if (item.originalPrice && item.price && item.originalPrice > item.price) {
      discountPercentage = Math.round(
        ((item.originalPrice - item.price) / item.originalPrice) * 100,
      );
    }

    // Determine if deal is "hot" based on discount
    const isHot = discountPercentage !== undefined && discountPercentage >= 50;

    return this.repository.createDeal({
      title: item.title,
      description: item.description,
      link: item.link,
      guid: item.guid,
      imageUrl: item.imageUrl,
      category: item.category || source.category,
      price: item.price,
      originalPrice: item.originalPrice,
      discountPercentage,
      store: item.store,
      couponCode: item.couponCode,
      publishedAt: item.publishedAt,
      isHot,
      sourceId: source.id,
    });
  }
}
