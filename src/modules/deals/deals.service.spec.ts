import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DEALS_REPOSITORY } from './repositories/deals.repository.interface';
import { LoggerService } from '../../shared/services/logger.service';
import { AffiliateService } from './services/affiliate.service';
import { Deal } from './entities/deal.entity';

describe('DealsService', () => {
  let service: DealsService;
  let mockDealsRepository: any;
  let mockLoggerService: any;
  let mockAffiliateService: any;

  const mockDeal: Deal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Deal',
    description: 'A great test deal',
    price: 50,
    originalPrice: 100,
    discountPercentage: 50,
    imageUrl: 'https://example.com/image.jpg',
    affiliateLink: 'https://amazon.com/dp/B123456?tag=test-20',
    expiryDate: new Date('2027-12-31'),
    isHot: true,
    isFeatured: false,
    category: 'Electronics',
    asin: 'B123456',
    pendingDealId: null,
    couponCode: 'SAVE50',
    promoDescription: 'Limited time offer',
    createdAt: new Date(),
    updatedAt: new Date(),
    calculateDiscountPercentage: jest.fn(),
  };

  const mockDeals: Deal[] = [
    mockDeal,
    {
      ...mockDeal,
      id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Test Deal 2',
      price: 75,
      originalPrice: 150,
      discountPercentage: 50,
      calculateDiscountPercentage: jest.fn(),
    },
  ];

  beforeEach(async () => {
    mockDealsRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findHotDeals: jest.fn(),
      findTopDeals: jest.fn(),
      findFeaturedDeals: jest.fn(),
      findActiveDeals: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
      getCategories: jest.fn(),
    };

    mockLoggerService = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockAffiliateService = {
      sanitizeAffiliateUrl: jest.fn((url) => url),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: DEALS_REPOSITORY, useValue: mockDealsRepository },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: AffiliateService, useValue: mockAffiliateService },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated deals', async () => {
      const paginatedResult = {
        data: mockDeals,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockDealsRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll();

      expect(result).toEqual(paginatedResult);
      expect(mockDealsRepository.findAll).toHaveBeenCalled();
    });

    it('should pass filters to repository', async () => {
      const filters = { category: 'Electronics', isHot: true };
      const pagination = { page: 1, limit: 10 };
      const sorting = { field: 'price', order: 'ASC' as const };

      mockDealsRepository.findAll.mockResolvedValue({
        data: [mockDeal],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await service.findAll(filters, pagination, sorting);

      expect(mockDealsRepository.findAll).toHaveBeenCalledWith(
        filters,
        pagination,
        sorting,
      );
    });
  });

  describe('findById', () => {
    it('should return a deal when found', async () => {
      mockDealsRepository.findById.mockResolvedValue(mockDeal);

      const result = await service.findById(mockDeal.id);

      expect(result).toEqual(mockDeal);
      expect(mockDealsRepository.findById).toHaveBeenCalledWith(mockDeal.id);
    });

    it('should throw NotFoundException when deal not found', async () => {
      mockDealsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findHotDeals', () => {
    it('should return hot deals', async () => {
      const hotDeals = [mockDeal];
      mockDealsRepository.findHotDeals.mockResolvedValue(hotDeals);

      const result = await service.findHotDeals(5);

      expect(result).toEqual(hotDeals);
      expect(mockDealsRepository.findHotDeals).toHaveBeenCalledWith(5);
    });
  });

  describe('findTopDeals', () => {
    it('should return top deals sorted by discount', async () => {
      mockDealsRepository.findTopDeals.mockResolvedValue(mockDeals);

      const result = await service.findTopDeals(10);

      expect(result).toEqual(mockDeals);
      expect(mockDealsRepository.findTopDeals).toHaveBeenCalledWith(10);
    });
  });

  describe('findFeaturedDeals', () => {
    it('should return featured deals', async () => {
      mockDealsRepository.findFeaturedDeals.mockResolvedValue([mockDeal]);

      const result = await service.findFeaturedDeals();

      expect(result).toEqual([mockDeal]);
    });
  });

  describe('create', () => {
    const createDealDto = {
      title: 'New Deal',
      description: 'A new deal',
      price: 30,
      originalPrice: 60,
      imageUrl: 'https://example.com/new.jpg',
      affiliateLink: 'https://amazon.com/dp/NEW123',
      category: 'Home',
      isHot: false,
      isFeatured: false,
    };

    it('should create a deal with calculated discount', async () => {
      const createdDeal = {
        ...mockDeal,
        ...createDealDto,
        discountPercentage: 50,
      };
      mockDealsRepository.create.mockResolvedValue(createdDeal);

      const result = await service.create(createDealDto);

      expect(result).toEqual(createdDeal);
      expect(mockDealsRepository.create).toHaveBeenCalled();
      expect(mockAffiliateService.sanitizeAffiliateUrl).toHaveBeenCalledWith(
        createDealDto.affiliateLink,
      );
    });

    it('should warn when price exceeds original price', async () => {
      const badDto = { ...createDealDto, price: 100, originalPrice: 50 };
      mockDealsRepository.create.mockResolvedValue({ ...mockDeal, ...badDto });

      await service.create(badDto);

      expect(mockLoggerService.warn).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updateData = { price: 40 };
      const updatedDeal = { ...mockDeal, price: 40, discountPercentage: 60 };

      mockDealsRepository.findById.mockResolvedValue(mockDeal);
      mockDealsRepository.update.mockResolvedValue(updatedDeal);

      const result = await service.update(mockDeal.id, updateData);

      expect(result.price).toBe(40);
      expect(mockDealsRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deal not found', async () => {
      mockDealsRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { price: 40 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should recalculate discount when prices change', async () => {
      mockDealsRepository.findById.mockResolvedValue(mockDeal);
      mockDealsRepository.update.mockResolvedValue({
        ...mockDeal,
        price: 25,
        discountPercentage: 75,
      });

      await service.update(mockDeal.id, { price: 25 });

      const updateCall = mockDealsRepository.update.mock.calls[0][1];
      expect(updateCall.discountPercentage).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a deal', async () => {
      mockDealsRepository.delete.mockResolvedValue(true);

      await service.delete(mockDeal.id);

      expect(mockDealsRepository.delete).toHaveBeenCalledWith(mockDeal.id);
    });

    it('should throw NotFoundException when deal not found', async () => {
      mockDealsRepository.delete.mockResolvedValue(false);

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all deals and return count', async () => {
      mockDealsRepository.clearAll.mockResolvedValue(10);

      const result = await service.clearAll();

      expect(result).toBe(10);
      expect(mockLoggerService.warn).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const categories = ['Electronics', 'Home', 'Fashion'];
      mockDealsRepository.getCategories.mockResolvedValue(categories);

      const result = await service.getCategories();

      expect(result).toEqual(categories);
    });
  });

  describe('calculateDiscountPercentage', () => {
    it('should calculate correct discount percentage', () => {
      expect(service.calculateDiscountPercentage(100, 50)).toBe(50);
      expect(service.calculateDiscountPercentage(200, 50)).toBe(75);
      expect(service.calculateDiscountPercentage(100, 100)).toBe(0);
    });

    it('should return 0 for invalid original price', () => {
      expect(service.calculateDiscountPercentage(0, 50)).toBe(0);
      expect(service.calculateDiscountPercentage(-100, 50)).toBe(0);
    });

    it('should return 100 for negative current price', () => {
      expect(service.calculateDiscountPercentage(100, -10)).toBe(100);
    });

    it('should return 0 when current price >= original price', () => {
      expect(service.calculateDiscountPercentage(50, 100)).toBe(0);
      expect(service.calculateDiscountPercentage(50, 50)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(service.calculateDiscountPercentage(100, 33)).toBe(67);
      expect(service.calculateDiscountPercentage(100, 33.33)).toBe(66.67);
    });
  });

  describe('isDealExpired', () => {
    it('should return false when no expiry date', () => {
      const dealWithoutExpiry = { ...mockDeal, expiryDate: null };
      expect(service.isDealExpired(dealWithoutExpiry as Deal)).toBe(false);
    });

    it('should return true when deal is expired', () => {
      const expiredDeal = {
        ...mockDeal,
        expiryDate: new Date('2020-01-01'),
      };
      expect(service.isDealExpired(expiredDeal as Deal)).toBe(true);
    });

    it('should return false when deal is not expired', () => {
      const futureDeal = {
        ...mockDeal,
        expiryDate: new Date('2099-12-31'),
      };
      expect(service.isDealExpired(futureDeal as Deal)).toBe(false);
    });
  });

  describe('getDealSavings', () => {
    it('should calculate correct savings amount', () => {
      expect(service.getDealSavings(mockDeal as Deal)).toBe(50);
    });

    it('should handle decimal prices', () => {
      const dealWithDecimals = {
        ...mockDeal,
        originalPrice: 99.99,
        price: 49.99,
      };
      expect(service.getDealSavings(dealWithDecimals as Deal)).toBe(50);
    });
  });

  describe('findActiveDeals', () => {
    it('should return active deals', async () => {
      const paginatedResult = {
        data: [mockDeal],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockDealsRepository.findActiveDeals.mockResolvedValue(paginatedResult);

      const result = await service.findActiveDeals();

      expect(result).toEqual(paginatedResult);
      expect(mockDealsRepository.findActiveDeals).toHaveBeenCalled();
    });
  });
});
