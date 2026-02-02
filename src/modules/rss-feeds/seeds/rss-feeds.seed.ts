import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RssFeedSource } from '../entities/rss-feed-source.entity';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Default RSS feed sources for deal aggregation
 * These are popular deal sites that provide RSS feeds
 */
const DEFAULT_RSS_SOURCES = [
  {
    name: 'Slickdeals Frontpage',
    url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',
    description: 'Top deals from Slickdeals frontpage',
    category: 'General',
    priority: 10,
    crawlIntervalMinutes: 15,
  },
  {
    name: 'Slickdeals Popular',
    url: 'https://slickdeals.net/newsearch.php?mode=popdeals&searcharea=deals&searchin=first&rss=1',
    description: 'Popular deals from Slickdeals',
    category: 'General',
    priority: 9,
    crawlIntervalMinutes: 15,
  },
  {
    name: 'DealNews',
    url: 'https://www.dealnews.com/rss/',
    description: 'Deals from DealNews',
    category: 'General',
    priority: 8,
    crawlIntervalMinutes: 20,
  },
  {
    name: 'Ben\'s Bargains',
    url: 'https://bensbargains.com/rss/',
    description: 'Deals from Ben\'s Bargains',
    category: 'General',
    priority: 7,
    crawlIntervalMinutes: 30,
  },
  {
    name: 'Techbargains',
    url: 'https://www.techbargains.com/rss',
    description: 'Tech deals from Techbargains',
    category: 'Electronics',
    priority: 8,
    crawlIntervalMinutes: 20,
  },
  {
    name: 'Kinja Deals',
    url: 'https://kinjadeals.theinventory.com/rss',
    description: 'Curated deals from Kinja',
    category: 'General',
    priority: 7,
    crawlIntervalMinutes: 30,
  },
  {
    name: 'Hip2Save',
    url: 'https://hip2save.com/feed/',
    description: 'Coupons and deals from Hip2Save',
    category: 'Coupons',
    priority: 6,
    crawlIntervalMinutes: 30,
  },
  {
    name: 'Brad\'s Deals',
    url: 'https://www.bradsdeals.com/rss',
    description: 'Deals from Brad\'s Deals',
    category: 'General',
    priority: 6,
    crawlIntervalMinutes: 30,
  },
  {
    name: 'Wirecutter Deals',
    url: 'https://www.nytimes.com/wirecutter/deals/feed/',
    description: 'Expert-picked deals from Wirecutter',
    category: 'General',
    priority: 9,
    crawlIntervalMinutes: 60,
  },
  {
    name: 'RetailMeNot',
    url: 'https://www.retailmenot.com/rss/deals',
    description: 'Coupons and deals from RetailMeNot',
    category: 'Coupons',
    priority: 5,
    crawlIntervalMinutes: 60,
  },
];

/**
 * RssFeedsSeedService - Seeds the database with default RSS feed sources
 *
 * Runs on module initialization to ensure we have sources to crawl.
 * Only adds sources that don't already exist (by URL).
 */
@Injectable()
export class RssFeedsSeedService implements OnModuleInit {
  private readonly context = 'RssFeedsSeedService';

  constructor(
    @InjectRepository(RssFeedSource)
    private readonly sourceRepository: Repository<RssFeedSource>,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultSources();
  }

  /**
   * Seed default RSS feed sources if they don't exist
   */
  async seedDefaultSources(): Promise<void> {
    this.logger.log('Checking for default RSS feed sources...', this.context);

    let addedCount = 0;

    for (const sourceData of DEFAULT_RSS_SOURCES) {
      // Check if source already exists by URL
      const existing = await this.sourceRepository.findOne({
        where: { url: sourceData.url },
      });

      if (!existing) {
        const source = this.sourceRepository.create({
          ...sourceData,
          isActive: true,
        });
        await this.sourceRepository.save(source);
        addedCount++;
        this.logger.log(`Added RSS source: ${sourceData.name}`, this.context);
      }
    }

    if (addedCount > 0) {
      this.logger.log(`Seeded ${addedCount} new RSS feed sources`, this.context);
    } else {
      this.logger.log('All default RSS feed sources already exist', this.context);
    }
  }
}
