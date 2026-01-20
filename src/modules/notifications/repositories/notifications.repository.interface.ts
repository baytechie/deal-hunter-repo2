import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../types/notification-type.enum';

/**
 * Data for creating a new notification
 */
export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  dealId?: string;
  oldPrice?: number;
  newPrice?: number;
  imageUrl?: string;
}

/**
 * NotificationsRepository Interface - Dependency Inversion Principle (SOLID)
 *
 * This interface defines the contract for notification data access.
 * Concrete implementations can use TypeORM or any other data source.
 */
export interface INotificationsRepository {
  /**
   * Find all notifications within the last 7 days
   */
  findRecent(): Promise<Notification[]>;

  /**
   * Count notifications (for unread badge)
   */
  countRecent(): Promise<number>;

  /**
   * Create a new notification
   */
  create(data: CreateNotificationData): Promise<Notification>;

  /**
   * Delete notifications older than specified days
   */
  deleteOlderThan(days: number): Promise<number>;

  /**
   * Find notification by ID
   */
  findById(id: string): Promise<Notification | null>;
}

/**
 * Injection token for the repository interface
 */
export const NOTIFICATIONS_REPOSITORY = Symbol('NOTIFICATIONS_REPOSITORY');
