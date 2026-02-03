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

  // Amazon deal information
  @Column({ type: 'varchar', length: 100, nullable: true })
  dealBadge: string | null; // e.g., "Limited Time Deal", "Deal of the Day"

  @Column({ type: 'varchar', length: 50, nullable: true })
  dealAccessType: string | null; // "ALL", "PRIME_EXCLUSIVE", "PRIME_EARLY_ACCESS"

  @Column({ nullable: true })
  dealEndTime: Date | null;

  // Enhanced promotion information from PAAPI
  @Column({ type: 'boolean', default: false })
  hasPromotion: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  promotionType: string | null; // "Coupon", "SNS", "Lightning Deal", etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  promotionAmount: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionPercent: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  promotionDisplayText: string | null; // Pre-formatted display text like "$5.00 off coupon"

  @Column({ type: 'boolean', default: false })
  isSubscribeAndSave: boolean;

  @Column({ type: 'boolean', default: false })
  isCouponAvailable: boolean; // Flag indicating clippable coupon exists on Amazon

  // Amazon Associates Compliance Fields - Editorial Analysis
  @Column({ type: 'text', nullable: true })
  originalAnalysis: string | null; // 50-150 word original analysis of the deal

  @Column({ type: 'simple-array', nullable: true })
  pros: string[] | null; // Array of advantages/benefits

  @Column({ type: 'simple-array', nullable: true })
  cons: string[] | null; // Array of disadvantages/limitations

  @Column({ type: 'varchar', length: 50, nullable: true })
  expertVerdict: string | null; // "BUY NOW", "WAIT", "PASS"

  @Column({ type: 'text', nullable: true })
  whenToBuy: string | null; // Timing recommendation for purchase

  @Column({ type: 'varchar', length: 255, nullable: true })
  bestFor: string | null; // Target audience description

  @Column({ type: 'varchar', length: 50, nullable: true })
  retailer: string | null; // AMAZON, WALMART, TARGET, etc.

  @Column({ type: 'text', nullable: true })
  priceHistoryJson: string | null; // JSON string of price history data

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
