import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../shared/services/logger.service';
import { RssFeedSource } from '../entities/rss-feed-source.entity';
import * as Parser from 'rss-parser';
import { createHash } from 'crypto';

/**
 * Parsed RSS item from feed
 */
export interface ParsedRssItem {
  title: string;
  description?: string;
  link: string;
  guid: string;
  imageUrl?: string;
  publishedAt?: Date;
  category?: string;
  price?: number;
  originalPrice?: number;
  store?: string;
  couponCode?: string;
}

/**
 * Crawl result for a single feed source
 */
export interface CrawlResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  itemsCrawled: number;
  newItems: number;
  errors: string[];
}

/**
 * RssCrawlerService - Handles fetching and parsing RSS feeds
 *
 * Responsible for:
 * - Fetching RSS feeds from configured sources
 * - Parsing feed content into normalized deal objects
 * - Extracting price, discount, and deal information from feed items
 */
@Injectable()
export class RssCrawlerService {
  private readonly parser: Parser;
  private readonly context = 'RssCrawlerService';

  constructor(private readonly logger: LoggerService) {
    this.parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
          ['enclosure', 'enclosure'],
          ['dc:creator', 'creator'],
          ['content:encoded', 'contentEncoded'],
        ],
      },
      timeout: 30000,
    });
  }

  /**
   * Fetch and parse RSS feed from a source URL
   */
  async fetchFeed(source: RssFeedSource): Promise<ParsedRssItem[]> {
    this.logger.log(`Fetching RSS feed: ${source.name} - url: ${source.url}`, this.context);

    try {
      const feed = await this.parser.parseURL(source.url);
      const items: ParsedRssItem[] = [];

      for (const item of feed.items || []) {
        try {
          const parsedItem = this.parseItem(item, source);
          if (parsedItem) {
            items.push(parsedItem);
          }
        } catch (parseError) {
          this.logger.warn(
            `Failed to parse item in feed ${source.name}: ${parseError.message} - title: ${item.title}`,
            this.context,
          );
        }
      }

      this.logger.log(`Successfully parsed ${items.length} items from ${source.name}`, this.context);
      return items;
    } catch (error) {
      this.logger.error(
        `Failed to fetch feed ${source.name}: ${error.message}`,
        error.stack,
        this.context,
      );
      throw error;
    }
  }

  /**
   * Parse a single RSS item into a normalized deal format
   */
  private parseItem(item: Parser.Item & Record<string, unknown>, source: RssFeedSource): ParsedRssItem | null {
    if (!item.title || !item.link) {
      return null;
    }

    // Generate a unique GUID from link if not provided
    const guid = item.guid || this.generateGuid(item.link);

    // Extract image URL from various possible locations
    const imageUrl = this.extractImageUrl(item);

    // Try to extract price information from title/description
    const priceInfo = this.extractPriceInfo(item.title, item.contentSnippet || item.content || '');

    // Try to extract coupon code
    const couponCode = this.extractCouponCode(item.title, item.contentSnippet || item.content || '');

    // Try to extract store name
    const store = this.extractStore(item.title, item.contentSnippet || item.content || '');

    return {
      title: this.cleanText(item.title),
      description: this.cleanText(item.contentSnippet || item.content || item.summary || ''),
      link: item.link,
      guid,
      imageUrl,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: source.category,
      price: priceInfo.price,
      originalPrice: priceInfo.originalPrice,
      store,
      couponCode,
    };
  }

  /**
   * Extract image URL from various RSS feed formats
   */
  private extractImageUrl(item: Record<string, unknown>): string | undefined {
    // Check media:content
    if (item.mediaContent && typeof item.mediaContent === 'object') {
      const media = item.mediaContent as Record<string, unknown>;
      if (media.$ && typeof media.$ === 'object') {
        const attrs = media.$ as Record<string, string>;
        if (attrs.url) return attrs.url;
      }
    }

    // Check media:thumbnail
    if (item.mediaThumbnail && typeof item.mediaThumbnail === 'object') {
      const thumbnail = item.mediaThumbnail as Record<string, unknown>;
      if (thumbnail.$ && typeof thumbnail.$ === 'object') {
        const attrs = thumbnail.$ as Record<string, string>;
        if (attrs.url) return attrs.url;
      }
    }

    // Check enclosure
    if (item.enclosure && typeof item.enclosure === 'object') {
      const enclosure = item.enclosure as Record<string, unknown>;
      const type = enclosure.type as string | undefined;
      const url = enclosure.url as string | undefined;
      if (type?.startsWith('image/') && url) {
        return url;
      }
    }

    // Try to extract from content/description using regex
    const content = (item.content || item.contentEncoded || item.description || '') as string;
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Extract price information from text
   * Looks for patterns like "$29.99", "was $50, now $30", "$19.99 (reg. $39.99)"
   */
  private extractPriceInfo(title: string, description: string): { price?: number; originalPrice?: number } {
    const text = `${title} ${description}`;
    const result: { price?: number; originalPrice?: number } = {};

    // Pattern: "now $X" or "sale $X" or "only $X"
    const currentPriceMatch = text.match(/(?:now|sale|only|just)\s*\$(\d+(?:\.\d{2})?)/i);
    if (currentPriceMatch) {
      result.price = parseFloat(currentPriceMatch[1]);
    }

    // Pattern: "was $X" or "reg. $X" or "originally $X" or "(reg $X)"
    const originalPriceMatch = text.match(/(?:was|reg\.?|originally|regular|msrp)\s*\$(\d+(?:\.\d{2})?)/i);
    if (originalPriceMatch) {
      result.originalPrice = parseFloat(originalPriceMatch[1]);
    }

    // If no specific patterns, try to find any price
    if (!result.price) {
      const priceMatches = text.match(/\$(\d+(?:\.\d{2})?)/g);
      if (priceMatches && priceMatches.length > 0) {
        const prices = priceMatches.map(p => parseFloat(p.replace('$', '')));
        if (prices.length === 1) {
          result.price = prices[0];
        } else if (prices.length >= 2) {
          // Assume lower price is current, higher is original
          const sortedPrices = [...prices].sort((a, b) => a - b);
          result.price = sortedPrices[0];
          result.originalPrice = sortedPrices[sortedPrices.length - 1];
        }
      }
    }

    return result;
  }

  /**
   * Extract coupon code from text
   * Looks for patterns like "code: SAVE20", "use code DEAL10", "coupon: XYZ"
   */
  private extractCouponCode(title: string, description: string): string | undefined {
    const text = `${title} ${description}`;

    // Pattern: "code: XXX" or "code XXX" or "coupon: XXX" or "promo: XXX"
    const codeMatch = text.match(/(?:code|coupon|promo)[\s:]+([A-Z0-9]{3,20})/i);
    if (codeMatch) {
      return codeMatch[1].toUpperCase();
    }

    return undefined;
  }

  /**
   * Extract store name from text
   * Common store names in deal feeds
   */
  private extractStore(title: string, description: string): string | undefined {
    const text = `${title} ${description}`.toLowerCase();

    const stores = [
      'Amazon', 'Walmart', 'Target', 'Best Buy', 'Costco', 'Home Depot',
      'Lowes', 'Kohls', 'Macys', 'Nordstrom', 'Newegg', 'B&H Photo',
      'eBay', 'Staples', 'Office Depot', 'Wayfair', 'Overstock',
      'JCPenney', 'Sears', 'CVS', 'Walgreens', 'Rite Aid', 'GameStop',
      'Michaels', 'Bed Bath & Beyond', 'Ulta', 'Sephora', 'Nike',
      'Adidas', 'Under Armour', 'REI', 'Zappos', 'Gap', 'Old Navy',
      'Banana Republic', 'Express', 'ASOS', 'H&M', 'Uniqlo',
    ];

    for (const store of stores) {
      if (text.includes(store.toLowerCase())) {
        return store;
      }
    }

    return undefined;
  }

  /**
   * Generate a unique GUID from a URL
   */
  private generateGuid(url: string): string {
    return createHash('md5').update(url).digest('hex');
  }

  /**
   * Clean text by removing HTML tags and excessive whitespace
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
