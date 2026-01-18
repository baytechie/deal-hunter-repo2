import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * PendingDeal entity for the admin approval workflow.
 * Stores deals fetched from Amazon PAAPI before admin approval.
 */
@Entity('pending_deals')
export class PendingDeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index({ unique: true })
  asin: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discountPercentage: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 1000 })
  productUrl: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy: string | null;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}
