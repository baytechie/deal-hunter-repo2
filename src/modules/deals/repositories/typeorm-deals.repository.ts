import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Deal } from '../entities/deal.entity';
import {
  IDealsRepository,
  DealFilterOptions,
  PaginationOptions,
  PaginatedResult,
} from './deals.repository.interface';

/**
 * TypeORM implementation of the DealsRepository interface.
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles data access for deals
 * - Open/Closed: New query methods can be added without modifying existing ones
 * - Liskov Substitution: Implements IDealsRepository, can be swapped with other implementations
 * - Interface Segregation: IDealsRepository contains only deal-related methods
 * - Dependency Inversion: Service depends on IDealsRepository interface, not this class
 */
@Injectable()
export class TypeOrmDealsRepository implements IDealsRepository {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
  ) {}

  async findAll(
    filters?: DealFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<Deal>> {
    const where = this.buildWhereClause(filters);
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.dealRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Deal | null> {
    return this.dealRepository.findOne({ where: { id } });
  }

  async findHotDeals(limit = 10): Promise<Deal[]> {
    return this.dealRepository.find({
      where: { isHot: true },
      order: { discountPercentage: 'DESC' },
      take: limit,
    });
  }

  async findTopDeals(limit = 10): Promise<Deal[]> {
    return this.dealRepository.find({
      order: { discountPercentage: 'DESC' },
      take: limit,
    });
  }

  async findFeaturedDeals(limit = 10): Promise<Deal[]> {
    return this.dealRepository.find({
      where: { isFeatured: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async create(dealData: Partial<Deal>): Promise<Deal> {
    const deal = this.dealRepository.create(dealData);
    return this.dealRepository.save(deal);
  }

  async update(id: string, dealData: Partial<Deal>): Promise<Deal | null> {
    const existingDeal = await this.findById(id);
    if (!existingDeal) {
      return null;
    }

    const updatedDeal = this.dealRepository.merge(existingDeal, dealData);
    return this.dealRepository.save(updatedDeal);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dealRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getCategories(): Promise<string[]> {
    const result = await this.dealRepository
      .createQueryBuilder('deal')
      .select('DISTINCT deal.category', 'category')
      .getRawMany();

    return result.map((row) => row.category);
  }

  /**
   * Build TypeORM where clause from filter options
   * Single Responsibility: This method only builds query conditions
   */
  private buildWhereClause(filters?: DealFilterOptions): FindOptionsWhere<Deal> {
    const where: FindOptionsWhere<Deal> = {};

    if (!filters) {
      return where;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isHot !== undefined) {
      where.isHot = filters.isHot;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.minDiscount !== undefined) {
      where.discountPercentage = MoreThanOrEqual(filters.minDiscount);
    }

    if (filters.maxPrice !== undefined) {
      where.price = LessThanOrEqual(filters.maxPrice);
    }

    return where;
  }
}
