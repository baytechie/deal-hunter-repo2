import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '../../shared/services/logger.service';
import { RssFeedsService } from './rss-feeds.service';
import { RssFeedSource } from './entities/rss-feed-source.entity';
import { RssFeedDeal } from './entities/rss-feed-deal.entity';
import { CreateRssFeedSourceDto } from './dto/create-rss-feed-source.dto';
import { UpdateRssFeedSourceDto } from './dto/update-rss-feed-source.dto';
import { GetRssFeedsQueryDto } from './dto/get-rss-feeds-query.dto';
import { PaginatedResult } from './repositories/rss-feeds.repository.interface';
import { CrawlResult } from './services/rss-crawler.service';

/**
 * RssFeedsController - REST API endpoints for RSS feed management
 *
 * Endpoints:
 * - Sources: CRUD operations for RSS feed sources
 * - Deals: Retrieval and filtering of crawled deals
 * - Crawling: Manual trigger for feed crawling
 */
@Controller('rss-feeds')
export class RssFeedsController {
  private readonly context = 'RssFeedsController';

  constructor(
    private readonly rssFeedsService: RssFeedsService,
    private readonly logger: LoggerService,
  ) {}

  // =====================
  // RSS Feed Source Endpoints
  // =====================

  /**
   * GET /rss-feeds/sources
   * Get all RSS feed sources
   */
  @Get('sources')
  async getAllSources(): Promise<RssFeedSource[]> {
    this.logger.log('GET /rss-feeds/sources', this.context);
    return this.rssFeedsService.getAllSources();
  }

  /**
   * GET /rss-feeds/sources/:id
   * Get a single RSS feed source by ID
   */
  @Get('sources/:id')
  async getSourceById(@Param('id', ParseUUIDPipe) id: string): Promise<RssFeedSource> {
    this.logger.log(`GET /rss-feeds/sources/${id}`, this.context);
    return this.rssFeedsService.getSourceById(id);
  }

  /**
   * POST /rss-feeds/sources
   * Create a new RSS feed source
   */
  @Post('sources')
  @HttpCode(HttpStatus.CREATED)
  async createSource(@Body() dto: CreateRssFeedSourceDto): Promise<RssFeedSource> {
    this.logger.log(`POST /rss-feeds/sources - name: ${dto.name}`, this.context);
    return this.rssFeedsService.createSource(dto);
  }

  /**
   * PATCH /rss-feeds/sources/:id
   * Update an RSS feed source
   */
  @Patch('sources/:id')
  async updateSource(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRssFeedSourceDto,
  ): Promise<RssFeedSource> {
    this.logger.log(`PATCH /rss-feeds/sources/${id}`, this.context);
    return this.rssFeedsService.updateSource(id, dto);
  }

  /**
   * DELETE /rss-feeds/sources/:id
   * Delete an RSS feed source
   */
  @Delete('sources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSource(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`DELETE /rss-feeds/sources/${id}`, this.context);
    return this.rssFeedsService.deleteSource(id);
  }

  // =====================
  // RSS Feed Deal Endpoints
  // =====================

  /**
   * GET /rss-feeds/deals
   * Get all RSS feed deals with filtering and pagination
   */
  @Get('deals')
  async getDeals(@Query() query: GetRssFeedsQueryDto): Promise<PaginatedResult<RssFeedDeal>> {
    this.logger.log(`GET /rss-feeds/deals - page: ${query.page}, limit: ${query.limit}`, this.context);

    const filters = {
      category: query.category,
      store: query.store,
      search: query.search,
      isHot: query.isHot,
      isFeatured: query.isFeatured,
      minDiscount: query.minDiscount,
      sourceId: query.sourceId,
    };

    const pagination = {
      page: query.page || 1,
      limit: query.limit || 20,
    };

    const sorting = {
      field: query.sortField || 'publishedAt',
      order: query.sortOrder || 'DESC',
    };

    return this.rssFeedsService.getDeals(filters, pagination, sorting);
  }

  /**
   * GET /rss-feeds/deals/hot
   * Get hot deals from RSS feeds
   */
  @Get('deals/hot')
  async getHotDeals(@Query('limit') limit?: number): Promise<RssFeedDeal[]> {
    this.logger.log(`GET /rss-feeds/deals/hot - limit: ${limit || 10}`, this.context);
    return this.rssFeedsService.getHotDeals(limit || 10);
  }

  /**
   * GET /rss-feeds/deals/featured
   * Get featured deals from RSS feeds
   */
  @Get('deals/featured')
  async getFeaturedDeals(@Query('limit') limit?: number): Promise<RssFeedDeal[]> {
    this.logger.log(`GET /rss-feeds/deals/featured - limit: ${limit || 10}`, this.context);
    return this.rssFeedsService.getFeaturedDeals(limit || 10);
  }

  /**
   * GET /rss-feeds/deals/categories
   * Get all available categories
   */
  @Get('deals/categories')
  async getCategories(): Promise<string[]> {
    this.logger.log('GET /rss-feeds/deals/categories', this.context);
    return this.rssFeedsService.getCategories();
  }

  /**
   * GET /rss-feeds/deals/stores
   * Get all available stores
   */
  @Get('deals/stores')
  async getStores(): Promise<string[]> {
    this.logger.log('GET /rss-feeds/deals/stores', this.context);
    return this.rssFeedsService.getStores();
  }

  /**
   * GET /rss-feeds/deals/:id
   * Get a single RSS feed deal by ID
   */
  @Get('deals/:id')
  async getDealById(@Param('id', ParseUUIDPipe) id: string): Promise<RssFeedDeal> {
    this.logger.log(`GET /rss-feeds/deals/${id}`, this.context);
    return this.rssFeedsService.getDealById(id);
  }

  /**
   * POST /rss-feeds/deals/:id/click
   * Record a click on a deal
   */
  @Post('deals/:id/click')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordClick(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`POST /rss-feeds/deals/${id}/click`, this.context);
    return this.rssFeedsService.recordClick(id);
  }

  // =====================
  // Crawling Endpoints
  // =====================

  /**
   * POST /rss-feeds/crawl
   * Trigger a crawl of all active RSS feed sources
   */
  @Post('crawl')
  @HttpCode(HttpStatus.OK)
  async crawlAllSources(): Promise<CrawlResult[]> {
    this.logger.log('POST /rss-feeds/crawl', this.context);
    return this.rssFeedsService.crawlAllSources();
  }

  /**
   * POST /rss-feeds/crawl/:sourceId
   * Trigger a crawl of a specific RSS feed source
   */
  @Post('crawl/:sourceId')
  @HttpCode(HttpStatus.OK)
  async crawlSource(@Param('sourceId', ParseUUIDPipe) sourceId: string): Promise<CrawlResult> {
    this.logger.log(`POST /rss-feeds/crawl/${sourceId}`, this.context);
    return this.rssFeedsService.crawlSource(sourceId);
  }
}
