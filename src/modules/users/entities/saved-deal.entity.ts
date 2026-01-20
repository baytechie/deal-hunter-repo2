import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Deal } from '../../deals/entities/deal.entity';

/**
 * SavedDeal entity for user's saved/bookmarked deals.
 * Includes price alert settings per saved deal.
 */
@Entity('saved_deals')
@Unique(['userId', 'dealId'])
export class SavedDeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  dealId: string;

  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealId' })
  deal: Deal;

  // Alert settings
  @Column({ type: 'boolean', default: true })
  priceAlertEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  priceAlertThreshold: number;

  // Metadata
  @CreateDateColumn()
  savedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
