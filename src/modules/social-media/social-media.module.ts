import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SocialPost } from './entities/social-post.entity';
import { Deal } from '../deals/entities/deal.entity';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';
import { TwitterService } from './twitter/twitter.service';
import { TypeOrmSocialPostRepository } from './repositories/typeorm-social-post.repository';
import { SOCIAL_POST_REPOSITORY } from './repositories/social-post.repository.interface';
import { SharedModule } from '../../shared/shared.module';

/**
 * SocialMediaModule - Handles social media integrations
 *
 * Features:
 * - Twitter/X posting with image support
 * - Scheduled posts with cron processing
 * - Post history tracking
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SocialPost, Deal]),
    ScheduleModule.forRoot(),
    SharedModule,
  ],
  controllers: [SocialMediaController],
  providers: [
    SocialMediaService,
    TwitterService,
    TypeOrmSocialPostRepository,
    {
      provide: SOCIAL_POST_REPOSITORY,
      useClass: TypeOrmSocialPostRepository,
    },
  ],
  exports: [SocialMediaService],
})
export class SocialMediaModule {}
