import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingDeal } from '../entities/pending-deal.entity';
import {
  IPendingDealsRepository,
  PendingDealFilterOptions,
  PaginationOptions,
  PaginatedResult,
  PendingDealStats,
} from './pending-deals.repository.interface';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * TypeORM implementation of IPendingDealsRepository
 */
@Injectable()
export class TypeOrmPendingDealsRepository implements IPendingDealsRepository {
  private readonly context = 'TypeOrmPendingDealsRepository';

  constructor(
    @InjectRepository(PendingDeal)
    private pendingDealRepository: Repository<PendingDeal>,
    private logger: LoggerService,
  ) {}

  async findAll(
    filters?: PendingDealFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<PendingDeal>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.pendingDealRepository.createQueryBuilder('pending_deal');

    if (filters?.status) {
      queryBuilder.andWhere('pending_deal.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      queryBuilder.andWhere('pending_deal.category = :category', { category: filters.category });
    }

    queryBuilder.orderBy('pending_deal.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    this.logger.debug(
      `Found ${data.length} pending deals (total: ${total}, page: ${page})`,
      this.context,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<PendingDeal | null> {
    return this.pendingDealRepository.findOne({ where: { id } });
  }

  async findByAsin(asin: string): Promise<PendingDeal | null> {
    return this.pendingDealRepository.findOne({ where: { asin } });
  }

  async create(dealData: Partial<PendingDeal>): Promise<PendingDeal> {
    const pendingDeal = this.pendingDealRepository.create(dealData);
    return this.pendingDealRepository.save(pendingDeal);
  }

  async update(id: string, dealData: Partial<PendingDeal>): Promise<PendingDeal | null> {
    const existingDeal = await this.findById(id);
    if (!existingDeal) {
      return null;
    }

    Object.assign(existingDeal, dealData);
    return this.pendingDealRepository.save(existingDeal);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pendingDealRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async clearAll(): Promise<number> {
    const result = await this.pendingDealRepository.delete({});
    return result.affected ?? 0;
  }

  async getStats(): Promise<PendingDealStats> {
    const pending = await this.pendingDealRepository.count({ where: { status: 'PENDING' } });
    const approved = await this.pendingDealRepository.count({ where: { status: 'APPROVED' } });
    const rejected = await this.pendingDealRepository.count({ where: { status: 'REJECTED' } });

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }
}
