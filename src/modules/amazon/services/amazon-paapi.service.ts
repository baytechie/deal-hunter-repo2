import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../shared/services/logger.service';
import {
  AmazonPaapiConfig,
  AmazonProduct,
  AmazonPromotion,
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
        ItemCount: Math.min(params.itemCount || 10, 10), // Amazon max is 10 per request
        Resources: [
          // Item information
          'ItemInfo.Title',
          'ItemInfo.Features',
          // Images
          'Images.Primary.Large',
          // Browse nodes for category info
          'BrowseNodeInfo.BrowseNodes',
          // Offers - comprehensive pricing and promotion data
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Offers.Listings.Promotions',
          'Offers.Listings.Condition',
          'Offers.Listings.Availability.Type',
          'Offers.Listings.MerchantInfo',
          'Offers.Listings.IsBuyBoxWinner',
          // OffersV2 - newer API with better deal details
          'OffersV2.Listings.Price',
          'OffersV2.Listings.SavingBasis',
          'OffersV2.Listings.Promotions',
          'OffersV2.Listings.DealDetails',
          'OffersV2.Listings.Condition',
          'OffersV2.Listings.Availability',
        ],
        ...(params.itemPage && { ItemPage: params.itemPage }), // Pagination (1-10)
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
   * Search for items with pagination support.
   * Amazon PAAPI returns max 10 items per request, so we paginate to get more.
   * Uses ItemPage parameter (1-10) to fetch up to 100 items total.
   */
  async searchItemsWithPagination(
    params: AmazonSearchParams,
    totalItems: number,
  ): Promise<AmazonProduct[]> {
    const allProducts: AmazonProduct[] = [];
    const pagesNeeded = Math.min(Math.ceil(totalItems / 10), 10); // Max 10 pages

    this.logger.log(
      `Fetching ${totalItems} items using ${pagesNeeded} pages`,
      this.context,
    );

    for (let page = 1; page <= pagesNeeded; page++) {
      try {
        this.logger.debug(`Fetching page ${page} of ${pagesNeeded}`, this.context);

        const products = await this.searchItems({
          ...params,
          itemPage: page,
          itemCount: 10, // Always request max per page
        });

        allProducts.push(...products);

        // If we got fewer than 10 items, there are no more results
        if (products.length < 10) {
          this.logger.debug(
            `Page ${page} returned ${products.length} items, stopping pagination`,
            this.context,
          );
          break;
        }

        // Stop if we have enough
        if (allProducts.length >= totalItems) {
          break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch page ${page}: ${error.message}`,
          error.stack,
          this.context,
        );
        // Continue with what we have
        break;
      }
    }

    const result = allProducts.slice(0, totalItems);
    this.logger.log(
      `Pagination complete: fetched ${result.length} items`,
      this.context,
    );

    return result;
  }

  /**
   * Parse Amazon PAAPI search results into our product format
   * Enhanced to extract all available promotion and coupon data
   */
  private parseSearchResults(items: any[], category: string): AmazonProduct[] {
    return items
      .map(item => {
        try {
          // Try OffersV2 first (newer, more reliable), fallback to Offers
          const listingV2 = item.OffersV2?.Listings?.[0];
          const listing = listingV2 || item.Offers?.Listings?.[0];
          if (!listing) return null;

          const price = listing.Price?.Amount || listing.Price?.Money?.Amount || 0;
          const originalPrice = listing.SavingBasis?.Amount || listing.SavingBasis?.Money?.Amount || price;
          const discountPercentage =
            originalPrice > 0 ? ((originalPrice - price) / originalPrice) * 100 : 0;

          // Extract savings information
          const savingsData = listing.Savings || {};
          const savingsAmount = savingsData.Amount || savingsData.Money?.Amount;
          const savingsPercent = savingsData.Percentage;
          const savingBasisType = listing.SavingBasis?.PriceType;

          // Parse all promotions
          const promotions = listing.Promotions || [];
          const parsedPromotions = this.parsePromotions(promotions, item.ASIN);

          // Extract deal details (from OffersV2)
          const dealDetails = listing.DealDetails;
          let dealBadge: string | undefined;
          let dealAccessType: string | undefined;
          let dealStartTime: string | undefined;
          let dealEndTime: string | undefined;
          let dealPercentClaimed: number | undefined;

          if (dealDetails) {
            dealBadge = dealDetails.Badge;
            dealAccessType = dealDetails.AccessType;
            dealStartTime = dealDetails.StartTime;
            dealEndTime = dealDetails.EndTime;
            dealPercentClaimed = dealDetails.PercentClaimed;
            this.logger.debug(
              `Found deal for ${item.ASIN}: Badge=${dealBadge}, Access=${dealAccessType}, End=${dealEndTime}`,
              this.context,
            );
          }

          // Determine promotion flags and extract primary promotion info
          const hasPromotion = parsedPromotions.length > 0 || !!dealDetails;
          const isSubscribeAndSave = parsedPromotions.some(p => p.type === 'SNS' || p.type === 'SubscribeAndSave');
          const isCouponAvailable = parsedPromotions.some(p =>
            p.type === 'Coupon' ||
            p.discountPercent !== undefined ||
            (p.displayAmount && p.displayAmount.toLowerCase().includes('coupon'))
          );

          // Get the primary promotion (prefer coupon, then any other)
          const primaryPromo = parsedPromotions.find(p => p.type === 'Coupon') || parsedPromotions[0];

          // Build display text for promotion
          let promotionDisplayText = this.buildPromotionDisplayText(primaryPromo, dealDetails);

          // If no specific promotion but there's a deal badge, use that
          if (!promotionDisplayText && dealBadge) {
            promotionDisplayText = dealBadge;
          }

          const product: AmazonProduct = {
            asin: item.ASIN,
            title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
            description: item.ItemInfo?.Features?.DisplayValues?.join(' ') || undefined,
            price,
            originalPrice,
            discountPercentage: Number(discountPercentage.toFixed(2)),
            imageUrl: item.Images?.Primary?.Large?.URL || undefined,
            productUrl: item.DetailPageURL,
            category,
            // Deal details
            dealBadge,
            dealAccessType,
            dealStartTime,
            dealEndTime,
            dealPercentClaimed,
            // Promotion flags and data
            hasPromotion,
            promotionType: primaryPromo?.type,
            promotionAmount: primaryPromo?.amount,
            promotionPercent: primaryPromo?.discountPercent,
            promotionDisplayText,
            isSubscribeAndSave,
            isCouponAvailable,
            allPromotions: parsedPromotions.length > 0 ? parsedPromotions : undefined,
            // Savings info
            savingBasisType,
            savingsAmount,
            savingsPercent,
          };

          // Log comprehensive promotion info for debugging
          if (hasPromotion) {
            this.logger.log(
              `Product ${item.ASIN} promotions: ` +
              `hasPromo=${hasPromotion}, coupon=${isCouponAvailable}, SNS=${isSubscribeAndSave}, ` +
              `display="${promotionDisplayText}", badge="${dealBadge}"`,
              this.context,
            );
          }

          return product;
        } catch (error) {
          this.logger.warn(`Failed to parse item: ${error.message}`, this.context);
          return null;
        }
      })
      .filter((product): product is AmazonProduct => product !== null);
  }

  /**
   * Parse promotion objects from Amazon API response
   */
  private parsePromotions(promotions: any[], asin: string): AmazonPromotion[] {
    if (!promotions || promotions.length === 0) return [];

    const parsed: AmazonPromotion[] = [];

    for (const promo of promotions) {
      try {
        const promotion: AmazonPromotion = {
          type: promo.Type,
          amount: promo.Amount || promo.Money?.Amount,
          currency: promo.Currency || promo.Money?.Currency,
          discountPercent: promo.DiscountPercent,
          pricePerUnit: promo.PricePerUnit,
          displayAmount: promo.DisplayAmount,
        };

        // Log raw promotion data for analysis
        this.logger.debug(
          `Raw promotion for ${asin}: ${JSON.stringify(promo)}`,
          this.context,
        );

        parsed.push(promotion);
      } catch (error) {
        this.logger.warn(`Failed to parse promotion for ${asin}: ${error.message}`, this.context);
      }
    }

    return parsed;
  }

  /**
   * Build human-readable promotion display text
   */
  private buildPromotionDisplayText(
    promo: AmazonPromotion | undefined,
    dealDetails: any,
  ): string | undefined {
    if (!promo && !dealDetails) return undefined;

    const parts: string[] = [];

    // Handle promotion data
    if (promo) {
      // If we have a pre-formatted display amount, use it
      if (promo.displayAmount) {
        parts.push(promo.displayAmount);
      } else if (promo.discountPercent) {
        parts.push(`${promo.discountPercent}% off coupon`);
      } else if (promo.amount) {
        const currency = promo.currency || 'USD';
        const symbol = currency === 'USD' ? '$' : currency;
        parts.push(`${symbol}${promo.amount.toFixed(2)} off`);
      }

      // Add promotion type info
      if (promo.type === 'SNS' || promo.type === 'SubscribeAndSave') {
        parts.push('with Subscribe & Save');
      }
    }

    // Add deal badge if present
    if (dealDetails?.Badge && !parts.some(p => p.includes(dealDetails.Badge))) {
      parts.push(dealDetails.Badge);
    }

    // Add Prime exclusivity info
    if (dealDetails?.AccessType === 'PRIME_EXCLUSIVE') {
      parts.push('(Prime Exclusive)');
    } else if (dealDetails?.AccessType === 'PRIME_EARLY_ACCESS') {
      parts.push('(Prime Early Access)');
    }

    return parts.length > 0 ? parts.join(' - ') : undefined;
  }

  /**
   * Generate mock products for testing when PAAPI is not configured
   * Enhanced with promotion data to simulate real API responses
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

    const dealBadges = [
      'Limited Time Deal',
      'Deal of the Day',
      'Lightning Deal',
      'Black Friday Deal',
      undefined,
      undefined,
    ];

    for (let i = 0; i < count; i++) {
      const originalPrice = 50 + Math.random() * 150;
      const discountPercent = Math.max(minDiscount, 15 + Math.random() * 50);
      const price = originalPrice * (1 - discountPercent / 100);

      // Randomly assign promotions
      const hasCoupon = Math.random() > 0.5;
      const couponPercent = hasCoupon ? Math.floor(5 + Math.random() * 20) : undefined;
      const hasSubscribeAndSave = Math.random() > 0.7;
      const dealBadge = dealBadges[Math.floor(Math.random() * dealBadges.length)];

      const hasPromotion = hasCoupon || hasSubscribeAndSave || !!dealBadge;

      // Build promotion display text
      let promotionDisplayText: string | undefined;
      if (couponPercent) {
        promotionDisplayText = `${couponPercent}% off coupon`;
      } else if (hasSubscribeAndSave) {
        promotionDisplayText = 'Save 5% with Subscribe & Save';
      } else if (dealBadge) {
        promotionDisplayText = dealBadge;
      }

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
        // Deal information
        dealBadge,
        dealAccessType: Math.random() > 0.8 ? 'PRIME_EXCLUSIVE' : 'ALL',
        dealEndTime: dealBadge ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        // Promotion data
        hasPromotion,
        promotionType: hasCoupon ? 'Coupon' : (hasSubscribeAndSave ? 'SNS' : undefined),
        promotionPercent: couponPercent,
        promotionDisplayText,
        isSubscribeAndSave: hasSubscribeAndSave,
        isCouponAvailable: hasCoupon,
        // Savings
        savingsAmount: Number((originalPrice - price).toFixed(2)),
        savingsPercent: Number(discountPercent.toFixed(2)),
      });
    }

    this.logger.log(`Generated ${mockProducts.length} mock products with promotion data`, this.context);
    return mockProducts;
  }
}
