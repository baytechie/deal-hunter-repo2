import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { SavedDeal } from '../entities/saved-deal.entity';
import { UserFcmToken } from '../entities/user-fcm-token.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  IUsersRepository,
  PaginationOptions,
  PaginatedResult,
  DeviceInfo,
} from './users.repository.interface';

/**
 * TypeORM implementation of the UsersRepository interface.
 */
@Injectable()
export class TypeOrmUsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(SavedDeal)
    private readonly savedDealRepository: Repository<SavedDeal>,
    @InjectRepository(UserFcmToken)
    private readonly fcmTokenRepository: Repository<UserFcmToken>,
  ) {}

  // ============ User CRUD ============

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { appleId } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const updatedUser = this.userRepository.merge(user, userData);
    return this.userRepository.save(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // ============ Sessions ============

  async createSession(
    userId: string,
    refreshTokenHash: string,
    deviceInfo: DeviceInfo,
    expiresAt: Date,
    ipAddress?: string,
  ): Promise<UserSession> {
    const session = this.sessionRepository.create({
      userId,
      refreshTokenHash,
      deviceInfo: JSON.stringify(deviceInfo),
      expiresAt,
      ipAddress,
      lastUsedAt: new Date(),
    });
    return this.sessionRepository.save(session);
  }

  async findSessionByToken(refreshTokenHash: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { refreshTokenHash },
      relations: ['user'],
    });
  }

  async findSessionById(sessionId: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
  }

  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, { lastUsedAt: new Date() });
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await this.sessionRepository.delete(sessionId);
    return (result.affected ?? 0) > 0;
  }

  async deleteAllUserSessions(userId: string): Promise<number> {
    const result = await this.sessionRepository.delete({ userId });
    return result.affected ?? 0;
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    return result.affected ?? 0;
  }

  // ============ Saved Deals ============

  async findSavedDeals(
    userId: string,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<SavedDeal>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.savedDealRepository.findAndCount({
      where: { userId },
      relations: ['deal'],
      order: { savedAt: 'DESC' },
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

  async findSavedDeal(userId: string, dealId: string): Promise<SavedDeal | null> {
    return this.savedDealRepository.findOne({
      where: { userId, dealId },
      relations: ['deal'],
    });
  }

  async saveDeal(
    userId: string,
    dealId: string,
    priceAlertEnabled = true,
    priceAlertThreshold = 5.00,
    notes?: string,
  ): Promise<SavedDeal> {
    // Check if already saved
    const existing = await this.findSavedDeal(userId, dealId);
    if (existing) {
      return existing;
    }

    const savedDeal = this.savedDealRepository.create({
      userId,
      dealId,
      priceAlertEnabled,
      priceAlertThreshold,
      notes,
    });
    return this.savedDealRepository.save(savedDeal);
  }

  async updateSavedDeal(id: string, data: Partial<SavedDeal>): Promise<SavedDeal | null> {
    const savedDeal = await this.savedDealRepository.findOne({ where: { id } });
    if (!savedDeal) return null;

    const updated = this.savedDealRepository.merge(savedDeal, data);
    return this.savedDealRepository.save(updated);
  }

  async unsaveDeal(userId: string, dealId: string): Promise<boolean> {
    const result = await this.savedDealRepository.delete({ userId, dealId });
    return (result.affected ?? 0) > 0;
  }

  async getUsersWithSavedDeal(dealId: string, alertsOnly = false): Promise<SavedDeal[]> {
    const query = this.savedDealRepository
      .createQueryBuilder('savedDeal')
      .leftJoinAndSelect('savedDeal.user', 'user')
      .where('savedDeal.dealId = :dealId', { dealId });

    if (alertsOnly) {
      query.andWhere('savedDeal.priceAlertEnabled = :enabled', { enabled: true });
    }

    return query.getMany();
  }

  // ============ FCM Tokens ============

  async findFcmTokens(userId: string): Promise<UserFcmToken[]> {
    return this.fcmTokenRepository.find({
      where: { userId, isActive: true },
    });
  }

  async registerFcmToken(
    userId: string,
    fcmToken: string,
    platform: string,
    deviceId?: string,
  ): Promise<UserFcmToken> {
    // Check if token already exists
    const existing = await this.fcmTokenRepository.findOne({
      where: { userId, fcmToken },
    });

    if (existing) {
      // Reactivate if inactive
      if (!existing.isActive) {
        existing.isActive = true;
        await this.fcmTokenRepository.save(existing);
      }
      return existing;
    }

    const token = this.fcmTokenRepository.create({
      userId,
      fcmToken,
      platform,
      deviceId,
    });
    return this.fcmTokenRepository.save(token);
  }

  async deactivateFcmToken(tokenId: string): Promise<boolean> {
    const result = await this.fcmTokenRepository.update(tokenId, { isActive: false });
    return (result.affected ?? 0) > 0;
  }

  async deleteFcmToken(userId: string, fcmToken: string): Promise<boolean> {
    const result = await this.fcmTokenRepository.delete({ userId, fcmToken });
    return (result.affected ?? 0) > 0;
  }

  async findActiveFcmTokensByUserIds(userIds: string[]): Promise<UserFcmToken[]> {
    if (userIds.length === 0) return [];

    return this.fcmTokenRepository.find({
      where: {
        userId: In(userIds),
        isActive: true,
      },
    });
  }
}
