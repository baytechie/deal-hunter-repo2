import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

/**
 * Deal entity representing a discount/deal in the system.
 * Uses TypeORM decorators for database mapping.
 */
@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 1000 })
  affiliateLink: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: false })
  isHot: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  asin: string | null;

  @Column({ type: 'uuid', nullable: true })
  pendingDealId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  couponCode: string | null;

  @Column({ type: 'text', nullable: true })
  promoDescription: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Automatically calculate discount percentage before insert/update
   * Single Responsibility: Entity handles its own data integrity
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateDiscountPercentage(): void {
    if (this.originalPrice > 0 && this.price >= 0) {
      this.discountPercentage = Number(
        (((this.originalPrice - this.price) / this.originalPrice) * 100).toFixed(2),
      );
    }
  }
}
