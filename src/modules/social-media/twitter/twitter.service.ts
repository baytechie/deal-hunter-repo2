import { Injectable } from '@nestjs/common';
import { TwitterApi, TweetV2PostTweetResult, TwitterApiReadWrite } from 'twitter-api-v2';
import { LoggerService } from '../../../shared/services/logger.service';
import { Deal } from '../../deals/entities/deal.entity';

/**
 * TwitterService - Handles Twitter API integration
 */
@Injectable()
export class TwitterService {
  private readonly context = 'TwitterService';
  private client: TwitterApi;
  private readWriteClient: TwitterApiReadWrite;

  constructor(private readonly logger: LoggerService) {
    this.initializeClient();
  }

  /**
   * Initialize Twitter API client with credentials from environment
   */
  private initializeClient(): void {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      this.logger.warn('Twitter API credentials not configured', this.context);
      return;
    }

    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    this.readWriteClient = this.client.readWrite;
    this.logger.log('Twitter API client initialized', this.context);
  }

  /**
   * Check if Twitter client is configured
   */
  isConfigured(): boolean {
    return !!this.readWriteClient;
  }

  /**
   * Generate tweet content from a deal
   */
  generateTweetContent(deal: Deal): string {
    const lines: string[] = [];

    // Title
    lines.push(`🔥 ${deal.title}`);
    lines.push('');

    // Price
    lines.push(`💰 $${Number(deal.price).toFixed(2)} (was $${Number(deal.originalPrice).toFixed(2)})`);
    lines.push(`📉 ${Math.round(Number(deal.discountPercentage))}% OFF!`);
    lines.push('');

    // Coupon code if available
    if (deal.couponCode) {
      lines.push(`🎟️ Use code: ${deal.couponCode}`);
      lines.push('');
    }

    // Affiliate link
    lines.push(`🛒 ${deal.affiliateLink}`);
    lines.push('');

    // Hashtag
    lines.push('#huntDeals');

    return lines.join('\n');
  }

  /**
   * Post a tweet with optional image
   */
  async postTweet(
    content: string,
    imageUrl?: string,
  ): Promise<{ success: boolean; postId?: string; postUrl?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Twitter API not configured' };
    }

    try {
      this.logger.debug(`Posting tweet: ${content.substring(0, 50)}...`, this.context);

      let mediaId: string | undefined;

      // Upload image if provided
      if (imageUrl) {
        try {
          mediaId = await this.uploadImage(imageUrl);
        } catch (imageError) {
          this.logger.warn(`Failed to upload image, posting without: ${imageError}`, this.context);
        }
      }

      // Post the tweet
      const tweetData: any = { text: content };
      if (mediaId) {
        tweetData.media = { media_ids: [mediaId] };
      }

      const result: TweetV2PostTweetResult = await this.readWriteClient.v2.tweet(tweetData);

      const postId = result.data.id;
      const postUrl = `https://twitter.com/i/web/status/${postId}`;

      this.logger.log(`Tweet posted successfully: ${postId}`, this.context);

      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error: any) {
      // Extract detailed error info from Twitter API response
      let errorMessage = 'Unknown error';
      let errorDetails = '';

      if (error?.data) {
        // Twitter API v2 error format
        errorDetails = JSON.stringify(error.data);
        errorMessage = error.data?.detail || error.data?.title || error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      this.logger.error(`Failed to post tweet: ${errorMessage}. Details: ${errorDetails}`, this.context);
      return { success: false, error: `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}` };
    }
  }

  /**
   * Upload an image to Twitter and return media ID
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    this.logger.debug(`Uploading image from: ${imageUrl}`, this.context);

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload to Twitter
    const mediaId = await this.client.v1.uploadMedia(buffer, {
      mimeType: 'image/jpeg',
    });

    this.logger.debug(`Image uploaded, media ID: ${mediaId}`, this.context);
    return mediaId;
  }

  /**
   * Delete a tweet by ID
   */
  async deleteTweet(tweetId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Twitter API not configured' };
    }

    try {
      await this.readWriteClient.v2.deleteTweet(tweetId);
      this.logger.log(`Tweet deleted: ${tweetId}`, this.context);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete tweet: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Verify Twitter credentials
   */
  async verifyCredentials(): Promise<{ success: boolean; username?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Twitter API not configured' };
    }

    try {
      const me = await this.readWriteClient.v2.me();
      this.logger.log(`Twitter credentials verified: @${me.data.username}`, this.context);
      return { success: true, username: me.data.username };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to verify credentials: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }
}
