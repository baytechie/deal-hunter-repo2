import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * AffiliateService - Handles affiliate link management and tagging
 * 
 * SOLID Principles:
 * - Single Responsibility: Only manages affiliate URL operations
 * - Dependency Inversion: Injected LoggerService abstraction
 * 
 * Purpose:
 * This service sanitizes and tags affiliate URLs with Amazon Associate identifiers.
 * It validates URLs against Amazon domains and appends the tracking tag to enable
 * proper affiliate attribution and revenue tracking.
 */
@Injectable()
export class AffiliateService {
  private readonly context = 'AffiliateService';

  /**
   * Amazon Associate tag for tracking and revenue attribution
   * Format: YOUR_ASSOCIATE_ID-20 (the -20 suffix is standard for Amazon)
   */
  private readonly AMAZON_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'moneysaverdeals-20';

  /**
   * Regex patterns for validating Amazon URLs
   * Matches various Amazon domain formats:
   * - amazon.com, amazon.co.uk, amazon.de, amazon.fr, amazon.it, amazon.es, amazon.ca, etc.
   * - Supports both www and non-www formats
   * - Captures standard product pages, search results, and direct links
   */
  private readonly AMAZON_URL_REGEX = /^https?:\/\/(www\.)?amazon\.(com|co\.uk|de|fr|it|es|ca|in|mx|br|au|jp|cn)\/?.*/i;

  /**
   * Additional validation for Amazon URLs - checks for ASIN (Amazon Standard Identification Number)
   * or other product identifiers to ensure it's a valid product page
   */
  private readonly AMAZON_PRODUCT_IDENTIFIER_REGEX = /(\/dp\/|\/gp\/product\/|asin=)([A-Z0-9]{10})/i;

  constructor(private readonly logger: LoggerService) {}

  /**
   * Tag an affiliate URL with Amazon Associate identifier
   * 
   * @param originalUrl - The original affiliate URL (with or without tag)
   * @returns The URL with the Amazon Associate tag appended
   * 
   * @example
   * tagUrl('https://amazon.com/dp/B001234567')
   * // Returns: 'https://amazon.com/dp/B001234567?tag=moneysaverdeals-20'
   */
  tagUrl(originalUrl: string): string {
    const context = `${this.context}.tagUrl`;

    this.logger.debug(`Processing URL for tagging: ${originalUrl}`, context);

    // Validate URL format
    if (!this.isValidUrl(originalUrl)) {
      this.logger.warn(
        `Invalid URL format provided: ${originalUrl}`,
        context,
      );
      return originalUrl;
    }

    // Validate Amazon domain
    if (!this.validateAmazonUrl(originalUrl)) {
      this.logger.warn(
        `Non-Amazon URL provided for affiliate tagging. This URL will not receive affiliate attribution: ${originalUrl}`,
        context,
      );
      return originalUrl;
    }

    // Check if URL already has a tag
    if (this.hasExistingTag(originalUrl)) {
      this.logger.debug(
        `URL already contains an affiliate tag: ${originalUrl}`,
        context,
      );
      return this.replaceExistingTag(originalUrl);
    }

    // Append the tag to the URL
    const taggedUrl = this.appendTag(originalUrl);
    this.logger.log(
      `URL tagged successfully: ${originalUrl} -> ${taggedUrl}`,
      context,
    );

    return taggedUrl;
  }

  /**
   * Validate if a URL is a valid Amazon URL
   * 
   * @param url - The URL to validate
   * @returns true if the URL matches Amazon domain pattern
   */
  validateAmazonUrl(url: string): boolean {
    const context = `${this.context}.validateAmazonUrl`;

    const isAmazonDomain = this.AMAZON_URL_REGEX.test(url);

    if (!isAmazonDomain) {
      this.logger.debug(
        `URL does not match Amazon domain pattern: ${url}`,
        context,
      );
      return false;
    }

    // Additional validation: Check for product identifier
    const hasProductIdentifier = this.AMAZON_PRODUCT_IDENTIFIER_REGEX.test(url);

    if (!hasProductIdentifier) {
      this.logger.warn(
        `Amazon URL provided but lacks product identifier (ASIN). URL may not be a valid product page: ${url}`,
        context,
      );
      // Return true as it's still an Amazon URL, just potentially malformed
      return true;
    }

    return true;
  }

  /**
   * Validate basic URL format
   * 
   * @param url - The URL to validate
   * @returns true if URL is properly formatted
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL already contains an affiliate tag
   * 
   * @param url - The URL to check
   * @returns true if URL already has a tag parameter
   */
  private hasExistingTag(url: string): boolean {
    return url.includes('?tag=') || url.includes('&tag=');
  }

  /**
   * Replace an existing affiliate tag with the new one
   * 
   * @param url - The URL with an existing tag
   * @returns The URL with the tag replaced
   */
  private replaceExistingTag(url: string): string {
    const context = `${this.context}.replaceExistingTag`;

    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('tag', this.AMAZON_TAG);

      const updatedUrl = urlObj.toString();
      this.logger.debug(
        `Replaced existing tag: ${url} -> ${updatedUrl}`,
        context,
      );

      return updatedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to replace tag in URL: ${url}`,
        error instanceof Error ? error.stack : 'Unknown error',
        context,
      );
      return url;
    }
  }

  /**
   * Append the affiliate tag to a URL
   * 
   * @param url - The URL to tag
   * @returns The URL with the tag appended
   */
  private appendTag(url: string): string {
    const context = `${this.context}.appendTag`;

    try {
      const urlObj = new URL(url);

      // Append tag parameter
      urlObj.searchParams.append('tag', this.AMAZON_TAG);

      const taggedUrl = urlObj.toString();
      this.logger.debug(
        `Tag appended to URL: ${url} -> ${taggedUrl}`,
        context,
      );

      return taggedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to append tag to URL: ${url}`,
        error instanceof Error ? error.stack : 'Unknown error',
        context,
      );
      return url;
    }
  }

  /**
   * Get the current Amazon Associate tag
   * 
   * @returns The configured Amazon Associate tag
   */
  getTag(): string {
    return this.AMAZON_TAG;
  }

  /**
   * Validate and sanitize an affiliate URL
   * Combines validation and tagging in a single operation
   * 
   * @param url - The URL to sanitize
   * @returns Sanitized and tagged URL, or original URL if invalid
   */
  sanitizeAffiliateUrl(url: string): string {
    const context = `${this.context}.sanitizeAffiliateUrl`;

    this.logger.debug(`Sanitizing affiliate URL: ${url}`, context);

    try {
      return this.tagUrl(url);
    } catch (error) {
      this.logger.error(
        `Error during URL sanitization: ${url}`,
        error instanceof Error ? error.stack : 'Unknown error',
        context,
      );
      return url;
    }
  }
}
