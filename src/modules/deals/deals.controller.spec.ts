import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { LoggerService } from '../../shared/services/logger.service';
import { Deal } from './entities/deal.entity';

describe('DealsController', () => {
  let controller: DealsController;
  let mockDealsService: any;
  let mockLoggerService: any;

  const mockDeal: Partial<Deal> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Deal',
    description: 'A great test deal',
    price: 50,
    originalPrice: 100,
    discountPercentage: 50,
    imageUrl: 'https://example.com/image.jpg',
    affiliateLink: 'https://amazon.com/dp/B123456?tag=test-20',
    isHot: true,
    isFeatured: false,
    category: 'Electronics',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult = {
    data: [mockDeal],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockDealsService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findHotDeals: jest.fn(),
      findTopDeals: jest.fn(),
      findFeaturedDeals: jest.fn(),
      findActiveDeals: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getCategories: jest.fn(),
    };

    mockLoggerService = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [
        { provide: DealsService, useValue: mockDealsService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<DealsController>(DealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated deals', async () => {
      mockDealsService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll({});

      expect(result).toEqual(mockPaginatedResult);
      expect(mockDealsService.findAll).toHaveBeenCalled();
    });

    it('should pass query parameters as filters', async () => {
      mockDealsService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll({
        page: 2,
        limit: 20,
        category: 'Electronics',
        isHot: true,
      });

      expect(mockDealsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Electronics', isHot: true }),
        expect.objectContaining({ page: 2, limit: 20 }),
        undefined,
      );
    });

    it('should handle sorting parameters', async () => {
      mockDealsService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll({
        sortField: 'price',
        sortOrder: 'ASC',
      });

      expect(mockDealsService.findAll).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({ field: 'price', order: 'ASC' }),
      );
    });
  });

  describe('findTopDeals', () => {
    it('should return top deals with default limit', async () => {
      mockDealsService.findTopDeals.mockResolvedValue([mockDeal]);

      const result = await controller.findTopDeals({});

      expect(result).toEqual([mockDeal]);
      expect(mockDealsService.findTopDeals).toHaveBeenCalledWith(10);
    });

    it('should return top deals with custom limit', async () => {
      mockDealsService.findTopDeals.mockResolvedValue([mockDeal]);

      await controller.findTopDeals({ limit: 5 });

      expect(mockDealsService.findTopDeals).toHaveBeenCalledWith(5);
    });
  });

  describe('findHotDeals', () => {
    it('should return hot deals', async () => {
      mockDealsService.findHotDeals.mockResolvedValue([mockDeal]);

      const result = await controller.findHotDeals({});

      expect(result).toEqual([mockDeal]);
      expect(mockDealsService.findHotDeals).toHaveBeenCalledWith(10);
    });
  });

  describe('findFeaturedDeals', () => {
    it('should return featured deals', async () => {
      const featuredDeal = { ...mockDeal, isFeatured: true };
      mockDealsService.findFeaturedDeals.mockResolvedValue([featuredDeal]);

      const result = await controller.findFeaturedDeals({});

      expect(result).toEqual([featuredDeal]);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const categories = ['Electronics', 'Home', 'Fashion'];
      mockDealsService.getCategories.mockResolvedValue(categories);

      const result = await controller.getCategories();

      expect(result).toEqual(categories);
    });
  });

  describe('findActiveDeals', () => {
    it('should return active deals', async () => {
      mockDealsService.findActiveDeals.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findActiveDeals({});

      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findById', () => {
    it('should return a deal by id', async () => {
      mockDealsService.findById.mockResolvedValue(mockDeal);

      const result = await controller.findById(mockDeal.id!);

      expect(result).toEqual(mockDeal);
      expect(mockDealsService.findById).toHaveBeenCalledWith(mockDeal.id);
    });

    it('should propagate NotFoundException', async () => {
      mockDealsService.findById.mockRejectedValue(
        new NotFoundException('Deal not found'),
      );

      await expect(controller.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
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

    it('should create a new deal', async () => {
      const createdDeal = { ...mockDeal, ...createDealDto };
      mockDealsService.create.mockResolvedValue(createdDeal);

      const result = await controller.create(createDealDto);

      expect(result).toEqual(createdDeal);
      expect(mockDealsService.create).toHaveBeenCalledWith(createDealDto);
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updateData = { price: 40 };
      const updatedDeal = { ...mockDeal, price: 40 };
      mockDealsService.update.mockResolvedValue(updatedDeal);

      const result = await controller.update(mockDeal.id!, updateData);

      expect(result.price).toBe(40);
      expect(mockDealsService.update).toHaveBeenCalledWith(
        mockDeal.id,
        updateData,
      );
    });

    it('should propagate NotFoundException', async () => {
      mockDealsService.update.mockRejectedValue(
        new NotFoundException('Deal not found'),
      );

      await expect(
        controller.update('non-existent-id', { price: 40 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a deal and return success', async () => {
      mockDealsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockDeal.id!);

      expect(result).toEqual({ success: true });
      expect(mockDealsService.delete).toHaveBeenCalledWith(mockDeal.id);
    });

    it('should propagate NotFoundException', async () => {
      mockDealsService.delete.mockRejectedValue(
        new NotFoundException('Deal not found'),
      );

      await expect(controller.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
