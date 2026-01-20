import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmNotificationsRepository } from './repositories/typeorm-notifications.repository';
import { NOTIFICATIONS_REPOSITORY } from './repositories/notifications.repository.interface';

/**
 * NotificationsModule - Feature module for notifications functionality
 *
 * SOLID Principles Applied:
 * - Dependency Inversion: Repository interface is bound to concrete implementation
 * - Single Responsibility: Module only configures notification-related components
 *
 * Exports NotificationsService so other modules (like DealsModule) can trigger notifications
 */
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    TypeOrmNotificationsRepository,
    {
      provide: NOTIFICATIONS_REPOSITORY,
      useClass: TypeOrmNotificationsRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
