import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { SavedDeal } from './entities/saved-deal.entity';
import { UserFcmToken } from './entities/user-fcm-token.entity';
import {
  IUsersRepository,
  USERS_REPOSITORY,
  PaginationOptions,
  PaginatedResult,
} from './repositories/users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * UsersService - Handles business logic for users
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only contains user-related business logic
 * - Dependency Inversion: Depends on IUsersRepository interface
 */
@Injectable()
export class UsersService {
  private readonly context = 'UsersService';

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly logger: LoggerService,
  ) {}

  // ============ User Management ============

  async findById(id: string): Promise<User> {
    this.logger.debug(`Finding user by ID: ${id}`, this.context);

    const user = await this.usersRepository.findById(id);
    if (!user) {
      this.logger.warn(`User not found: ${id}`, this.context);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`, this.context);
    return this.usersRepository.findByEmail(email);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    this.logger.debug(`Finding user by Google ID: ${googleId}`, this.context);
    return this.usersRepository.findByGoogleId(googleId);
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    this.logger.debug(`Finding user by Apple ID: ${appleId}`, this.context);
    return this.usersRepository.findByAppleId(appleId);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.debug(`Creating new user with email: ${createUserDto.email}`, this.context);

    // Check for existing user with same email
    if (createUserDto.email) {
      const existingByEmail = await this.usersRepository.findByEmail(createUserDto.email);
      if (existingByEmail) {
        throw new ConflictException(`User with email ${createUserDto.email} already exists`);
      }
    }

    const user = await this.usersRepository.create(createUserDto);
    this.logger.log(`User created successfully: ${user.id}`, this.context);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.debug(`Updating user: ${id}`, this.context);

    const user = await this.findById(id);

    const updateData: Partial<User> = {};

    if (updateUserDto.displayName !== undefined) {
      updateData.displayName = updateUserDto.displayName;
    }

    if (updateUserDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateUserDto.avatarUrl;
    }

    if (updateUserDto.notificationPreferences !== undefined) {
      user.setNotificationPreferences(updateUserDto.notificationPreferences);
      updateData.notificationPreferences = user.notificationPreferences;
    }

    const updatedUser = await this.usersRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`User updated successfully: ${id}`, this.context);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting user: ${id}`, this.context);

    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`User deleted successfully: ${id}`, this.context);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
    this.logger.debug(`Updated last login for user: ${id}`, this.context);
  }

  // ============ Saved Deals ============

  async getSavedDeals(userId: string, pagination?: PaginationOptions): Promise<PaginatedResult<SavedDeal>> {
    this.logger.debug(`Getting saved deals for user: ${userId}`, this.context);
    return this.usersRepository.findSavedDeals(userId, pagination);
  }

  async getSavedDeal(userId: string, dealId: string): Promise<SavedDeal | null> {
    return this.usersRepository.findSavedDeal(userId, dealId);
  }

  async saveDeal(
    userId: string,
    dealId: string,
    priceAlertEnabled = true,
    priceAlertThreshold = 5.00,
    notes?: string,
  ): Promise<SavedDeal> {
    this.logger.debug(`User ${userId} saving deal: ${dealId}`, this.context);

    const savedDeal = await this.usersRepository.saveDeal(
      userId,
      dealId,
      priceAlertEnabled,
      priceAlertThreshold,
      notes,
    );

    this.logger.log(`Deal saved successfully for user ${userId}: ${dealId}`, this.context);
    return savedDeal;
  }

  async updateSavedDealAlert(
    userId: string,
    dealId: string,
    enabled?: boolean,
    threshold?: number,
  ): Promise<SavedDeal> {
    this.logger.debug(`Updating alert for user ${userId}, deal ${dealId}`, this.context);

    const savedDeal = await this.usersRepository.findSavedDeal(userId, dealId);
    if (!savedDeal) {
      throw new NotFoundException(`Saved deal not found for user ${userId} and deal ${dealId}`);
    }

    const updateData: Partial<SavedDeal> = {};
    if (enabled !== undefined) {
      updateData.priceAlertEnabled = enabled;
    }
    if (threshold !== undefined) {
      updateData.priceAlertThreshold = threshold;
    }

    const updated = await this.usersRepository.updateSavedDeal(savedDeal.id, updateData);
    if (!updated) {
      throw new NotFoundException(`Failed to update saved deal`);
    }

    this.logger.log(`Alert settings updated for user ${userId}, deal ${dealId}`, this.context);
    return updated;
  }

  async unsaveDeal(userId: string, dealId: string): Promise<void> {
    this.logger.debug(`User ${userId} unsaving deal: ${dealId}`, this.context);

    const unsaved = await this.usersRepository.unsaveDeal(userId, dealId);
    if (!unsaved) {
      throw new NotFoundException(`Saved deal not found for user ${userId} and deal ${dealId}`);
    }

    this.logger.log(`Deal unsaved successfully for user ${userId}: ${dealId}`, this.context);
  }

  async getUsersWithSavedDeal(dealId: string, alertsOnly = false): Promise<SavedDeal[]> {
    return this.usersRepository.getUsersWithSavedDeal(dealId, alertsOnly);
  }

  // ============ FCM Tokens ============

  async getFcmTokens(userId: string): Promise<UserFcmToken[]> {
    this.logger.debug(`Getting FCM tokens for user: ${userId}`, this.context);
    return this.usersRepository.findFcmTokens(userId);
  }

  async registerFcmToken(
    userId: string,
    fcmToken: string,
    platform: string,
    deviceId?: string,
  ): Promise<UserFcmToken> {
    this.logger.debug(`Registering FCM token for user: ${userId}`, this.context);

    const token = await this.usersRepository.registerFcmToken(userId, fcmToken, platform, deviceId);

    this.logger.log(`FCM token registered for user ${userId}`, this.context);
    return token;
  }

  async deactivateFcmToken(userId: string, tokenId: string): Promise<void> {
    this.logger.debug(`Deactivating FCM token ${tokenId} for user: ${userId}`, this.context);

    const deactivated = await this.usersRepository.deactivateFcmToken(tokenId);
    if (!deactivated) {
      throw new NotFoundException(`FCM token not found: ${tokenId}`);
    }

    this.logger.log(`FCM token deactivated for user ${userId}: ${tokenId}`, this.context);
  }

  async getActiveFcmTokensByUserIds(userIds: string[]): Promise<UserFcmToken[]> {
    return this.usersRepository.findActiveFcmTokensByUserIds(userIds);
  }
}
