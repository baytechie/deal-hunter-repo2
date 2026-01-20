import { Controller, Get, Delete, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * NotificationsController - REST API endpoints for notifications
 *
 * Endpoints:
 * - GET /notifications - List recent notifications (last 7 days)
 * - GET /notifications/unread-count - Get unread count for badge
 * - DELETE /notifications/cleanup - Manually trigger cleanup
 */
@Controller('notifications')
export class NotificationsController {
  private readonly context = 'NotificationsController';

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get all recent notifications (last 7 days)
   */
  @Get()
  async getNotifications(@Query() query: GetNotificationsQueryDto) {
    this.logger.debug(`GET /notifications - limit: ${query.limit}`, this.context);
    const notifications = await this.notificationsService.getRecentNotifications();
    return notifications.slice(0, query.limit);
  }

  /**
   * Get unread notification count for badge display
   */
  @Get('unread-count')
  async getUnreadCount() {
    this.logger.debug('GET /notifications/unread-count', this.context);
    const count = await this.notificationsService.getUnreadCount();
    return { count };
  }

  /**
   * Manually trigger cleanup of old notifications
   * Useful for admin/maintenance operations
   */
  @Delete('cleanup')
  async cleanup() {
    this.logger.debug('DELETE /notifications/cleanup', this.context);
    const deletedCount = await this.notificationsService.cleanupOldNotifications();
    return { deletedCount, message: `Deleted ${deletedCount} old notifications` };
  }

  /**
   * Test endpoint to verify notification creation works
   * This creates a test notification with string values to verify toFixed fix
   * TODO: Remove this endpoint after verification
   */
  @Post('test')
  async createTestNotification() {
    this.logger.debug('POST /notifications/test - Creating test notification', this.context);

    // Simulate values as they might come from the database (as strings)
    const testDealId = 'test-deal-' + Date.now();
    const testTitle = 'Test Deal - Verification';
    const testPrice = '29.99' as unknown as number; // Simulate string from DB
    const testDiscount = '45' as unknown as number; // Simulate string from DB

    const notification = await this.notificationsService.createNewDealNotification(
      testDealId,
      testTitle,
      testPrice,
      testDiscount,
      'https://via.placeholder.com/150',
    );

    return {
      success: true,
      message: 'Test notification created successfully',
      notification,
    };
  }
}
