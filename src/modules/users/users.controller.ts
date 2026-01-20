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
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveDealDto, UpdateSavedDealAlertDto } from './dto/save-deal.dto';
import { RegisterFcmTokenDto } from './dto/fcm-token.dto';
import { LoggerService } from '../../shared/services/logger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginatedResult } from './repositories/users.repository.interface';
import { SavedDeal } from './entities/saved-deal.entity';

/**
 * UsersController - HTTP layer for user endpoints
 *
 * All endpoints require authentication via JWT
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly context = 'UsersController';

  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * GET /users/me/saved-deals
   * Get current user's saved deals
   */
  @Get('me/saved-deals')
  async getSavedDeals(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<SavedDeal>> {
    const requestId = this.generateRequestId();
    const userId = req.user.sub;

    this.logger.log(
      `[${requestId}] ENTRY: GET /users/me/saved-deals - User: ${userId}`,
      this.context,
    );

    try {
      const result = await this.usersService.getSavedDeals(userId, {
        page: page ?? 1,
        limit: limit ?? 10,
      });

      this.logger.log(
        `[${requestId}] EXIT: GET /users/me/saved-deals - Returned ${result.data.length} saved deals`,
        this.context,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: GET /users/me/saved-deals failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * POST /users/me/saved-deals/:dealId
   * Save a deal
   */
  @Post('me/saved-deals/:dealId')
  async saveDeal(
    @Req() req: any,
    @Param('dealId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) dealId: string,
    @Body() saveDealDto: SaveDealDto,
  ): Promise<{ success: boolean; savedDeal: SavedDeal }> {
    const requestId = this.generateRequestId();
    const userId = req.user.sub;

    this.logger.log(
      `[${requestId}] ENTRY: POST /users/me/saved-deals/${dealId} - User: ${userId}`,
      this.context,
    );

    try {
      const savedDeal = await this.usersService.saveDeal(
        userId,
        dealId,
        saveDealDto.priceAlertEnabled,
        saveDealDto.priceAlertThreshold,
        saveDealDto.notes,
      );

      this.logger.log(
        `[${requestId}] EXIT: POST /users/me/saved-deals/${dealId} - Deal saved`,
        this.context,
      );

      return { success: true, savedDeal };
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: POST /users/me/saved-deals/${dealId} failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * PATCH /users/me/saved-deals/:dealId/alert
   * Update alert settings for a saved deal
   */
  @Patch('me/saved-deals/:dealId/alert')
  async updateSavedDealAlert(
    @Req() req: any,
    @Param('dealId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) dealId: string,
    @Body() updateDto: UpdateSavedDealAlertDto,
  ): Promise<{ success: boolean }> {
    const requestId = this.generateRequestId();
    const userId = req.user.sub;

    this.logger.log(
      `[${requestId}] ENTRY: PATCH /users/me/saved-deals/${dealId}/alert - User: ${userId}`,
      this.context,
    );

    try {
      await this.usersService.updateSavedDealAlert(userId, dealId, updateDto.enabled, updateDto.threshold);

      this.logger.log(
        `[${requestId}] EXIT: PATCH /users/me/saved-deals/${dealId}/alert - Alert updated`,
        this.context,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: PATCH /users/me/saved-deals/${dealId}/alert failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * DELETE /users/me/saved-deals/:dealId
   * Unsave a deal
   */
  @Delete('me/saved-deals/:dealId')
  async unsaveDeal(
    @Req() req: any,
    @Param('dealId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) dealId: string,
  ): Promise<{ success: boolean }> {
    const requestId = this.generateRequestId();
    const userId = req.user.sub;

    this.logger.log(
      `[${requestId}] ENTRY: DELETE /users/me/saved-deals/${dealId} - User: ${userId}`,
      this.context,
    );

    try {
      await this.usersService.unsaveDeal(userId, dealId);

      this.logger.log(
        `[${requestId}] EXIT: DELETE /users/me/saved-deals/${dealId} - Deal unsaved`,
        this.context,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: DELETE /users/me/saved-deals/${dealId} failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * POST /users/me/fcm-tokens
   * Register FCM token for push notifications
   */
  @Post('me/fcm-tokens')
  async registerFcmToken(
    @Req() req: any,
    @Body() registerDto: RegisterFcmTokenDto,
  ): Promise<{ success: boolean }> {
    const requestId = this.generateRequestId();
    const userId = req.user.sub;

    this.logger.log(
      `[${requestId}] ENTRY: POST /users/me/fcm-tokens - User: ${userId}`,
      this.context,
    );

    try {
      await this.usersService.registerFcmToken(
        userId,
        registerDto.fcmToken,
        registerDto.platform,
        registerDto.deviceId,
      );

      this.logger.log(
        `[${requestId}] EXIT: POST /users/me/fcm-tokens - Token registered`,
        this.context,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: POST /users/me/fcm-tokens failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * DELETE /users/me/fcm-tokens/:tokenId
   * Unregister FCM token
   */
  @Delete('me/fcm-tokens/:tokenId')
  async deactivateFcmToken(
    @Req() req: any,
    @Param('tokenId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) tokenId: string,
  ): Promise<{ success: boolean }> {
    const requestId = this.generateRequestId();
    const userId = req.user.sub;

    this.logger.log(
      `[${requestId}] ENTRY: DELETE /users/me/fcm-tokens/${tokenId} - User: ${userId}`,
      this.context,
    );

    try {
      await this.usersService.deactivateFcmToken(userId, tokenId);

      this.logger.log(
        `[${requestId}] EXIT: DELETE /users/me/fcm-tokens/${tokenId} - Token deactivated`,
        this.context,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `[${requestId}] ERROR: DELETE /users/me/fcm-tokens/${tokenId} failed - ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * Generate a unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
