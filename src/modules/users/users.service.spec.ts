import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { LoggerService } from '../../shared/services/logger.service';
import { User } from './entities/user.entity';
import { SavedDeal } from './entities/saved-deal.entity';
import { UserFcmToken } from './entities/user-fcm-token.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository: any;
  let mockLoggerService: any;

  const mockUser: Partial<User> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    emailVerified: true,
    passwordHash: null,
    googleId: 'google-123',
    appleId: null,
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    notificationPreferences: JSON.stringify({ push: true, email: true, priceAlerts: true }),
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    getNotificationPreferences: jest.fn().mockReturnValue({ push: true, email: true, priceAlerts: true }),
    setNotificationPreferences: jest.fn(),
  };

  const mockSavedDeal: Partial<SavedDeal> = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    userId: mockUser.id,
    dealId: '323e4567-e89b-12d3-a456-426614174000',
    priceAlertEnabled: true,
    priceAlertThreshold: 5.0,
    notes: 'Great deal!',
    savedAt: new Date(),
  };

  const mockFcmToken: Partial<UserFcmToken> = {
    id: '423e4567-e89b-12d3-a456-426614174000',
    userId: mockUser.id as string,
    fcmToken: 'fcm-token-123',
    platform: 'android',
    deviceId: 'device-123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUsersRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      findByAppleId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findSavedDeals: jest.fn(),
      findSavedDeal: jest.fn(),
      saveDeal: jest.fn(),
      updateSavedDeal: jest.fn(),
      unsaveDeal: jest.fn(),
      getUsersWithSavedDeal: jest.fn(),
      findFcmTokens: jest.fn(),
      registerFcmToken: jest.fn(),
      deactivateFcmToken: jest.fn(),
      findActiveFcmTokensByUserIds: jest.fn(),
    };

    mockLoggerService = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: mockUsersRepository },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============ User Management Tests ============

  describe('findById', () => {
    it('should return a user when found', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id!);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email!);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('should return a user when found by Google ID', async () => {
      mockUsersRepository.findByGoogleId.mockResolvedValue(mockUser);

      const result = await service.findByGoogleId(mockUser.googleId!);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findByAppleId', () => {
    it('should return a user when found by Apple ID', async () => {
      const userWithApple = { ...mockUser, appleId: 'apple-123' };
      mockUsersRepository.findByAppleId.mockResolvedValue(userWithApple);

      const result = await service.findByAppleId('apple-123');

      expect(result).toEqual(userWithApple);
    });
  });

  describe('create', () => {
    const createUserDto = {
      email: 'new@example.com',
      displayName: 'New User',
      googleId: 'google-456',
    };

    it('should create a new user', async () => {
      const newUser = { ...mockUser, ...createUserDto };
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(newUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create({ email: mockUser.email! })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow creation without email', async () => {
      const dtoWithoutEmail = { googleId: 'google-456' };
      const newUser = { ...mockUser, email: null, ...dtoWithoutEmail };
      mockUsersRepository.create.mockResolvedValue(newUser);

      const result = await service.create(dtoWithoutEmail);

      expect(result).toEqual(newUser);
      expect(mockUsersRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateUserDto = {
      displayName: 'Updated Name',
      avatarUrl: 'https://example.com/new-avatar.jpg',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id!, updateUserDto);

      expect(result.displayName).toBe(updateUserDto.displayName);
      expect(mockUsersRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update notification preferences', async () => {
      const dtoWithNotifications = {
        notificationPreferences: { push: false, email: true, priceAlerts: false },
      };
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      mockUsersRepository.update.mockResolvedValue(mockUser);

      await service.update(mockUser.id!, dtoWithNotifications);

      expect(mockUser.setNotificationPreferences).toHaveBeenCalledWith(
        dtoWithNotifications.notificationPreferences,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUsersRepository.delete.mockResolvedValue(true);

      await service.delete(mockUser.id!);

      expect(mockUsersRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.delete.mockResolvedValue(false);

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      mockUsersRepository.update.mockResolvedValue(mockUser);

      await service.updateLastLogin(mockUser.id!);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });
  });

  // ============ Saved Deals Tests ============

  describe('getSavedDeals', () => {
    it('should return paginated saved deals', async () => {
      const paginatedResult = {
        data: [mockSavedDeal],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockUsersRepository.findSavedDeals.mockResolvedValue(paginatedResult);

      const result = await service.getSavedDeals(mockUser.id!);

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('saveDeal', () => {
    it('should save a deal for a user', async () => {
      mockUsersRepository.saveDeal.mockResolvedValue(mockSavedDeal);

      const result = await service.saveDeal(
        mockUser.id!,
        mockSavedDeal.dealId!,
        true,
        5.0,
        'Great deal!',
      );

      expect(result).toEqual(mockSavedDeal);
      expect(mockUsersRepository.saveDeal).toHaveBeenCalledWith(
        mockUser.id,
        mockSavedDeal.dealId,
        true,
        5.0,
        'Great deal!',
      );
    });

    it('should use default values when not provided', async () => {
      mockUsersRepository.saveDeal.mockResolvedValue(mockSavedDeal);

      await service.saveDeal(mockUser.id!, mockSavedDeal.dealId!);

      expect(mockUsersRepository.saveDeal).toHaveBeenCalledWith(
        mockUser.id,
        mockSavedDeal.dealId,
        true, // default priceAlertEnabled
        5.0, // default priceAlertThreshold
        undefined,
      );
    });
  });

  describe('updateSavedDealAlert', () => {
    it('should update alert settings', async () => {
      const updatedSavedDeal = { ...mockSavedDeal, priceAlertEnabled: false };
      mockUsersRepository.findSavedDeal.mockResolvedValue(mockSavedDeal);
      mockUsersRepository.updateSavedDeal.mockResolvedValue(updatedSavedDeal);

      const result = await service.updateSavedDealAlert(
        mockUser.id!,
        mockSavedDeal.dealId!,
        false,
        10.0,
      );

      expect(result.priceAlertEnabled).toBe(false);
    });

    it('should throw NotFoundException when saved deal not found', async () => {
      mockUsersRepository.findSavedDeal.mockResolvedValue(null);

      await expect(
        service.updateSavedDealAlert(mockUser.id!, 'non-existent-deal', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsaveDeal', () => {
    it('should unsave a deal', async () => {
      mockUsersRepository.unsaveDeal.mockResolvedValue(true);

      await service.unsaveDeal(mockUser.id!, mockSavedDeal.dealId!);

      expect(mockUsersRepository.unsaveDeal).toHaveBeenCalledWith(
        mockUser.id,
        mockSavedDeal.dealId,
      );
    });

    it('should throw NotFoundException when saved deal not found', async () => {
      mockUsersRepository.unsaveDeal.mockResolvedValue(false);

      await expect(
        service.unsaveDeal(mockUser.id!, 'non-existent-deal'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsersWithSavedDeal', () => {
    it('should return users who saved a deal', async () => {
      mockUsersRepository.getUsersWithSavedDeal.mockResolvedValue([mockSavedDeal]);

      const result = await service.getUsersWithSavedDeal(mockSavedDeal.dealId!);

      expect(result).toEqual([mockSavedDeal]);
    });

    it('should filter by alerts only when requested', async () => {
      mockUsersRepository.getUsersWithSavedDeal.mockResolvedValue([mockSavedDeal]);

      await service.getUsersWithSavedDeal(mockSavedDeal.dealId!, true);

      expect(mockUsersRepository.getUsersWithSavedDeal).toHaveBeenCalledWith(
        mockSavedDeal.dealId,
        true,
      );
    });
  });

  // ============ FCM Token Tests ============

  describe('getFcmTokens', () => {
    it('should return FCM tokens for a user', async () => {
      mockUsersRepository.findFcmTokens.mockResolvedValue([mockFcmToken]);

      const result = await service.getFcmTokens(mockUser.id!);

      expect(result).toEqual([mockFcmToken]);
    });
  });

  describe('registerFcmToken', () => {
    it('should register a new FCM token', async () => {
      mockUsersRepository.registerFcmToken.mockResolvedValue(mockFcmToken);

      const result = await service.registerFcmToken(
        mockUser.id!,
        mockFcmToken.fcmToken!,
        mockFcmToken.platform!,
        mockFcmToken.deviceId,
      );

      expect(result).toEqual(mockFcmToken);
      expect(mockUsersRepository.registerFcmToken).toHaveBeenCalledWith(
        mockUser.id,
        mockFcmToken.fcmToken,
        mockFcmToken.platform,
        mockFcmToken.deviceId,
      );
    });
  });

  describe('deactivateFcmToken', () => {
    it('should deactivate an FCM token', async () => {
      mockUsersRepository.deactivateFcmToken.mockResolvedValue(true);

      await service.deactivateFcmToken(mockUser.id!, mockFcmToken.id!);

      expect(mockUsersRepository.deactivateFcmToken).toHaveBeenCalledWith(
        mockFcmToken.id,
      );
    });

    it('should throw NotFoundException when token not found', async () => {
      mockUsersRepository.deactivateFcmToken.mockResolvedValue(false);

      await expect(
        service.deactivateFcmToken(mockUser.id!, 'non-existent-token'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveFcmTokensByUserIds', () => {
    it('should return active FCM tokens for multiple users', async () => {
      mockUsersRepository.findActiveFcmTokensByUserIds.mockResolvedValue([
        mockFcmToken,
      ]);

      const result = await service.getActiveFcmTokensByUserIds([mockUser.id!]);

      expect(result).toEqual([mockFcmToken]);
    });
  });
});
