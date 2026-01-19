import {
  Controller,
  Delete,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DealsService } from '../deals/deals.service';
import { PendingDealsService } from '../pending-deals/pending-deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * AdminController handles administrative operations.
 * All endpoints require JWT authentication.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly context = 'AdminController';

  constructor(
    private readonly dealsService: DealsService,
    private readonly pendingDealsService: PendingDealsService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * GET /admin/logs
   * Get backend logs with optional filtering
   */
  @Get('logs')
  async getLogs(
    @Query('level') level?: string,
    @Query('context') context?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Request() req?,
  ) {
    this.logger.debug(
      `[${req?.user?.email || 'system'}] Fetching logs with filters: level=${level}, context=${context}, search=${search}`,
      this.context,
    );

    const logs = this.logger.getLogs({
      level,
      context,
      search,
      limit: limit ? parseInt(limit, 10) : 500,
    });

    return {
      data: logs,
      total: logs.length,
    };
  }

  /**
   * DELETE /admin/logs
   * Clear all stored logs
   */
  @Delete('logs')
  async clearLogs(@Request() req) {
    this.logger.warn(
      `[${req.user.email}] Clearing all stored logs`,
      this.context,
    );

    this.logger.clearLogs();

    return {
      message: 'All logs cleared successfully',
    };
  }

  /**
   * DELETE /admin/deals
   * Clear all deals from the database
   */
  @Delete('deals')
  async clearAllDeals(@Request() req) {
    this.logger.warn(
      `[${req.user.email}] Clearing all deals from database`,
      this.context,
    );

    const deletedCount = await this.dealsService.clearAll();

    this.logger.log(
      `[${req.user.email}] Cleared ${deletedCount} deals`,
      this.context,
    );

    return {
      message: 'All deals cleared successfully',
      deletedCount,
    };
  }

  /**
   * DELETE /admin/pending-deals
   * Clear all pending deals from the database
   */
  @Delete('pending-deals')
  async clearAllPendingDeals(@Request() req) {
    this.logger.warn(
      `[${req.user.email}] Clearing all pending deals from database`,
      this.context,
    );

    const deletedCount = await this.pendingDealsService.clearAll();

    this.logger.log(
      `[${req.user.email}] Cleared ${deletedCount} pending deals`,
      this.context,
    );

    return {
      message: 'All pending deals cleared successfully',
      deletedCount,
    };
  }
}
