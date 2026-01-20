import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import {
  INotificationsRepository,
  NOTIFICATIONS_REPOSITORY,
  CreateNotificationData,
} from './repositories/notifications.repository.interface';
import { NotificationType } from './types/notification-type.enum';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * NotificationsService - Handles business logic for notifications
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only contains notification-related business logic
 * - Dependency Inversion: Depends on INotificationsRepository interface
 *
 * Features:
 * - Auto-cleanup of notifications older than 7 days
 * - Creates notifications for new deals and price changes
 */
@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly context = 'NotificationsService';
  private readonly RETENTION_DAYS = 7;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly notificationsRepository: INotificationsRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Run cleanup on module initialization and set up periodic cleanup
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing notifications service', this.context);
    await this.cleanupOldNotifications();

    // Run cleanup every 6 hours
    this.cleanupInterval = setInterval(
      () => this.cleanupOldNotifications(),
      6 * 60 * 60 * 1000,
    );
  }

  /**
   * Get all recent notifications (last 7 days)
   */
  async getRecentNotifications(): Promise<Notification[]> {
    this.logger.debug('Fetching recent notifications', this.context);
    const notifications = await this.notificationsRepository.findRecent();
    this.logger.debug(`Found ${notifications.length} recent notifications`, this.context);
    return notifications;
  }

  /**
   * Get unread notification count (for badge)
   */
  async getUnreadCount(): Promise<number> {
    this.logger.debug('Getting unread count', this.context);
    const count = await this.notificationsRepository.countRecent();
    this.logger.debug(`Unread count: ${count}`, this.context);
    return count;
  }

  /**
   * Create a notification for a new deal
   */
  async createNewDealNotification(
    dealId: string,
    dealTitle: string,
    price: number,
    discountPercentage: number,
    imageUrl?: string,
  ): Promise<Notification> {
    this.logger.debug(`Creating new deal notification for: ${dealTitle}`, this.context);

    // Ensure numeric values are proper numbers (may come as strings from DB)
    const priceNum = Number(price) || 0;
    const discountNum = Number(discountPercentage) || 0;

    const data: CreateNotificationData = {
      type: NotificationType.NEW_DEAL,
      title: 'New Deal Alert!',
      message: `${dealTitle} - ${discountNum.toFixed(0)}% off at $${priceNum.toFixed(2)}`,
      dealId,
      newPrice: priceNum,
      imageUrl,
    };

    const notification = await this.notificationsRepository.create(data);
    this.logger.log(`Created new deal notification: ${notification.id}`, this.context);
    return notification;
  }

  /**
   * Create a notification for a price drop
   */
  async createPriceDropNotification(
    dealId: string,
    dealTitle: string,
    oldPrice: number,
    newPrice: number,
    imageUrl?: string,
  ): Promise<Notification> {
    this.logger.debug(`Creating price drop notification for: ${dealTitle}`, this.context);

    // Ensure numeric values are proper numbers (may come as strings from DB)
    const oldPriceNum = Number(oldPrice) || 0;
    const newPriceNum = Number(newPrice) || 0;
    const savings = oldPriceNum - newPriceNum;
    const percentDrop = oldPriceNum > 0 ? ((savings / oldPriceNum) * 100).toFixed(0) : '0';

    const data: CreateNotificationData = {
      type: NotificationType.PRICE_DROP,
      title: 'Price Drop!',
      message: `${dealTitle} dropped from $${oldPriceNum.toFixed(2)} to $${newPriceNum.toFixed(2)} (${percentDrop}% off)`,
      dealId,
      oldPrice: oldPriceNum,
      newPrice: newPriceNum,
      imageUrl,
    };

    const notification = await this.notificationsRepository.create(data);
    this.logger.log(`Created price drop notification: ${notification.id}`, this.context);
    return notification;
  }

  /**
   * Create a notification for a price increase
   */
  async createPriceIncreaseNotification(
    dealId: string,
    dealTitle: string,
    oldPrice: number,
    newPrice: number,
    imageUrl?: string,
  ): Promise<Notification> {
    this.logger.debug(`Creating price increase notification for: ${dealTitle}`, this.context);

    // Ensure numeric values are proper numbers (may come as strings from DB)
    const oldPriceNum = Number(oldPrice) || 0;
    const newPriceNum = Number(newPrice) || 0;
    const increase = newPriceNum - oldPriceNum;

    const data: CreateNotificationData = {
      type: NotificationType.PRICE_INCREASE,
      title: 'Price Update',
      message: `${dealTitle} increased from $${oldPriceNum.toFixed(2)} to $${newPriceNum.toFixed(2)} (+$${increase.toFixed(2)})`,
      dealId,
      oldPrice: oldPriceNum,
      newPrice: newPriceNum,
      imageUrl,
    };

    const notification = await this.notificationsRepository.create(data);
    this.logger.log(`Created price increase notification: ${notification.id}`, this.context);
    return notification;
  }

  /**
   * Clean up notifications older than retention period
   */
  async cleanupOldNotifications(): Promise<number> {
    this.logger.log(
      `Cleaning up notifications older than ${this.RETENTION_DAYS} days`,
      this.context,
    );

    const deletedCount = await this.notificationsRepository.deleteOlderThan(
      this.RETENTION_DAYS,
    );

    this.logger.log(`Deleted ${deletedCount} old notifications`, this.context);
    return deletedCount;
  }

  /**
   * Clear interval on module destroy
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
