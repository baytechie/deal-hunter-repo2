import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import {
  INotificationsRepository,
  CreateNotificationData,
} from './notifications.repository.interface';

/**
 * TypeORM implementation of the NotificationsRepository interface.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles data access for notifications
 * - Liskov Substitution: Implements INotificationsRepository
 * - Dependency Inversion: Service depends on interface, not this class
 */
@Injectable()
export class TypeOrmNotificationsRepository implements INotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findRecent(): Promise<Notification[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.notificationRepository.find({
      where: {
        createdAt: MoreThan(sevenDaysAgo),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async countRecent(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.notificationRepository.count({
      where: {
        createdAt: MoreThan(sevenDaysAgo),
      },
    });
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: data.type,
      title: data.title,
      message: data.message,
      dealId: data.dealId || null,
      oldPrice: data.oldPrice || null,
      newPrice: data.newPrice || null,
      imageUrl: data.imageUrl || null,
    });
    return this.notificationRepository.save(notification);
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected ?? 0;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { id } });
  }
}
