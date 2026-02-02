import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RssFeedDeal } from '../entities/rss-feed-deal.entity';
import { RssFeedSource } from '../entities/rss-feed-source.entity';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Sample RSS feed deals for demonstration and testing
 * These are used when crawling fails or for initial data
 */
const SAMPLE_RSS_DEALS = [
  {
    title: 'Apple AirPods Pro 2nd Gen USB-C - Save $50',
    description: 'Active Noise Cancellation, Transparency mode, Personalized Spatial Audio. Best price we\'ve seen!',
    link: 'https://slickdeals.net/f/sample-airpods-pro',
    guid: 'sample-airpods-pro-001',
    imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
    price: 199.99,
    originalPrice: 249.99,
    discountPercentage: 20,
    store: 'Amazon',
    category: 'Electronics',
    isHot: true,
    isFeatured: true,
  },
  {
    title: 'Samsung 65" OLED 4K Smart TV - Lowest Price Ever',
    description: 'Quantum HDR OLED display, Neural Quantum Processor, Object Tracking Sound+. Amazing for gaming and movies.',
    link: 'https://slickdeals.net/f/sample-samsung-tv',
    guid: 'sample-samsung-tv-001',
    imageUrl: 'https://m.media-amazon.com/images/I/71LJJrKbezL._AC_SL1500_.jpg',
    price: 1299.99,
    originalPrice: 2299.99,
    discountPercentage: 43,
    store: 'Best Buy',
    category: 'Electronics',
    isHot: true,
    isFeatured: false,
  },
  {
    title: 'Ninja Foodi 9-in-1 Pressure Cooker & Air Fryer',
    description: 'TenderCrisp Technology lets you pressure cook and air fry all in one pot. 6.5-quart capacity.',
    link: 'https://slickdeals.net/f/sample-ninja-foodi',
    guid: 'sample-ninja-foodi-001',
    imageUrl: 'https://m.media-amazon.com/images/I/81c+9BOQNWL._AC_SL1500_.jpg',
    price: 129.99,
    originalPrice: 229.99,
    discountPercentage: 43,
    store: 'Target',
    category: 'Home & Kitchen',
    isHot: true,
    isFeatured: true,
  },
  {
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation, 30-hour battery, multipoint connection. Best headphones for travel.',
    link: 'https://slickdeals.net/f/sample-sony-headphones',
    guid: 'sample-sony-headphones-001',
    imageUrl: 'https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg',
    price: 278.00,
    originalPrice: 399.99,
    discountPercentage: 31,
    store: 'Amazon',
    category: 'Electronics',
    isHot: false,
    isFeatured: true,
  },
  {
    title: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Laser reveals microscopic dust, LCD screen shows proof of deep clean. Up to 60 minutes of run time.',
    link: 'https://slickdeals.net/f/sample-dyson-vacuum',
    guid: 'sample-dyson-vacuum-001',
    imageUrl: 'https://m.media-amazon.com/images/I/61QRgOaVqcL._AC_SL1500_.jpg',
    price: 549.99,
    originalPrice: 749.99,
    discountPercentage: 27,
    store: 'Dyson',
    category: 'Home & Kitchen',
    isHot: false,
    isFeatured: true,
  },
  {
    title: 'Apple Watch Series 9 GPS 41mm - Price Drop',
    description: 'Double tap gesture, brighter Always-On Retina display, S9 SiP chip with powerful on-device Siri.',
    link: 'https://slickdeals.net/f/sample-apple-watch',
    guid: 'sample-apple-watch-001',
    imageUrl: 'https://m.media-amazon.com/images/I/71hBX1FuS5L._AC_SL1500_.jpg',
    price: 329.00,
    originalPrice: 399.00,
    discountPercentage: 18,
    store: 'Walmart',
    category: 'Electronics',
    isHot: true,
    isFeatured: false,
  },
  {
    title: 'Instant Pot Duo Plus 6-Quart',
    description: '9-in-1 electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.',
    link: 'https://slickdeals.net/f/sample-instant-pot',
    guid: 'sample-instant-pot-001',
    imageUrl: 'https://m.media-amazon.com/images/I/71V1LyfHow.jpg',
    price: 79.95,
    originalPrice: 129.95,
    discountPercentage: 38,
    store: 'Amazon',
    category: 'Home & Kitchen',
    isHot: true,
    isFeatured: false,
  },
  {
    title: 'Nike Air Max 270 Men\'s Running Shoes - Extra 20% Off',
    description: 'Max Air unit for cushioning, breathable mesh upper, rubber outsole for traction. Multiple colors available.',
    link: 'https://dealnews.com/f/sample-nike-airmax',
    guid: 'sample-nike-airmax-001',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtdnqxniqqk0wpgf/air-max-270-shoes-2V5C4p.png',
    price: 99.97,
    originalPrice: 159.99,
    discountPercentage: 38,
    store: 'Nike',
    category: 'Fashion',
    isHot: false,
    isFeatured: false,
    couponCode: 'SAVE20',
  },
  {
    title: 'KitchenAid Stand Mixer Artisan Series',
    description: '5-quart stainless steel bowl, 10 speeds, includes flat beater, dough hook, and wire whip.',
    link: 'https://techbargains.com/f/sample-kitchenaid',
    guid: 'sample-kitchenaid-001',
    imageUrl: 'https://m.media-amazon.com/images/I/71nZKp1SdgL._AC_SL1500_.jpg',
    price: 279.99,
    originalPrice: 449.99,
    discountPercentage: 38,
    store: 'Target',
    category: 'Home & Kitchen',
    isHot: true,
    isFeatured: true,
  },
  {
    title: 'LG 27" 4K UHD Monitor with USB-C',
    description: 'IPS display, HDR10, USB-C with 60W Power Delivery, AMD FreeSync. Great for productivity.',
    link: 'https://techbargains.com/f/sample-lg-monitor',
    guid: 'sample-lg-monitor-001',
    imageUrl: 'https://m.media-amazon.com/images/I/71p-M4BLCoL._AC_SL1500_.jpg',
    price: 246.99,
    originalPrice: 349.99,
    discountPercentage: 29,
    store: 'Amazon',
    category: 'Electronics',
    isHot: false,
    isFeatured: false,
  },
  {
    title: 'Bose QuietComfort Ultra Earbuds',
    description: 'World-class noise cancellation, immersive audio, CustomTune technology. Up to 6 hours battery.',
    link: 'https://bensbargains.com/f/sample-bose-earbuds',
    guid: 'sample-bose-earbuds-001',
    imageUrl: 'https://m.media-amazon.com/images/I/61f1YfTkTDL._AC_SL1500_.jpg',
    price: 249.00,
    originalPrice: 299.00,
    discountPercentage: 17,
    store: 'Best Buy',
    category: 'Electronics',
    isHot: false,
    isFeatured: true,
  },
  {
    title: 'iRobot Roomba i3+ EVO Self-Emptying Robot Vacuum',
    description: 'Self-emptying base, smart mapping, ideal for pet hair. Works with Alexa and Google Assistant.',
    link: 'https://hip2save.com/f/sample-roomba',
    guid: 'sample-roomba-001',
    imageUrl: 'https://m.media-amazon.com/images/I/61X2Te+8pUL._AC_SL1500_.jpg',
    price: 349.99,
    originalPrice: 549.99,
    discountPercentage: 36,
    store: 'Amazon',
    category: 'Home & Kitchen',
    isHot: true,
    isFeatured: false,
  },
  {
    title: 'PlayStation 5 Console Marvel\'s Spider-Man 2 Bundle',
    description: 'Includes PS5 console and Marvel\'s Spider-Man 2 game. Limited availability!',
    link: 'https://slickdeals.net/f/sample-ps5-bundle',
    guid: 'sample-ps5-bundle-001',
    imageUrl: 'https://m.media-amazon.com/images/I/519OB0WV-AL._SL1500_.jpg',
    price: 499.99,
    originalPrice: 559.99,
    discountPercentage: 11,
    store: 'GameStop',
    category: 'Gaming',
    isHot: true,
    isFeatured: true,
  },
  {
    title: 'Levi\'s Men\'s 501 Original Fit Jeans',
    description: 'The iconic straight fit jean. Button fly, sits at waist. Classic American style since 1873.',
    link: 'https://retailmenot.com/f/sample-levis',
    guid: 'sample-levis-001',
    imageUrl: 'https://m.media-amazon.com/images/I/814tQY9BMhL._AC_UY879_.jpg',
    price: 39.99,
    originalPrice: 69.50,
    discountPercentage: 42,
    store: 'Amazon',
    category: 'Fashion',
    isHot: false,
    isFeatured: false,
    couponCode: 'DENIM40',
  },
  {
    title: 'Anker PowerCore 26800mAh Portable Charger',
    description: 'High capacity power bank with 3 USB ports. Charge 3 devices at once. Includes travel pouch.',
    link: 'https://dealnews.com/f/sample-anker-powerbank',
    guid: 'sample-anker-powerbank-001',
    imageUrl: 'https://m.media-amazon.com/images/I/61xHkSLynLL._AC_SL1500_.jpg',
    price: 45.99,
    originalPrice: 65.99,
    discountPercentage: 30,
    store: 'Amazon',
    category: 'Electronics',
    isHot: false,
    isFeatured: false,
  },
];

/**
 * RssDealsSeedService - Seeds the database with sample RSS feed deals
 *
 * This is useful when:
 * - Network crawling fails
 * - Testing the application
 * - Demonstrating the RSS feed feature
 */
@Injectable()
export class RssDealsSeedService {
  private readonly context = 'RssDealsSeedService';

  constructor(
    @InjectRepository(RssFeedDeal)
    private readonly dealRepository: Repository<RssFeedDeal>,
    @InjectRepository(RssFeedSource)
    private readonly sourceRepository: Repository<RssFeedSource>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Seed sample RSS deals if none exist
   * Links deals to the first available source
   */
  async seedSampleDeals(): Promise<number> {
    // Check if any deals exist
    const existingCount = await this.dealRepository.count();
    if (existingCount > 0) {
      this.logger.log(`${existingCount} RSS deals already exist, skipping seed`, this.context);
      return 0;
    }

    // Get the first active source to link deals to
    const source = await this.sourceRepository.findOne({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });

    if (!source) {
      this.logger.warn('No active RSS sources found, cannot seed deals', this.context);
      return 0;
    }

    this.logger.log(`Seeding ${SAMPLE_RSS_DEALS.length} sample RSS deals...`, this.context);

    let seededCount = 0;
    const now = new Date();

    for (const dealData of SAMPLE_RSS_DEALS) {
      try {
        // Randomize publishedAt within the last 7 days
        const randomDays = Math.floor(Math.random() * 7);
        const randomHours = Math.floor(Math.random() * 24);
        const publishedAt = new Date(now);
        publishedAt.setDate(publishedAt.getDate() - randomDays);
        publishedAt.setHours(publishedAt.getHours() - randomHours);

        const deal = this.dealRepository.create({
          ...dealData,
          sourceId: source.id,
          publishedAt,
          viewCount: Math.floor(Math.random() * 500) + 50,
          clickCount: Math.floor(Math.random() * 100) + 10,
        });

        await this.dealRepository.save(deal);
        seededCount++;
      } catch (error) {
        this.logger.warn(`Failed to seed deal: ${dealData.title} - ${error.message}`, this.context);
      }
    }

    this.logger.log(`Successfully seeded ${seededCount} sample RSS deals`, this.context);
    return seededCount;
  }
}
