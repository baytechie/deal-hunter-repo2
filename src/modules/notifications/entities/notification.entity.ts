import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { NotificationType } from '../types/notification-type.enum';

/**
 * Notification entity representing a system notification.
 *
 * Global notifications are shown to all users and auto-expire after 7 days.
 * Types include new deal alerts and price change notifications.
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'uuid', nullable: true })
  dealId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  newPrice: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
