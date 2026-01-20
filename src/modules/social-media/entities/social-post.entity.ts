import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Deal } from '../../deals/entities/deal.entity';
import { SocialPlatform, PostStatus } from '../types/social-platform.enum';

/**
 * SocialPost Entity - Tracks posts made to social media platforms
 */
@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    enum: SocialPlatform,
    default: SocialPlatform.TWITTER,
  })
  platform: SocialPlatform;

  @Column({ nullable: true })
  dealId: string;

  @ManyToOne(() => Deal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dealId' })
  deal: Deal;

  @Column({ type: 'text' })
  postContent: string;

  @Column({ nullable: true })
  postId: string; // Platform's post ID after publishing

  @Column({ nullable: true })
  postUrl: string; // URL to the published post

  @Column({ nullable: true })
  imageUrl: string; // Image attached to the post

  @Column({
    type: 'varchar',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date; // For scheduled posts

  @Column({ type: 'datetime', nullable: true })
  postedAt: Date; // When actually posted

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // If posting failed

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
