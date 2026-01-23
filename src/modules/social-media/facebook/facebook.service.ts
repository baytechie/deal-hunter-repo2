import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../shared/services/logger.service';
import { Deal } from '../../deals/entities/deal.entity';

interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
}

interface FacebookGroup {
  id: string;
  name: string;
}

interface FacebookCredentials {
  appId: string;
  appSecret: string;
  userAccessToken: string;
}

/**
 * FacebookService - Handles Facebook Graph API integration
 * Supports posting to Pages and Groups
 */
@Injectable()
export class FacebookService {
  private readonly context = 'FacebookService';
  private readonly graphApiVersion = 'v18.0';
  private readonly graphApiUrl = 'https://graph.facebook.com';
  private credentials: FacebookCredentials | null = null;

  constructor(private readonly logger: LoggerService) {
    this.initializeFromEnv();
  }

  /**
   * Initialize credentials from environment variables
   */
  private initializeFromEnv(): void {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const userAccessToken = process.env.FACEBOOK_USER_ACCESS_TOKEN;

    if (!appId || !appSecret) {
      this.logger.warn('Facebook App credentials not configured', this.context);
      return;
    }

    this.credentials = {
      appId,
      appSecret,
      userAccessToken: userAccessToken || '',
    };

    this.logger.log('Facebook credentials initialized', this.context);
  }

  /**
   * Check if Facebook is configured
   */
  isConfigured(): boolean {
    return !!this.credentials?.appId && !!this.credentials?.appSecret;
  }

  /**
   * Check if user access token is available
   */
  hasUserToken(): boolean {
    return !!this.credentials?.userAccessToken;
  }

  /**
   * Set user access token (from OAuth flow)
   */
  setUserAccessToken(token: string): void {
    if (this.credentials) {
      this.credentials.userAccessToken = token;
      this.logger.log('User access token updated', this.context);
    }
  }

  /**
   * Generate post content from a deal
   */
  generatePostContent(deal: Deal): string {
    const lines: string[] = [];

    // Title
    lines.push(`${deal.title}`);
    lines.push('');

    // Price
    lines.push(`Price: $${Number(deal.price).toFixed(2)} (was $${Number(deal.originalPrice).toFixed(2)})`);
    lines.push(`${Math.round(Number(deal.discountPercentage))}% OFF!`);
    lines.push('');

    // Coupon code if available
    if (deal.couponCode) {
      lines.push(`Use code: ${deal.couponCode}`);
      lines.push('');
    }

    // Affiliate link
    lines.push(`Get it here: ${deal.affiliateLink}`);
    lines.push('');

    // Hashtags
    lines.push('#deals #discount #shopping #huntdeals');

    return lines.join('\n');
  }

  /**
   * Verify user access token and get user info
   */
  async verifyCredentials(): Promise<{ success: boolean; name?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Facebook App not configured' };
    }

    if (!this.hasUserToken()) {
      return { success: false, error: 'No user access token. Please connect your Facebook account.' };
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${this.graphApiVersion}/me?access_token=${this.credentials!.userAccessToken}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to verify token');
      }

      const data = await response.json();
      this.logger.log(`Facebook credentials verified: ${data.name}`, this.context);
      return { success: true, name: data.name };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to verify Facebook credentials: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get list of Pages the user manages
   */
  async getPages(): Promise<{ success: boolean; pages?: FacebookPage[]; error?: string }> {
    if (!this.hasUserToken()) {
      return { success: false, error: 'No user access token' };
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${this.graphApiVersion}/me/accounts?access_token=${this.credentials!.userAccessToken}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch pages');
      }

      const data = await response.json();
      const pages: FacebookPage[] = (data.data || []).map((page: any) => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
      }));

      this.logger.log(`Found ${pages.length} Facebook pages`, this.context);
      return { success: true, pages };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch pages: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get list of Groups the user manages
   */
  async getGroups(): Promise<{ success: boolean; groups?: FacebookGroup[]; error?: string }> {
    if (!this.hasUserToken()) {
      return { success: false, error: 'No user access token' };
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${this.graphApiVersion}/me/groups?admin_only=true&access_token=${this.credentials!.userAccessToken}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch groups');
      }

      const data = await response.json();
      const groups: FacebookGroup[] = (data.data || []).map((group: any) => ({
        id: group.id,
        name: group.name,
      }));

      this.logger.log(`Found ${groups.length} Facebook groups`, this.context);
      return { success: true, groups };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch groups: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Post to a Facebook Page
   */
  async postToPage(
    pageId: string,
    pageAccessToken: string,
    content: string,
    imageUrl?: string,
  ): Promise<{ success: boolean; postId?: string; postUrl?: string; error?: string }> {
    try {
      this.logger.debug(`Posting to page ${pageId}: ${content.substring(0, 50)}...`, this.context);

      let postData: any = { message: content };
      let endpoint = `${this.graphApiUrl}/${this.graphApiVersion}/${pageId}/feed`;

      // If image URL provided, post as photo
      if (imageUrl) {
        endpoint = `${this.graphApiUrl}/${this.graphApiVersion}/${pageId}/photos`;
        postData = { caption: content, url: imageUrl };
      }

      const response = await fetch(`${endpoint}?access_token=${pageAccessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post to page');
      }

      const result = await response.json();
      const postId = result.id || result.post_id;
      const postUrl = `https://www.facebook.com/${postId}`;

      this.logger.log(`Posted to Facebook page: ${postId}`, this.context);
      return { success: true, postId, postUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to post to page: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Post to a Facebook Group
   */
  async postToGroup(
    groupId: string,
    content: string,
    imageUrl?: string,
  ): Promise<{ success: boolean; postId?: string; postUrl?: string; error?: string }> {
    if (!this.hasUserToken()) {
      return { success: false, error: 'No user access token' };
    }

    try {
      this.logger.debug(`Posting to group ${groupId}: ${content.substring(0, 50)}...`, this.context);

      let postData: any = { message: content };
      let endpoint = `${this.graphApiUrl}/${this.graphApiVersion}/${groupId}/feed`;

      // If image URL provided, post as photo
      if (imageUrl) {
        endpoint = `${this.graphApiUrl}/${this.graphApiVersion}/${groupId}/photos`;
        postData = { caption: content, url: imageUrl };
      }

      const response = await fetch(
        `${endpoint}?access_token=${this.credentials!.userAccessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post to group');
      }

      const result = await response.json();
      const postId = result.id || result.post_id;
      const postUrl = `https://www.facebook.com/groups/${groupId}/posts/${postId.split('_')[1] || postId}`;

      this.logger.log(`Posted to Facebook group: ${postId}`, this.context);
      return { success: true, postId, postUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to post to group: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Delete a post from Facebook
   */
  async deletePost(postId: string, accessToken?: string): Promise<{ success: boolean; error?: string }> {
    const token = accessToken || this.credentials?.userAccessToken;
    if (!token) {
      return { success: false, error: 'No access token' };
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${this.graphApiVersion}/${postId}?access_token=${token}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete post');
      }

      this.logger.log(`Facebook post deleted: ${postId}`, this.context);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete post: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<{ success: boolean; token?: string; expiresIn?: number; error?: string }> {
    if (!this.credentials?.appId || !this.credentials?.appSecret) {
      return { success: false, error: 'Facebook App not configured' };
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${this.graphApiVersion}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${this.credentials.appId}&` +
        `client_secret=${this.credentials.appSecret}&` +
        `fb_exchange_token=${shortLivedToken}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to exchange token');
      }

      const data = await response.json();
      this.logger.log('Exchanged for long-lived token', this.context);
      return {
        success: true,
        token: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to exchange token: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get Facebook OAuth URL for user authentication
   */
  getOAuthUrl(redirectUri: string, state: string): string {
    if (!this.credentials?.appId) {
      throw new Error('Facebook App not configured');
    }

    const scopes = [
      'pages_manage_posts',
      'pages_read_engagement',
      'publish_to_groups',
      'groups_access_member_info',
    ].join(',');

    return (
      `https://www.facebook.com/${this.graphApiVersion}/dialog/oauth?` +
      `client_id=${this.credentials.appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scopes}&` +
      `state=${state}&` +
      `response_type=code`
    );
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ success: boolean; token?: string; error?: string }> {
    if (!this.credentials?.appId || !this.credentials?.appSecret) {
      return { success: false, error: 'Facebook App not configured' };
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${this.graphApiVersion}/oauth/access_token?` +
        `client_id=${this.credentials.appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${this.credentials.appSecret}&` +
        `code=${code}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to exchange code for token');
      }

      const data = await response.json();

      // Exchange for long-lived token
      const longLivedResult = await this.exchangeForLongLivedToken(data.access_token);
      if (longLivedResult.success && longLivedResult.token) {
        this.setUserAccessToken(longLivedResult.token);
        return { success: true, token: longLivedResult.token };
      }

      // Fall back to short-lived token
      this.setUserAccessToken(data.access_token);
      return { success: true, token: data.access_token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to exchange code for token: ${errorMessage}`, this.context);
      return { success: false, error: errorMessage };
    }
  }
}
