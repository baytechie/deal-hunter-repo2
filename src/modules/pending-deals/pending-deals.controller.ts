import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { PendingDealsService } from './pending-deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncDealsDto } from './dto/sync-deals.dto';
import { ApproveDealDto } from './dto/approve-deal.dto';
import { RejectDealDto } from './dto/reject-deal.dto';
import { GetPendingDealsQueryDto } from './dto/get-pending-deals-query.dto';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * PendingDealsController handles admin workflow for deal approval.
 * All endpoints require JWT authentication.
 */
@Controller('pending-deals')
@UseGuards(JwtAuthGuard)
export class PendingDealsController {
  private readonly context = 'PendingDealsController';

  constructor(
    private readonly pendingDealsService: PendingDealsService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /pending-deals/sync
   * Sync deals from Amazon PAAPI
   */
  @Post('sync')
  async sync(@Body() dto: SyncDealsDto, @Request() req) {
    this.logger.log(
      `[${req.user.email}] Sync request: ${JSON.stringify(dto)}`,
      this.context,
    );

    const result = await this.pendingDealsService.syncFromAmazon(dto);

    this.logger.log(
      `[${req.user.email}] Sync complete: ${result.created} created, ${result.skipped} skipped`,
      this.context,
    );

    return result;
  }

  /**
   * GET /pending-deals/stats
   * Get pending deal statistics
   */
  @Get('stats')
  async getStats(@Request() req) {
    this.logger.log(`[${req.user.email}] Requesting stats`, this.context);
    return this.pendingDealsService.getStats();
  }

  /**
   * GET /pending-deals
   * List pending deals with filters and pagination
   */
  @Get()
  async findAll(@Query() query: GetPendingDealsQueryDto, @Request() req) {
    this.logger.log(
      `[${req.user.email}] List pending deals: ${JSON.stringify(query)}`,
      this.context,
    );
    return this.pendingDealsService.findAll(query);
  }

  /**
   * GET /pending-deals/:id
   * Get a single pending deal by ID
   */
  @Get(':id')
  async findById(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Request() req,
  ) {
    this.logger.log(`[${req.user.email}] Get pending deal: ${id}`, this.context);
    return this.pendingDealsService.findById(id);
  }

  /**
   * POST /pending-deals/:id/approve
   * Approve a pending deal and create a published Deal
   */
  @Post(':id/approve')
  async approve(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Body() dto: ApproveDealDto,
    @Request() req,
  ) {
    this.logger.log(
      `[${req.user.email}] Approving deal ${id}: ${JSON.stringify(dto)}`,
      this.context,
    );
    return this.pendingDealsService.approve(id, req.user.userId, dto);
  }

  /**
   * POST /pending-deals/:id/reject
   * Reject a pending deal with a reason
   */
  @Post(':id/reject')
  async reject(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Body() dto: RejectDealDto,
    @Request() req,
  ) {
    this.logger.log(
      `[${req.user.email}] Rejecting deal ${id}: ${dto.reason}`,
      this.context,
    );
    return this.pendingDealsService.reject(id, req.user.userId, dto);
  }

  /**
   * DELETE /pending-deals/:id
   * Delete a pending deal
   */
  @Delete(':id')
  async delete(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Request() req,
  ) {
    this.logger.log(`[${req.user.email}] Deleting pending deal: ${id}`, this.context);
    await this.pendingDealsService.delete(id);
    return { message: 'Pending deal deleted successfully' };
  }
}
