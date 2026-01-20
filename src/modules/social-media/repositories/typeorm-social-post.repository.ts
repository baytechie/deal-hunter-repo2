import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { SocialPost } from '../entities/social-post.entity';
import { SocialPlatform, PostStatus } from '../types/social-platform.enum';
import {
  ISocialPostRepository,
  CreateSocialPostData,
} from './social-post.repository.interface';

@Injectable()
export class TypeOrmSocialPostRepository implements ISocialPostRepository {
  constructor(
    @InjectRepository(SocialPost)
    private readonly repository: Repository<SocialPost>,
  ) {}

  async create(data: CreateSocialPostData): Promise<SocialPost> {
    const post = this.repository.create({
      ...data,
      status: data.status || (data.scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT),
    });
    return this.repository.save(post);
  }

  async findById(id: string): Promise<SocialPost | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['deal'],
    });
  }

  async findAll(filters?: {
    platform?: SocialPlatform;
    status?: PostStatus;
    dealId?: string;
  }): Promise<SocialPost[]> {
    const where: any = {};

    if (filters?.platform) {
      where.platform = filters.platform;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dealId) {
      where.dealId = filters.dealId;
    }

    return this.repository.find({
      where,
      relations: ['deal'],
      order: { createdAt: 'DESC' },
    });
  }

  async findScheduledDue(): Promise<SocialPost[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: LessThanOrEqual(now),
      },
      relations: ['deal'],
    });
  }

  async update(id: string, data: Partial<SocialPost>): Promise<SocialPost | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
