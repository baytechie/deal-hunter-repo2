import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PendingDealsService } from './pending-deals.service';
import { PENDING_DEALS_REPOSITORY } from './repositories/pending-deals.repository.interface';
import { Deal } from '../deals/entities/deal.entity';
import { PendingDeal } from './entities/pending-deal.entity';
import { AmazonPaapiService } from '../amazon/services/amazon-paapi.service';
import { AffiliateService } from '../deals/services/affiliate.service';
import { LoggerService } from '../../shared/services/logger.service';

describe('PendingDealsService', () => {
  let service: PendingDealsService;
  let mockPendingDealsRepository: any;
  let mockDealRepository: any;
  let mockAmazonPaapiService: any;
  let mockAffiliateService: any;
  let mockLoggerService: any;

  const mockPendingDeal: Partial<PendingDeal> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    asin: 'B123456789',
    title: 'Test Product',
    description: 'A great test product',
    price: 50,
    originalPrice: 100,
    discountPercentage: 50,
    imageUrl: 'https://example.com/image.jpg',
    productUrl: 'https://amazon.com/dp/B123456789',
    category: 'Electronics',
    status: 'PENDING',
    dealBadge: null,
    dealAccessType: null,
    dealEndTime: null,
    couponCode: null,
    promoDescription: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: new Date(),
  };

  const mockDeal: Partial<Deal> = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    title: 'Test Product',
    price: 50,
    originalPrice: 100,
    discountPercentage: 50,
    affiliateLink: 'https://amazon.com/dp/B123456789?tag=test-20',
    category: 'Electronics',
    isHot: false,
    isFeatured: false,
    asin: 'B123456789',
    pendingDealId: '123e4567-e89b-12d3-a456-426614174000',
  };

  beforeEach(async () => {
    mockPendingDealsRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByAsin: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
      getStats: jest.fn(),
    };

    mockDealRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockAmazonPaapiService = {
      searchItems: jest.fn(),
      searchItemsWithPagination: jest.fn(),
    };

    mockAffiliateService = {
      sanitizeAffiliateUrl: jest.fn((url) => `${url}?tag=test-20`),
    };

    mockLoggerService = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendingDealsService,
        { provide: PENDING_DEALS_REPOSITORY, useValue: mockPendingDealsRepository },
        { provide: getRepositoryToken(Deal), useValue: mockDealRepository },
        { provide: AmazonPaapiService, useValue: mockAmazonPaapiService },
        { provide: AffiliateService, useValue: mockAffiliateService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<PendingDealsService>(PendingDealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated pending deals', async () => {
      const paginatedResult = {
        data: [mockPendingDeal],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockPendingDealsRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(paginatedResult);
      expect(mockPendingDealsRepository.findAll).toHaveBeenCalled();
    });

    it('should pass status filter to repository', async () => {
      mockPendingDealsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await service.findAll({ status: 'PENDING', page: 1, limit: 10 });

      expect(mockPendingDealsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING' }),
        expect.any(Object),
      );
    });
  });

  describe('findById', () => {
    it('should return a pending deal when found', async () => {
      mockPendingDealsRepository.findById.mockResolvedValue(mockPendingDeal);

      const result = await service.findById(mockPendingDeal.id!);

      expect(result).toEqual(mockPendingDeal);
    });

    it('should throw NotFoundException when pending deal not found', async () => {
      mockPendingDealsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approve', () => {
    const approveDealDto = {
      isHot: true,
      isFeatured: false,
      customTitle: 'Custom Title',
    };
    const userId = 'user-123';

    it('should approve a pending deal and create a published deal', async () => {
      mockPendingDealsRepository.findById.mockResolvedValue(mockPendingDeal);
      mockDealRepository.create.mockReturnValue(mockDeal);
      mockDealRepository.save.mockResolvedValue(mockDeal);
      mockPendingDealsRepository.update.mockResolvedValue({
        ...mockPendingDeal,
        status: 'APPROVED',
      });

      const result = await service.approve(mockPendingDeal.id!, userId, approveDealDto);

      expect(result).toEqual(mockDeal);
      expect(mockDealRepository.create).toHaveBeenCalled();
      expect(mockDealRepository.save).toHaveBeenCalled();
      expect(mockPendingDealsRepository.update).toHaveBeenCalledWith(
        mockPendingDeal.id,
        expect.objectContaining({ status: 'APPROVED', approvedBy: userId }),
      );
    });

    it('should throw ConflictException when deal is already approved', async () => {
      const approvedDeal = { ...mockPendingDeal, status: 'APPROVED' };
      mockPendingDealsRepository.findById.mockResolvedValue(approvedDeal);

      await expect(
        service.approve(mockPendingDeal.id!, userId, approveDealDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when deal is already rejected', async () => {
      const rejectedDeal = { ...mockPendingDeal, status: 'REJECTED' };
      mockPendingDealsRepository.findById.mockResolvedValue(rejectedDeal);

      await expect(
        service.approve(mockPendingDeal.id!, userId, approveDealDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should use custom title when provided', async () => {
      mockPendingDealsRepository.findById.mockResolvedValue(mockPendingDeal);
      mockDealRepository.create.mockReturnValue(mockDeal);
      mockDealRepository.save.mockResolvedValue(mockDeal);
      mockPendingDealsRepository.update.mockResolvedValue({
        ...mockPendingDeal,
        status: 'APPROVED',
      });

      await service.approve(mockPendingDeal.id!, userId, approveDealDto);

      expect(mockDealRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Custom Title' }),
      );
    });

    it('should use original title when custom title not provided', async () => {
      mockPendingDealsRepository.findById.mockResolvedValue(mockPendingDeal);
      mockDealRepository.create.mockReturnValue(mockDeal);
      mockDealRepository.save.mockResolvedValue(mockDeal);
      mockPendingDealsRepository.update.mockResolvedValue({
        ...mockPendingDeal,
        status: 'APPROVED',
      });

      await service.approve(mockPendingDeal.id!, userId, {});

      expect(mockDealRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: mockPendingDeal.title }),
      );
    });
  });

  describe('reject', () => {
    const rejectDealDto = { reason: 'Low quality product' };
    const userId = 'user-123';

    it('should reject a pending deal with a reason', async () => {
      const rejectedDeal = {
        ...mockPendingDeal,
        status: 'REJECTED',
        approvedBy: userId,
        rejectionReason: rejectDealDto.reason,
      };
      mockPendingDealsRepository.findById.mockResolvedValue(mockPendingDeal);
      mockPendingDealsRepository.update.mockResolvedValue(rejectedDeal);

      const result = await service.reject(mockPendingDeal.id!, userId, rejectDealDto);

      expect(result.status).toBe('REJECTED');
      expect(mockPendingDealsRepository.update).toHaveBeenCalledWith(
        mockPendingDeal.id,
        expect.objectContaining({
          status: 'REJECTED',
          approvedBy: userId,
          rejectionReason: rejectDealDto.reason,
        }),
      );
    });

    it('should throw ConflictException when deal is already processed', async () => {
      const approvedDeal = { ...mockPendingDeal, status: 'APPROVED' };
      mockPendingDealsRepository.findById.mockResolvedValue(approvedDeal);

      await expect(
        service.reject(mockPendingDeal.id!, userId, rejectDealDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a pending deal', async () => {
      mockPendingDealsRepository.delete.mockResolvedValue(true);

      await service.delete(mockPendingDeal.id!);

      expect(mockPendingDealsRepository.delete).toHaveBeenCalledWith(
        mockPendingDeal.id,
      );
    });

    it('should throw NotFoundException when pending deal not found', async () => {
      mockPendingDealsRepository.delete.mockResolvedValue(false);

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all pending deals and return count', async () => {
      mockPendingDealsRepository.clearAll.mockResolvedValue(5);

      const result = await service.clearAll();

      expect(result).toBe(5);
      expect(mockLoggerService.warn).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return pending deal statistics', async () => {
      const stats = {
        total: 100,
        pending: 50,
        approved: 40,
        rejected: 10,
      };
      mockPendingDealsRepository.getStats.mockResolvedValue(stats);

      const result = await service.getStats();

      expect(result).toEqual(stats);
    });
  });

  describe('syncFromAmazon', () => {
    const syncDto = {
      keywords: 'electronics',
      category: 'Electronics',
      itemCount: 5,
    };

    const mockProducts = [
      {
        asin: 'B111111111',
        title: 'Product 1',
        price: 50,
        originalPrice: 100,
        discountPercentage: 50,
        productUrl: 'https://amazon.com/dp/B111111111',
        category: 'Electronics',
      },
      {
        asin: 'B222222222',
        title: 'Product 2',
        price: 30,
        originalPrice: 60,
        discountPercentage: 50,
        productUrl: 'https://amazon.com/dp/B222222222',
        category: 'Electronics',
      },
    ];

    it('should sync products from Amazon and create pending deals', async () => {
      mockAmazonPaapiService.searchItems.mockResolvedValue(mockProducts);
      mockPendingDealsRepository.findByAsin.mockResolvedValue(null);
      mockPendingDealsRepository.create.mockResolvedValue(mockPendingDeal);

      const result = await service.syncFromAmazon(syncDto);

      expect(result.created).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.total).toBe(2);
      expect(mockPendingDealsRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should skip duplicate ASINs', async () => {
      mockAmazonPaapiService.searchItems.mockResolvedValue(mockProducts);
      mockPendingDealsRepository.findByAsin
        .mockResolvedValueOnce(mockPendingDeal) // First one exists
        .mockResolvedValueOnce(null); // Second one is new
      mockPendingDealsRepository.create.mockResolvedValue(mockPendingDeal);

      const result = await service.syncFromAmazon(syncDto);

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(1);
    });

    it('should use pagination for large item counts', async () => {
      const largeDto = { ...syncDto, itemCount: 15 };
      mockAmazonPaapiService.searchItemsWithPagination.mockResolvedValue(mockProducts);
      mockPendingDealsRepository.findByAsin.mockResolvedValue(null);
      mockPendingDealsRepository.create.mockResolvedValue(mockPendingDeal);

      await service.syncFromAmazon(largeDto);

      expect(mockAmazonPaapiService.searchItemsWithPagination).toHaveBeenCalled();
      expect(mockAmazonPaapiService.searchItems).not.toHaveBeenCalled();
    });

    it('should filter by minimum discount percentage', async () => {
      const dtoWithMinDiscount = { ...syncDto, minDiscountPercent: 60 };
      const productsWithLowDiscount = [
        { ...mockProducts[0], discountPercentage: 50 }, // Should be skipped
        { ...mockProducts[1], discountPercentage: 70 }, // Should be created
      ];
      mockAmazonPaapiService.searchItems.mockResolvedValue(productsWithLowDiscount);
      mockPendingDealsRepository.findByAsin.mockResolvedValue(null);
      mockPendingDealsRepository.create.mockResolvedValue(mockPendingDeal);

      const result = await service.syncFromAmazon(dtoWithMinDiscount);

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(1);
    });
  });
});
