import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SocialPost } from './entities/social-post.entity';
import { SocialPlatform, PostStatus } from './types/social-platform.enum';
import {
  ISocialPostRepository,
  SOCIAL_POST_REPOSITORY,
} from './repositories/social-post.repository.interface';
import { TwitterService } from './twitter/twitter.service';
import { FacebookService } from './facebook/facebook.service';
import { FacebookTargetType } from './facebook/dto';
import { LoggerService } from '../../shared/services/logger.service';
import { Deal } from '../deals/entities/deal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SocialMediaService implements OnModuleInit {
  private readonly context = 'SocialMediaService';

  constructor(
    @Inject(SOCIAL_POST_REPOSITORY)
    private readonly socialPostRepository: ISocialPostRepository,
    private readonly twitterService: TwitterService,
    private readonly facebookService: FacebookService,
    private readonly logger: LoggerService,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Social Media Service initialized', this.context);

    // Verify Twitter credentials on startup
    const twitterStatus = await this.twitterService.verifyCredentials();
    if (twitterStatus.success) {
      this.logger.log(`Twitter connected: @${twitterStatus.username}`, this.context);
    } else {
      this.logger.warn(`Twitter not connected: ${twitterStatus.error}`, this.context);
    }
  }

  /**
   * Generate tweet preview for a deal
   */
  async generateTweetPreview(dealId: string): Promise<{ content: string; characterCount: number }> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    const content = this.twitterService.generateTweetContent(deal);
    return {
      content,
      characterCount: content.length,
    };
  }

  /**
   * Save a tweet as draft for approval
   */
  async saveDraft(
    dealId: string,
    content: string,
    includeImage: boolean = true,
    scheduledAt?: Date,
  ): Promise<SocialPost> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    const post = await this.socialPostRepository.create({
      platform: SocialPlatform.TWITTER,
      dealId,
      postContent: content,
      imageUrl: includeImage ? deal.imageUrl : undefined,
      scheduledAt,
      status: PostStatus.DRAFT,
    });

    this.logger.log(`Draft saved for deal ${dealId}`, this.context);
    return post;
  }

  /**
   * Approve and post/schedule a draft
   */
  async approvePost(id: string): Promise<{ post: SocialPost; scheduled: boolean }> {
    const post = await this.socialPostRepository.findById(id);
    if (!post || post.status !== PostStatus.DRAFT) {
      throw new Error('Draft not found or already processed');
    }

    // If scheduled for future, mark as scheduled
    if (post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
      const updatedPost = await this.socialPostRepository.update(id, {
        status: PostStatus.SCHEDULED,
      });
      this.logger.log(`Draft approved and scheduled for ${post.scheduledAt}`, this.context);
      return { post: updatedPost, scheduled: true };
    }

    // Post immediately
    const result = await this.twitterService.postTweet(post.postContent, post.imageUrl);

    if (result.success) {
      const updatedPost = await this.socialPostRepository.update(id, {
        status: PostStatus.POSTED,
        postId: result.postId,
        postUrl: result.postUrl,
        postedAt: new Date(),
      });
      this.logger.log(`Draft approved and posted: ${result.postId}`, this.context);
      return { post: updatedPost, scheduled: false };
    } else {
      await this.socialPostRepository.update(id, {
        status: PostStatus.FAILED,
        errorMessage: result.error,
      });
      throw new Error(`Failed to post: ${result.error}`);
    }
  }

  /**
   * Post a tweet immediately
   */
  async postTweet(
    dealId: string,
    content: string,
    includeImage: boolean = true,
  ): Promise<SocialPost> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    // Create the post record
    const post = await this.socialPostRepository.create({
      platform: SocialPlatform.TWITTER,
      dealId,
      postContent: content,
      imageUrl: includeImage ? deal.imageUrl : undefined,
      status: PostStatus.DRAFT,
    });

    // Post to Twitter
    const result = await this.twitterService.postTweet(
      content,
      includeImage ? deal.imageUrl : undefined,
    );

    if (result.success) {
      await this.socialPostRepository.update(post.id, {
        status: PostStatus.POSTED,
        postId: result.postId,
        postUrl: result.postUrl,
        postedAt: new Date(),
      });
      this.logger.log(`Tweet posted for deal ${dealId}: ${result.postId}`, this.context);
    } else {
      await this.socialPostRepository.update(post.id, {
        status: PostStatus.FAILED,
        errorMessage: result.error,
      });
      this.logger.error(`Failed to post tweet for deal ${dealId}: ${result.error}`, this.context);
    }

    return this.socialPostRepository.findById(post.id);
  }

  /**
   * Schedule a tweet for later
   */
  async scheduleTweet(
    dealId: string,
    content: string,
    scheduledAt: Date,
    includeImage: boolean = true,
  ): Promise<SocialPost> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    const post = await this.socialPostRepository.create({
      platform: SocialPlatform.TWITTER,
      dealId,
      postContent: content,
      imageUrl: includeImage ? deal.imageUrl : undefined,
      scheduledAt,
      status: PostStatus.SCHEDULED,
    });

    this.logger.log(
      `Tweet scheduled for deal ${dealId} at ${scheduledAt.toISOString()}`,
      this.context,
    );

    return post;
  }

  /**
   * Process scheduled posts (runs every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledPosts(): Promise<void> {
    const duePosts = await this.socialPostRepository.findScheduledDue();

    if (duePosts.length === 0) {
      return;
    }

    this.logger.log(`Processing ${duePosts.length} scheduled posts`, this.context);

    for (const post of duePosts) {
      try {
        let result: { success: boolean; postId?: string; postUrl?: string; error?: string };

        if (post.platform === SocialPlatform.TWITTER) {
          result = await this.twitterService.postTweet(post.postContent, post.imageUrl);
        } else if (post.platform === SocialPlatform.FACEBOOK) {
          // Parse Facebook post data from JSON content
          const fbData = JSON.parse(post.postContent);
          if (fbData.targetType === FacebookTargetType.PAGE) {
            result = await this.facebookService.postToPage(
              fbData.targetId,
              fbData.pageAccessToken,
              fbData.content,
              post.imageUrl,
            );
          } else {
            result = await this.facebookService.postToGroup(
              fbData.targetId,
              fbData.content,
              post.imageUrl,
            );
          }
        } else {
          result = { success: false, error: `Unsupported platform: ${post.platform}` };
        }

        if (result.success) {
          await this.socialPostRepository.update(post.id, {
            status: PostStatus.POSTED,
            postId: result.postId,
            postUrl: result.postUrl,
            postedAt: new Date(),
          });
          this.logger.log(`Scheduled post published: ${result.postId}`, this.context);
        } else {
          await this.socialPostRepository.update(post.id, {
            status: PostStatus.FAILED,
            errorMessage: result.error,
          });
          this.logger.error(`Scheduled post failed: ${result.error}`, this.context);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.socialPostRepository.update(post.id, {
          status: PostStatus.FAILED,
          errorMessage,
        });
        this.logger.error(`Error processing scheduled post: ${errorMessage}`, this.context);
      }
    }
  }

  /**
   * Get all social posts with optional filters
   */
  async getPosts(filters?: {
    platform?: SocialPlatform;
    status?: PostStatus;
    dealId?: string;
  }): Promise<SocialPost[]> {
    return this.socialPostRepository.findAll(filters);
  }

  /**
   * Get a single post by ID
   */
  async getPost(id: string): Promise<SocialPost | null> {
    return this.socialPostRepository.findById(id);
  }

  /**
   * Delete a post and optionally delete from Twitter
   */
  async deletePost(id: string, deleteFromPlatform: boolean = false): Promise<boolean> {
    const post = await this.socialPostRepository.findById(id);
    if (!post) {
      return false;
    }

    // Delete from Twitter if requested and post was published
    if (deleteFromPlatform && post.postId && post.platform === SocialPlatform.TWITTER) {
      const result = await this.twitterService.deleteTweet(post.postId);
      if (!result.success) {
        this.logger.warn(`Failed to delete tweet from Twitter: ${result.error}`, this.context);
      }
    }

    return this.socialPostRepository.delete(id);
  }

  /**
   * Update a draft or scheduled post
   */
  async updateScheduledPost(
    id: string,
    content?: string,
    scheduledAt?: Date,
  ): Promise<SocialPost | null> {
    const post = await this.socialPostRepository.findById(id);
    if (!post || (post.status !== PostStatus.SCHEDULED && post.status !== PostStatus.DRAFT)) {
      return null;
    }

    const updates: Partial<SocialPost> = {};
    if (content) updates.postContent = content;
    if (scheduledAt) updates.scheduledAt = scheduledAt;

    return this.socialPostRepository.update(id, updates);
  }

  /**
   * Retry a failed post
   */
  async retryPost(id: string): Promise<SocialPost | null> {
    const post = await this.socialPostRepository.findById(id);
    if (!post || post.status !== PostStatus.FAILED) {
      return null;
    }

    // Reset status and try posting again
    await this.socialPostRepository.update(id, {
      status: PostStatus.DRAFT,
      errorMessage: null,
    });

    const result = await this.twitterService.postTweet(post.postContent, post.imageUrl);

    if (result.success) {
      return this.socialPostRepository.update(id, {
        status: PostStatus.POSTED,
        postId: result.postId,
        postUrl: result.postUrl,
        postedAt: new Date(),
      });
    } else {
      return this.socialPostRepository.update(id, {
        status: PostStatus.FAILED,
        errorMessage: result.error,
      });
    }
  }

  /**
   * Check Twitter connection status
   */
  async getTwitterStatus(): Promise<{ connected: boolean; username?: string; error?: string }> {
    const result = await this.twitterService.verifyCredentials();
    return {
      connected: result.success,
      username: result.username,
      error: result.error,
    };
  }

  // ==================== Facebook Methods ====================

  /**
   * Check Facebook connection status
   */
  async getFacebookStatus(): Promise<{ connected: boolean; configured: boolean; name?: string; error?: string }> {
    const configured = this.facebookService.isConfigured();
    if (!configured) {
      return { connected: false, configured: false, error: 'Facebook App not configured' };
    }

    const result = await this.facebookService.verifyCredentials();
    return {
      connected: result.success,
      configured: true,
      name: result.name,
      error: result.error,
    };
  }

  /**
   * Get Facebook OAuth URL
   */
  getFacebookOAuthUrl(redirectUri: string): { url: string } {
    const state = Math.random().toString(36).substring(7);
    const url = this.facebookService.getOAuthUrl(redirectUri, state);
    return { url };
  }

  /**
   * Handle Facebook OAuth callback
   */
  async handleFacebookOAuthCallback(code: string, redirectUri: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.facebookService.exchangeCodeForToken(code, redirectUri);
    return { success: result.success, error: result.error };
  }

  /**
   * Set Facebook access token manually
   */
  setFacebookToken(accessToken: string): { success: boolean } {
    this.facebookService.setUserAccessToken(accessToken);
    return { success: true };
  }

  /**
   * Get user's Facebook Pages
   */
  async getFacebookPages(): Promise<{ success: boolean; pages?: any[]; error?: string }> {
    return this.facebookService.getPages();
  }

  /**
   * Get user's Facebook Groups
   */
  async getFacebookGroups(): Promise<{ success: boolean; groups?: any[]; error?: string }> {
    return this.facebookService.getGroups();
  }

  /**
   * Generate Facebook post preview for a deal
   */
  async generateFacebookPreview(dealId: string): Promise<{ content: string; characterCount: number }> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    const content = this.facebookService.generatePostContent(deal);
    return {
      content,
      characterCount: content.length,
    };
  }

  /**
   * Save a Facebook post as draft for approval
   */
  async saveFacebookDraft(
    dealId: string,
    content: string,
    targetType: FacebookTargetType,
    targetId: string,
    pageAccessToken?: string,
    includeImage: boolean = true,
    scheduledAt?: Date,
  ): Promise<SocialPost> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    const post = await this.socialPostRepository.create({
      platform: SocialPlatform.FACEBOOK,
      dealId,
      postContent: JSON.stringify({
        content,
        targetType,
        targetId,
        pageAccessToken,
      }),
      imageUrl: includeImage ? deal.imageUrl : undefined,
      scheduledAt,
      status: PostStatus.DRAFT,
    });

    this.logger.log(`Facebook draft saved for deal ${dealId}`, this.context);
    return post;
  }

  /**
   * Post to Facebook immediately
   */
  async postToFacebook(
    dealId: string,
    content: string,
    targetType: FacebookTargetType,
    targetId: string,
    pageAccessToken?: string,
    includeImage: boolean = true,
  ): Promise<SocialPost> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    // Create the post record
    const post = await this.socialPostRepository.create({
      platform: SocialPlatform.FACEBOOK,
      dealId,
      postContent: content,
      imageUrl: includeImage ? deal.imageUrl : undefined,
      status: PostStatus.DRAFT,
    });

    // Post to Facebook
    let result;
    if (targetType === FacebookTargetType.PAGE) {
      if (!pageAccessToken) {
        throw new Error('Page access token required for Page posts');
      }
      result = await this.facebookService.postToPage(
        targetId,
        pageAccessToken,
        content,
        includeImage ? deal.imageUrl : undefined,
      );
    } else {
      result = await this.facebookService.postToGroup(
        targetId,
        content,
        includeImage ? deal.imageUrl : undefined,
      );
    }

    if (result.success) {
      await this.socialPostRepository.update(post.id, {
        status: PostStatus.POSTED,
        postId: result.postId,
        postUrl: result.postUrl,
        postedAt: new Date(),
      });
      this.logger.log(`Facebook post created for deal ${dealId}: ${result.postId}`, this.context);
    } else {
      await this.socialPostRepository.update(post.id, {
        status: PostStatus.FAILED,
        errorMessage: result.error,
      });
      this.logger.error(`Failed to post to Facebook for deal ${dealId}: ${result.error}`, this.context);
    }

    return this.socialPostRepository.findById(post.id);
  }

  /**
   * Schedule a Facebook post for later
   */
  async scheduleFacebookPost(
    dealId: string,
    content: string,
    targetType: FacebookTargetType,
    targetId: string,
    pageAccessToken?: string,
    scheduledAt?: Date,
    includeImage: boolean = true,
  ): Promise<SocialPost> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }

    const post = await this.socialPostRepository.create({
      platform: SocialPlatform.FACEBOOK,
      dealId,
      postContent: JSON.stringify({
        content,
        targetType,
        targetId,
        pageAccessToken,
      }),
      imageUrl: includeImage ? deal.imageUrl : undefined,
      scheduledAt,
      status: PostStatus.SCHEDULED,
    });

    this.logger.log(
      `Facebook post scheduled for deal ${dealId} at ${scheduledAt?.toISOString()}`,
      this.context,
    );

    return post;
  }
}
