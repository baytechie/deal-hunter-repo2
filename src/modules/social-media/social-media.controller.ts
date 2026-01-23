import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import {
  CreateTwitterPostDto,
  GenerateTweetPreviewDto,
} from './dto/create-twitter-post.dto';
import {
  CreateFacebookPostDto,
  GenerateFacebookPreviewDto,
  FacebookOAuthCallbackDto,
  SetFacebookTokenDto,
} from './facebook/dto';
import { SocialPlatform, PostStatus } from './types/social-platform.enum';
import { LoggerService } from '../../shared/services/logger.service';

@Controller('social-media')
export class SocialMediaController {
  private readonly context = 'SocialMediaController';

  constructor(
    private readonly socialMediaService: SocialMediaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get Twitter connection status
   */
  @Get('twitter/status')
  async getTwitterStatus() {
    this.logger.debug('GET /social-media/twitter/status', this.context);
    return this.socialMediaService.getTwitterStatus();
  }

  /**
   * Generate tweet preview for a deal
   */
  @Post('twitter/preview')
  async generateTweetPreview(@Body() dto: GenerateTweetPreviewDto) {
    this.logger.debug(`POST /social-media/twitter/preview - dealId: ${dto.dealId}`, this.context);
    try {
      return await this.socialMediaService.generateTweetPreview(dto.dealId);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate preview',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Post a tweet immediately or save as draft
   */
  @Post('twitter/post')
  async postTweet(@Body() dto: CreateTwitterPostDto) {
    this.logger.debug(`POST /social-media/twitter/post - dealId: ${dto.dealId}, saveAsDraft: ${dto.saveAsDraft}`, this.context);

    try {
      const scheduledDate = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;

      if (scheduledDate && scheduledDate <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // If saveAsDraft is true, save for approval
      if (dto.saveAsDraft) {
        return await this.socialMediaService.saveDraft(
          dto.dealId,
          dto.content,
          dto.includeImage ?? true,
          scheduledDate,
        );
      }

      // Otherwise, post immediately or schedule
      if (scheduledDate) {
        return await this.socialMediaService.scheduleTweet(
          dto.dealId,
          dto.content,
          scheduledDate,
          dto.includeImage ?? true,
        );
      } else {
        return await this.socialMediaService.postTweet(
          dto.dealId,
          dto.content,
          dto.includeImage ?? true,
        );
      }
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to post tweet',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== Facebook Endpoints ====================

  /**
   * Get Facebook connection status
   */
  @Get('facebook/status')
  async getFacebookStatus() {
    this.logger.debug('GET /social-media/facebook/status', this.context);
    return this.socialMediaService.getFacebookStatus();
  }

  /**
   * Get Facebook OAuth URL
   */
  @Get('facebook/oauth-url')
  async getFacebookOAuthUrl(@Query('redirectUri') redirectUri: string) {
    this.logger.debug('GET /social-media/facebook/oauth-url', this.context);
    try {
      return this.socialMediaService.getFacebookOAuthUrl(redirectUri);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate OAuth URL',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Handle Facebook OAuth callback
   */
  @Post('facebook/oauth-callback')
  async handleFacebookOAuthCallback(@Body() dto: FacebookOAuthCallbackDto, @Query('redirectUri') redirectUri: string) {
    this.logger.debug('POST /social-media/facebook/oauth-callback', this.context);
    try {
      return await this.socialMediaService.handleFacebookOAuthCallback(dto.code, redirectUri);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to process OAuth callback',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Set Facebook access token manually
   */
  @Post('facebook/set-token')
  async setFacebookToken(@Body() dto: SetFacebookTokenDto) {
    this.logger.debug('POST /social-media/facebook/set-token', this.context);
    return this.socialMediaService.setFacebookToken(dto.accessToken);
  }

  /**
   * Get user's Facebook Pages
   */
  @Get('facebook/pages')
  async getFacebookPages() {
    this.logger.debug('GET /social-media/facebook/pages', this.context);
    return this.socialMediaService.getFacebookPages();
  }

  /**
   * Get user's Facebook Groups
   */
  @Get('facebook/groups')
  async getFacebookGroups() {
    this.logger.debug('GET /social-media/facebook/groups', this.context);
    return this.socialMediaService.getFacebookGroups();
  }

  /**
   * Generate Facebook post preview for a deal
   */
  @Post('facebook/preview')
  async generateFacebookPreview(@Body() dto: GenerateFacebookPreviewDto) {
    this.logger.debug(`POST /social-media/facebook/preview - dealId: ${dto.dealId}`, this.context);
    try {
      return await this.socialMediaService.generateFacebookPreview(dto.dealId);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate preview',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Post to Facebook (Page or Group)
   */
  @Post('facebook/post')
  async postToFacebook(@Body() dto: CreateFacebookPostDto) {
    this.logger.debug(`POST /social-media/facebook/post - dealId: ${dto.dealId}, targetType: ${dto.targetType}`, this.context);

    try {
      const scheduledDate = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;

      if (scheduledDate && scheduledDate <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // If saveAsDraft is true, save for approval
      if (dto.saveAsDraft) {
        return await this.socialMediaService.saveFacebookDraft(
          dto.dealId,
          dto.content,
          dto.targetType,
          dto.targetId,
          dto.pageAccessToken,
          dto.includeImage ?? true,
          scheduledDate,
        );
      }

      // Otherwise, post immediately or schedule
      if (scheduledDate) {
        return await this.socialMediaService.scheduleFacebookPost(
          dto.dealId,
          dto.content,
          dto.targetType,
          dto.targetId,
          dto.pageAccessToken,
          scheduledDate,
          dto.includeImage ?? true,
        );
      } else {
        return await this.socialMediaService.postToFacebook(
          dto.dealId,
          dto.content,
          dto.targetType,
          dto.targetId,
          dto.pageAccessToken,
          dto.includeImage ?? true,
        );
      }
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to post to Facebook',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get all social posts
   */
  @Get('posts')
  async getPosts(
    @Query('platform') platform?: SocialPlatform,
    @Query('status') status?: PostStatus,
    @Query('dealId') dealId?: string,
  ) {
    this.logger.debug('GET /social-media/posts', this.context);
    return this.socialMediaService.getPosts({ platform, status, dealId });
  }

  /**
   * Get a single post
   */
  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    this.logger.debug(`GET /social-media/posts/${id}`, this.context);
    const post = await this.socialMediaService.getPost(id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  /**
   * Update a scheduled post
   */
  @Patch('posts/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: { content?: string; scheduledAt?: string },
  ) {
    this.logger.debug(`PATCH /social-media/posts/${id}`, this.context);
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
    const post = await this.socialMediaService.updateScheduledPost(id, body.content, scheduledAt);
    if (!post) {
      throw new HttpException('Post not found or not scheduled', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  /**
   * Delete a post
   */
  @Delete('posts/:id')
  async deletePost(
    @Param('id') id: string,
    @Query('deleteFromPlatform') deleteFromPlatform?: string,
  ) {
    this.logger.debug(`DELETE /social-media/posts/${id}`, this.context);
    const shouldDeleteFromPlatform = deleteFromPlatform === 'true';
    const success = await this.socialMediaService.deletePost(id, shouldDeleteFromPlatform);
    if (!success) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Post deleted' };
  }

  /**
   * Retry a failed post
   */
  @Post('posts/:id/retry')
  async retryPost(@Param('id') id: string) {
    this.logger.debug(`POST /social-media/posts/${id}/retry`, this.context);
    const post = await this.socialMediaService.retryPost(id);
    if (!post) {
      throw new HttpException('Post not found or not failed', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  /**
   * Approve a draft post (post immediately or schedule)
   */
  @Post('posts/:id/approve')
  async approvePost(@Param('id') id: string) {
    this.logger.debug(`POST /social-media/posts/${id}/approve`, this.context);
    try {
      const result = await this.socialMediaService.approvePost(id);
      return result;
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to approve post',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
