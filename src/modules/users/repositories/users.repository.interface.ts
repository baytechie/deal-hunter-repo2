import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { SavedDeal } from '../entities/saved-deal.entity';
import { UserFcmToken } from '../entities/user-fcm-token.entity';
import { CreateUserDto } from '../dto/create-user.dto';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Device info for sessions
 */
export interface DeviceInfo {
  platform?: string;
  deviceId?: string;
  appVersion?: string;
}

/**
 * IUsersRepository Interface - Dependency Inversion Principle
 */
export interface IUsersRepository {
  // User CRUD
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByAppleId(appleId: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;

  // Sessions
  createSession(
    userId: string,
    refreshTokenHash: string,
    deviceInfo: DeviceInfo,
    expiresAt: Date,
    ipAddress?: string,
  ): Promise<UserSession>;
  findSessionByToken(refreshTokenHash: string): Promise<UserSession | null>;
  findSessionById(sessionId: string): Promise<UserSession | null>;
  updateSessionLastUsed(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<boolean>;
  deleteAllUserSessions(userId: string): Promise<number>;
  deleteExpiredSessions(): Promise<number>;

  // Saved Deals
  findSavedDeals(userId: string, pagination?: PaginationOptions): Promise<PaginatedResult<SavedDeal>>;
  findSavedDeal(userId: string, dealId: string): Promise<SavedDeal | null>;
  saveDeal(
    userId: string,
    dealId: string,
    priceAlertEnabled?: boolean,
    priceAlertThreshold?: number,
    notes?: string,
  ): Promise<SavedDeal>;
  updateSavedDeal(id: string, data: Partial<SavedDeal>): Promise<SavedDeal | null>;
  unsaveDeal(userId: string, dealId: string): Promise<boolean>;
  getUsersWithSavedDeal(dealId: string, alertsOnly?: boolean): Promise<SavedDeal[]>;

  // FCM Tokens
  findFcmTokens(userId: string): Promise<UserFcmToken[]>;
  registerFcmToken(userId: string, fcmToken: string, platform: string, deviceId?: string): Promise<UserFcmToken>;
  deactivateFcmToken(tokenId: string): Promise<boolean>;
  deleteFcmToken(userId: string, fcmToken: string): Promise<boolean>;
  findActiveFcmTokensByUserIds(userIds: string[]): Promise<UserFcmToken[]>;
}

/**
 * Injection token for the repository interface
 */
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
