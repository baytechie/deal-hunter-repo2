import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RssFeedSource } from './rss-feed-source.entity';

/**
 * RssFeedDeal entity representing a deal crawled from an RSS feed.
 * Links back to the source feed and stores deal-specific information.
 */
@Entity('rss_feed_deals')
export class RssFeedDeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 1000 })
  link: string;

  @Index()
  @Column({ type: 'varchar', length: 500, unique: true })
  guid: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  store: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  couponCode: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isHot: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @Column({ type: 'uuid' })
  sourceId: string;

  @ManyToOne(() => RssFeedSource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: RssFeedSource;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
