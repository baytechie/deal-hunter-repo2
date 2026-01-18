import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../shared/services/logger.service';
import {
  AmazonPaapiConfig,
  AmazonProduct,
  AmazonSearchParams,
  CATEGORY_TO_SEARCH_INDEX,
} from '../interfaces/amazon-config.interface';

/**
 * AmazonPaapiService handles Amazon Product Advertising API calls.
 * Uses the amazon-paapi npm package for AWS4 signing.
 */
@Injectable()
export class AmazonPaapiService implements OnModuleInit {
  private readonly context = 'AmazonPaapiService';
  private config: AmazonPaapiConfig | null = null;
  private amazonPaapi: any;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.loadConfiguration();
  }

  /**
   * Load and validate Amazon PAAPI configuration from environment
   */
  private async loadConfiguration(): Promise<void> {
    const accessKey = this.configService.get<string>('AMAZON_PAAPI_ACCESS_KEY');
    const secretKey = this.configService.get<string>('AMAZON_PAAPI_SECRET_KEY');
    const partnerTag = this.configService.get<string>('AMAZON_PARTNER_TAG');
    const marketplace = this.configService.get<string>('AMAZON_MARKETPLACE', 'www.amazon.com');

    if (!accessKey || !secretKey || !partnerTag) {
      this.logger.warn(
        'Amazon PAAPI credentials not configured. Sync will return mock data.',
        this.context,
      );
      return;
    }

    this.config = {
      accessKey,
      secretKey,
      partnerTag,
      marketplace,
    };

    try {
      this.amazonPaapi = await import('amazon-paapi');
      this.logger.log('Amazon PAAPI configuration loaded successfully', this.context);
    } catch (error) {
      this.logger.error(`Failed to load amazon-paapi module: ${error.message}`, error.stack, this.context);
    }
  }

  /**
   * Validate that PAAPI is configured
   */
  isConfigured(): boolean {
    return this.config !== null && this.amazonPaapi !== null;
  }

  /**
   * Rate limit enforcement - wait if needed
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      this.logger.debug(`Rate limiting: waiting ${waitTime}ms`, this.context);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Search for items using Amazon PAAPI.
   * Returns mock data if not configured.
   */
  async searchItems(params: AmazonSearchParams): Promise<AmazonProduct[]> {
    this.logger.log(`Searching Amazon PAAPI with params: ${JSON.stringify(params)}`, this.context);

    if (!this.isConfigured()) {
      this.logger.warn('PAAPI not configured, returning mock data', this.context);
      return this.getMockProducts(params);
    }

    await this.enforceRateLimit();

    try {
      const searchIndex = params.category
        ? CATEGORY_TO_SEARCH_INDEX[params.category] || 'All'
        : 'All';

      const commonParameters = {
        AccessKey: this.config!.accessKey,
        SecretKey: this.config!.secretKey,
        PartnerTag: this.config!.partnerTag,
        PartnerType: 'Associates',
        Marketplace: this.config!.marketplace,
      };

      const requestParameters = {
        Keywords: params.keywords || 'deals',
        SearchIndex: searchIndex,
        ItemCount: params.itemCount || 10,
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Images.Primary.Large',
          'BrowseNodeInfo.BrowseNodes',
        ],
        ...(params.minPrice && { MinPrice: params.minPrice * 100 }), // Convert to cents
        ...(params.maxPrice && { MaxPrice: params.maxPrice * 100 }),
        ...(params.minSavingPercent && { MinSavingPercent: params.minSavingPercent }),
        ...(params.sortBy && { SortBy: params.sortBy }),
      };

      const response = await this.amazonPaapi.SearchItems(commonParameters, requestParameters);

      if (!response.SearchResult?.Items) {
        this.logger.warn('No items found in PAAPI response', this.context);
        return [];
      }

      const products = this.parseSearchResults(response.SearchResult.Items, params.category || 'General');
      this.logger.log(`Found ${products.length} products from Amazon PAAPI`, this.context);

      return products;
    } catch (error) {
      this.logger.error(`PAAPI search failed: ${error.message}`, error.stack, this.context);

      // Retry logic with exponential backoff
      if (error.message?.includes('TooManyRequests')) {
        this.logger.warn('Rate limited by Amazon, returning empty results', this.context);
        return [];
      }

      throw error;
    }
  }

  /**
   * Parse Amazon PAAPI search results into our product format
   */
  private parseSearchResults(items: any[], category: string): AmazonProduct[] {
    return items
      .map(item => {
        try {
          const listing = item.Offers?.Listings?.[0];
          if (!listing) return null;

          const price = listing.Price?.Amount || 0;
          const originalPrice = listing.SavingBasis?.Amount || price;
          const discountPercentage =
            originalPrice > 0 ? ((originalPrice - price) / originalPrice) * 100 : 0;

          return {
            asin: item.ASIN,
            title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
            description: item.ItemInfo?.Features?.DisplayValues?.join(' ') || null,
            price,
            originalPrice,
            discountPercentage: Number(discountPercentage.toFixed(2)),
            imageUrl: item.Images?.Primary?.Large?.URL || null,
            productUrl: item.DetailPageURL,
            category,
          } as AmazonProduct;
        } catch (error) {
          this.logger.warn(`Failed to parse item: ${error.message}`, this.context);
          return null;
        }
      })
      .filter((product): product is AmazonProduct => product !== null);
  }

  /**
   * Generate mock products for testing when PAAPI is not configured
   */
  private getMockProducts(params: AmazonSearchParams): AmazonProduct[] {
    const category = params.category || 'Electronics';
    const count = params.itemCount || 10;
    const minDiscount = params.minSavingPercent || 0;

    const mockProducts: AmazonProduct[] = [];

    const productNames = [
      'Wireless Bluetooth Headphones',
      'Smart Watch Fitness Tracker',
      'Portable Power Bank 20000mAh',
      'USB-C Hub Adapter',
      'Mechanical Gaming Keyboard',
      'Wireless Mouse Ergonomic',
      'LED Desk Lamp',
      'Phone Stand Holder',
      'HDMI Cable 4K',
      'Webcam 1080p HD',
    ];

    for (let i = 0; i < count; i++) {
      const originalPrice = 50 + Math.random() * 150;
      const discountPercent = Math.max(minDiscount, 15 + Math.random() * 50);
      const price = originalPrice * (1 - discountPercent / 100);

      mockProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        title: productNames[i % productNames.length] + ` - Model ${i + 1}`,
        description: `High quality ${category.toLowerCase()} product with excellent features and great value.`,
        price: Number(price.toFixed(2)),
        originalPrice: Number(originalPrice.toFixed(2)),
        discountPercentage: Number(discountPercent.toFixed(2)),
        imageUrl: `https://via.placeholder.com/300x300?text=${encodeURIComponent(productNames[i % productNames.length])}`,
        productUrl: `https://www.amazon.com/dp/B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        category,
      });
    }

    this.logger.log(`Generated ${mockProducts.length} mock products`, this.context);
    return mockProducts;
  }
}
