/**
 * Deal Text Parser Utility
 *
 * Extracts deal information from pasted text (e.g., from retailer websites)
 * using regex patterns to identify prices, URLs, coupon codes, dates, etc.
 */

export interface ParsedDealData {
  title?: string;
  price?: number;
  originalPrice?: number;
  affiliateLink?: string;
  imageUrl?: string;
  couponCode?: string;
  expiryDate?: string;
  category?: string;
  description?: string;
  promoDescription?: string;
}

export interface ParseResult {
  data: ParsedDealData;
  confidence: {
    title: number;
    price: number;
    originalPrice: number;
    affiliateLink: number;
    imageUrl: number;
    couponCode: number;
    expiryDate: number;
    category: number;
  };
  missingFields: string[];
}

// Category keywords for auto-detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Electronics: ['electronics', 'laptop', 'computer', 'phone', 'tablet', 'camera', 'tv', 'television', 'headphones', 'speaker', 'monitor', 'keyboard', 'mouse', 'gaming', 'console', 'playstation', 'xbox', 'nintendo', 'smart watch', 'earbuds', 'airpods'],
  Fashion: ['clothing', 'shirt', 'dress', 'pants', 'jeans', 'jacket', 'coat', 'shoes', 'sneakers', 'boots', 'fashion', 'apparel', 'watch', 'jewelry', 'handbag', 'purse', 'sunglasses'],
  'Home & Kitchen': ['home', 'kitchen', 'furniture', 'appliance', 'cookware', 'bedding', 'mattress', 'vacuum', 'blender', 'coffee maker', 'instant pot', 'air fryer', 'sofa', 'chair', 'table', 'lamp'],
  'Health & Beauty': ['beauty', 'health', 'skincare', 'makeup', 'cosmetics', 'perfume', 'shampoo', 'vitamin', 'supplement', 'fitness', 'wellness'],
  'Sports & Outdoors': ['sports', 'outdoor', 'camping', 'hiking', 'bike', 'bicycle', 'fitness', 'gym', 'yoga', 'running', 'golf', 'tennis', 'basketball', 'football'],
  'Books & Media': ['book', 'kindle', 'audiobook', 'dvd', 'blu-ray', 'movie', 'music', 'album', 'vinyl'],
  'Toys & Games': ['toy', 'game', 'lego', 'puzzle', 'board game', 'action figure', 'doll', 'kids'],
  'Grocery': ['grocery', 'food', 'snack', 'beverage', 'coffee', 'tea', 'organic'],
  'Baby': ['baby', 'diaper', 'stroller', 'car seat', 'infant', 'nursery'],
  'Pet Supplies': ['pet', 'dog', 'cat', 'fish', 'bird', 'animal'],
  'Office': ['office', 'desk', 'printer', 'paper', 'pen', 'notebook', 'organizer'],
  'Automotive': ['car', 'automotive', 'vehicle', 'tire', 'motor', 'oil', 'tool'],
  Other: [],
};

/**
 * Extract prices from text
 * Matches patterns like: $19.99, $1,299.00, 19.99 USD, etc.
 */
function extractPrices(text: string): number[] {
  const pricePatterns = [
    /\$\s*([\d,]+(?:\.\d{2})?)/g,               // $19.99, $ 19.99, $1,299.99
    /USD\s*([\d,]+(?:\.\d{2})?)/gi,             // USD 19.99
    /([\d,]+(?:\.\d{2})?)\s*(?:USD|dollars?)/gi, // 19.99 USD, 19.99 dollars
    /price[:\s]+\$?([\d,]+(?:\.\d{2})?)/gi,     // price: 19.99
  ];

  const prices: number[] = [];

  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0 && price < 100000) {
        prices.push(price);
      }
    }
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

/**
 * Extract original/list price (was price, list price, etc.)
 */
function extractOriginalPrice(text: string): number | undefined {
  const patterns = [
    /(?:was|originally|list\s*price|regular\s*price|msrp)[:\s]*\$?([\d,]+(?:\.\d{2})?)/gi,
    /\$?([\d,]+(?:\.\d{2})?)\s*(?:list|was|original|msrp)/gi,
    /(?:struck|strikethrough|crossed)[^$]*\$?([\d,]+(?:\.\d{2})?)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }

  return undefined;
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlPattern) || [];
  return [...new Set(matches)];
}

/**
 * Extract coupon/promo codes
 */
function extractCouponCode(text: string): string | undefined {
  const patterns = [
    /(?:code|coupon|promo|promocode|discount\s*code)[:\s]+["']?([A-Z0-9]{3,20})["']?/gi,
    /(?:use|apply|enter)[:\s]+["']?([A-Z0-9]{4,20})["']?/gi,
    /["']([A-Z0-9]{4,15})["']\s*(?:at\s*checkout|for|to\s*save)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return undefined;
}

/**
 * Extract expiry date
 */
function extractExpiryDate(text: string): string | undefined {
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(?:expires?|ends?|valid\s*(?:until|thru|through)?)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    // Month DD, YYYY
    /(?:expires?|ends?|valid\s*(?:until|thru|through)?)[:\s]*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?)/gi,
    // Standalone date patterns
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s*(?:expir|end)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const dateStr = match[1];
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  return undefined;
}

/**
 * Detect category from text
 */
function detectCategory(text: string): string | undefined {
  const lowerText = text.toLowerCase();

  let bestMatch: string | undefined;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;

    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}

/**
 * Extract image URL (prioritize product images)
 */
function extractImageUrl(urls: string[]): string | undefined {
  // Prioritize common image hosting patterns
  const imagePatterns = [
    /\.(jpg|jpeg|png|webp|gif)(\?|$)/i,
    /\/images?\//i,
    /\/photos?\//i,
    /cloudinary/i,
    /imgix/i,
    /amazonaws.*\.(jpg|jpeg|png|webp)/i,
  ];

  for (const url of urls) {
    for (const pattern of imagePatterns) {
      if (pattern.test(url)) {
        return url;
      }
    }
  }

  return undefined;
}

/**
 * Extract affiliate/product link
 */
function extractAffiliateLink(urls: string[]): string | undefined {
  // Prioritize common retailer and affiliate link patterns
  const affiliatePatterns = [
    /amazon\./i,
    /amzn\./i,
    /target\./i,
    /walmart\./i,
    /bestbuy\./i,
    /ebay\./i,
    /newegg\./i,
    /bhphoto/i,
    /costco\./i,
    /affiliate/i,
    /product/i,
    /\/dp\//i,
    /\/p\//i,
  ];

  for (const url of urls) {
    for (const pattern of affiliatePatterns) {
      if (pattern.test(url)) {
        return url;
      }
    }
  }

  // Return first non-image URL
  const imageExtensions = /\.(jpg|jpeg|png|webp|gif|svg|ico)(\?|$)/i;
  for (const url of urls) {
    if (!imageExtensions.test(url)) {
      return url;
    }
  }

  return urls[0];
}

/**
 * Extract title from text
 * Uses first significant line that looks like a product title
 */
function extractTitle(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (const line of lines) {
    // Skip lines that are just prices, URLs, or very short
    if (line.length < 10 || line.length > 300) continue;
    if (/^[\$\d\.,\s]+$/.test(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (/^(code|coupon|promo|expires?|ends?|was|save)/i.test(line)) continue;

    // This looks like a title
    return line.substring(0, 255);
  }

  return undefined;
}

/**
 * Main parsing function
 */
export function parseDealText(text: string): ParseResult {
  const prices = extractPrices(text);
  const urls = extractUrls(text);
  const title = extractTitle(text);
  const couponCode = extractCouponCode(text);
  const expiryDate = extractExpiryDate(text);
  const category = detectCategory(text);
  const originalPriceFromText = extractOriginalPrice(text);

  // Determine current and original prices
  let price: number | undefined;
  let originalPrice: number | undefined;

  if (originalPriceFromText) {
    originalPrice = originalPriceFromText;
    // Find the lowest price that's less than original
    price = prices.find(p => p < originalPriceFromText) || prices[0];
  } else if (prices.length >= 2) {
    // Assume lowest is current, highest is original
    price = prices[0];
    originalPrice = prices[prices.length - 1];
  } else if (prices.length === 1) {
    price = prices[0];
  }

  const imageUrl = extractImageUrl(urls);
  const affiliateLink = extractAffiliateLink(urls.filter(u => u !== imageUrl));

  // Build result
  const data: ParsedDealData = {
    title,
    price,
    originalPrice,
    affiliateLink,
    imageUrl,
    couponCode,
    expiryDate,
    category,
  };

  // Calculate confidence scores (0-1)
  const confidence = {
    title: title ? (title.length > 20 ? 0.9 : 0.6) : 0,
    price: price ? 0.9 : 0,
    originalPrice: originalPrice ? (originalPriceFromText ? 0.95 : 0.7) : 0,
    affiliateLink: affiliateLink ? (/amazon|amzn/i.test(affiliateLink) ? 0.95 : 0.7) : 0,
    imageUrl: imageUrl ? 0.8 : 0,
    couponCode: couponCode ? 0.85 : 0,
    expiryDate: expiryDate ? 0.8 : 0,
    category: category ? 0.7 : 0,
  };

  // Determine missing required fields
  const missingFields: string[] = [];
  if (!title) missingFields.push('title');
  if (!price) missingFields.push('price');
  if (!originalPrice) missingFields.push('originalPrice');
  if (!affiliateLink) missingFields.push('affiliateLink');
  if (!category) missingFields.push('category');

  return {
    data,
    confidence,
    missingFields,
  };
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0 || currentPrice < 0) return 0;
  if (currentPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
