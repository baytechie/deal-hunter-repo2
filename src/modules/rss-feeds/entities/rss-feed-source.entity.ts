import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * RssFeedSource entity representing an RSS feed source to crawl for deals.
 * Each source can be configured with categories and crawling preferences.
 */
@Entity('rss_feed_sources')
export class RssFeedSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 30 })
  crawlIntervalMinutes: number;

  @Column({ nullable: true })
  lastCrawledAt: Date;

  @Column({ type: 'int', default: 0 })
  totalItemsCrawled: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  lastError: string;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
