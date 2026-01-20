import { SocialPost } from '../entities/social-post.entity';
import { SocialPlatform, PostStatus } from '../types/social-platform.enum';

export const SOCIAL_POST_REPOSITORY = Symbol('SOCIAL_POST_REPOSITORY');

export interface CreateSocialPostData {
  platform: SocialPlatform;
  dealId: string;
  postContent: string;
  imageUrl?: string;
  scheduledAt?: Date;
  status?: PostStatus;
}

export interface ISocialPostRepository {
  /**
   * Create a new social post
   */
  create(data: CreateSocialPostData): Promise<SocialPost>;

  /**
   * Find a post by ID
   */
  findById(id: string): Promise<SocialPost | null>;

  /**
   * Find all posts with optional filters
   */
  findAll(filters?: {
    platform?: SocialPlatform;
    status?: PostStatus;
    dealId?: string;
  }): Promise<SocialPost[]>;

  /**
   * Find posts that are scheduled and due
   */
  findScheduledDue(): Promise<SocialPost[]>;

  /**
   * Update a post
   */
  update(id: string, data: Partial<SocialPost>): Promise<SocialPost | null>;

  /**
   * Delete a post
   */
  delete(id: string): Promise<boolean>;
}
