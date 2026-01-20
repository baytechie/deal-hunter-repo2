import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { GetDealsQueryDto, LimitQueryDto, CreateDealDto } from './dto';
import { LoggerService } from '../../shared/services/logger.service';
import { Deal } from './entities/deal.entity';
import { PaginatedResult } from './repositories/deals.repository.interface';

/**
 * DealsController - HTTP layer for deals endpoints
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles HTTP concerns (request/response)
 * - Dependency Inversion: Depends on DealsService abstraction
 * 
 * Features:
 * - Extensive logging at entry and exit of every method
 * - Pagination support
 * - Category filtering
 */
@Controller('deals')
export class DealsController {
  private readonly context = 'DealsController';

  constructor(
    private readonly dealsService: DealsService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * GET /deals
   * Get all deals with pagination and optional filters
   * 
   * Query Parameters:
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10, max: 100)
   * - category: Filter by category
   * - isHot: Filter hot deals
   * - isFeatured: Filter featured deals
   * - minDiscount: Minimum discount percentage
   * - maxPrice: Maximum price filter
   */
  @Get()
  async findAll(@Query() query: GetDealsQueryDto): Promise<PaginatedResult<Deal>> {
    const requestId = this.generateRequestId();
    
    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals - Query params: ${JSON.stringify(query)}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Processing findAll with page=${query.page}, limit=${query.limit}`,
      this.context,
    );

    try {
      const filters = {
        category: query.category,
        isHot: query.isHot,
        isFeatured: query.isFeatured,
        minDiscount: query.minDiscount,
        maxPrice: query.maxPrice,
      };

      const pagination = {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      };

      const result = await this.dealsService.findAll(filters, pagination);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals - Returned ${result.data.length} deals (total: ${result.total}, page: ${result.page}/${result.totalPages})`,
        this.context,
      );
      this.logger.debug(
        `[${requestId}] Response details: ${JSON.stringify({
          count: result.data.length,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        })}`,
        this.context,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * GET /deals/top
   * Get top deals sorted by highest discount percentage
   */
  @Get('top')
  async findTopDeals(@Query() query: LimitQueryDto): Promise<Deal[]> {
    const requestId = this.generateRequestId();
    const limit = query.limit ?? 10;

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals/top - Limit: ${limit}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Fetching top ${limit} deals by discount percentage`,
      this.context,
    );

    try {
      const deals = await this.dealsService.findTopDeals(limit);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals/top - Returned ${deals.length} top deals`,
        this.context,
      );
      this.logger.debug(
        `[${requestId}] Top deal discounts: ${deals.map((d) => `${d.title}: ${d.discountPercentage}%`).join(', ')}`,
        this.context,
      );

      return deals;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals/top failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * GET /deals/hot
   * Get hot deals - trending and popular deals
   */
  @Get('hot')
  async findHotDeals(@Query() query: LimitQueryDto): Promise<Deal[]> {
    const requestId = this.generateRequestId();
    const limit = query.limit ?? 10;

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals/hot - Limit: ${limit}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Fetching ${limit} hot deals`,
      this.context,
    );

    try {
      const deals = await this.dealsService.findHotDeals(limit);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals/hot - Returned ${deals.length} hot deals`,
        this.context,
      );
      this.logger.debug(
        `[${requestId}] Hot deals returned: ${deals.map((d) => d.title).join(', ')}`,
        this.context,
      );

      return deals;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals/hot failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * GET /deals/featured
   * Get featured deals - editorially selected deals
   */
  @Get('featured')
  async findFeaturedDeals(@Query() query: LimitQueryDto): Promise<Deal[]> {
    const requestId = this.generateRequestId();
    const limit = query.limit ?? 10;

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals/featured - Limit: ${limit}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Fetching ${limit} featured deals`,
      this.context,
    );

    try {
      const deals = await this.dealsService.findFeaturedDeals(limit);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals/featured - Returned ${deals.length} featured deals`,
        this.context,
      );
      this.logger.debug(
        `[${requestId}] Featured deals: ${deals.map((d) => d.title).join(', ')}`,
        this.context,
      );

      return deals;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals/featured failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * GET /deals/categories
   * Get all available deal categories
   */
  @Get('categories')
  async getCategories(): Promise<string[]> {
    const requestId = this.generateRequestId();

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals/categories`,
      this.context,
    );

    try {
      const categories = await this.dealsService.getCategories();

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals/categories - Returned ${categories.length} categories`,
        this.context,
      );
      this.logger.debug(
        `[${requestId}] Categories: ${categories.join(', ')}`,
        this.context,
      );

      return categories;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals/categories failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * GET /deals/active
   * Get active deals for mobile app (approved and not expired)
   */
  @Get('active')
  async findActiveDeals(@Query() query: GetDealsQueryDto): Promise<PaginatedResult<Deal>> {
    const requestId = this.generateRequestId();

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals/active - Query params: ${JSON.stringify(query)}`,
      this.context,
    );

    try {
      const filters = {
        category: query.category,
        isHot: query.isHot,
        isFeatured: query.isFeatured,
        minDiscount: query.minDiscount,
        maxPrice: query.maxPrice,
      };

      const pagination = {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      };

      const result = await this.dealsService.findActiveDeals(filters, pagination);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals/active - Returned ${result.data.length} active deals (total: ${result.total})`,
        this.context,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals/active failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * GET /deals/:id
   * Get a single deal by ID
   */
  @Get(':id')
  async findById(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
  ): Promise<Deal> {
    const requestId = this.generateRequestId();

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: GET /deals/${id}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Fetching deal with ID: ${id}`,
      this.context,
    );

    try {
      const deal = await this.dealsService.findById(id);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: GET /deals/${id} - Found deal: ${deal.title}`,
        this.context,
      );
      this.logger.debug(
        `[${requestId}] Deal details: ${JSON.stringify({
          id: deal.id,
          title: deal.title,
          price: deal.price,
          discount: deal.discountPercentage,
        })}`,
        this.context,
      );

      return deal;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /deals/${id} failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * POST /deals
   * Create a new deal
   */
  @Post()
  async create(@Body() createDealDto: CreateDealDto): Promise<Deal> {
    const requestId = this.generateRequestId();

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: POST /deals - Creating deal: ${createDealDto.title}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Deal data: ${JSON.stringify(createDealDto)}`,
      this.context,
    );

    try {
      const deal = await this.dealsService.create(createDealDto);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: POST /deals - Deal created: ${deal.id}`,
        this.context,
      );

      return deal;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: POST /deals failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * PATCH /deals/:id
   * Update an existing deal
   */
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Body() updateDealDto: Partial<CreateDealDto>,
  ): Promise<Deal> {
    const requestId = this.generateRequestId();

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: PATCH /deals/${id}`,
      this.context,
    );
    this.logger.debug(
      `[${requestId}] Update data: ${JSON.stringify(updateDealDto)}`,
      this.context,
    );

    try {
      const deal = await this.dealsService.update(id, updateDealDto);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: PATCH /deals/${id} - Deal updated`,
        this.context,
      );

      return deal;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: PATCH /deals/${id} failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * DELETE /deals/:id
   * Delete a deal
   */
  @Delete(':id')
  async delete(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
  ): Promise<{ success: boolean }> {
    const requestId = this.generateRequestId();

    // Entry logging
    this.logger.log(
      `[${requestId}] ENTRY: DELETE /deals/${id}`,
      this.context,
    );

    try {
      await this.dealsService.delete(id);

      // Exit logging
      this.logger.log(
        `[${requestId}] EXIT: DELETE /deals/${id} - Deal deleted`,
        this.context,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: DELETE /deals/${id} failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * Generate a unique request ID for tracing
   * Helps correlate entry/exit logs for the same request
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
