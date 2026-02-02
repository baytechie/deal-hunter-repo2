import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RssFeedSource } from './entities/rss-feed-source.entity';
import { RssFeedDeal } from './entities/rss-feed-deal.entity';
import { RssFeedsController } from './rss-feeds.controller';
import { RssFeedsService } from './rss-feeds.service';
import { RssCrawlerService } from './services/rss-crawler.service';
import { TypeOrmRssFeedsRepository } from './repositories/typeorm-rss-feeds.repository';
import { RSS_FEEDS_REPOSITORY } from './repositories/rss-feeds.repository.interface';

/**
 * RssFeedsModule - Feature module for RSS feed functionality
 *
 * SOLID Principles Applied:
 * - Dependency Inversion: Repository interface is bound to concrete implementation
 * - Single Responsibility: Module only configures RSS feed-related components
 *
 * Features:
 * - RSS feed source management (CRUD)
 * - Feed crawling and deal extraction
 * - Scheduled crawling based on source configuration
 * - Deal filtering and retrieval
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RssFeedSource, RssFeedDeal]),
    ScheduleModule.forRoot(),
  ],
  controllers: [RssFeedsController],
  providers: [
    RssFeedsService,
    RssCrawlerService,
    TypeOrmRssFeedsRepository,
    // Bind the interface token to the concrete implementation
    {
      provide: RSS_FEEDS_REPOSITORY,
      useClass: TypeOrmRssFeedsRepository,
    },
  ],
  exports: [RssFeedsService],
})
export class RssFeedsModule {}
