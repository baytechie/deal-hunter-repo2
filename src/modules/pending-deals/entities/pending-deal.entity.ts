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

  @Column({ nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

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

  @Column({ nullable: true })
  dealStartTime: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  dealPercentClaimed: number | null;

  // Enhanced promotion information from PAAPI
  @Column({ type: 'boolean', default: false })
  hasPromotion: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  promotionType: string | null; // "Coupon", "SNS", "Lightning Deal", etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  promotionAmount: number | null; // Dollar value of promotion

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionPercent: number | null; // Percentage off from promotion

  @Column({ type: 'varchar', length: 500, nullable: true })
  promotionDisplayText: string | null; // Pre-formatted display text like "$5.00 off coupon"

  @Column({ type: 'boolean', default: false })
  isSubscribeAndSave: boolean;

  @Column({ type: 'boolean', default: false })
  isCouponAvailable: boolean; // Flag indicating clippable coupon exists on Amazon

  // Savings information
  @Column({ type: 'varchar', length: 50, nullable: true })
  savingBasisType: string | null; // "LIST_PRICE", "WAS_PRICE", etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  savingsAmount: number | null; // Total savings in dollars

  // Raw promotion data as JSON for reference
  @Column({ type: 'text', nullable: true })
  rawPromotionData: string | null; // JSON string of all promotions
}
