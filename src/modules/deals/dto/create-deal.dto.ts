import {
  IsString,
  IsNumber,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a new deal
 */
export class CreateDealDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  originalPrice: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsUrl()
  affiliateLink: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsString()
  @MaxLength(100)
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;

  @IsOptional()
  @IsString()
  promoDescription?: string;

  // Amazon deal information
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dealBadge?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dealAccessType?: string;

  @IsOptional()
  @IsDateString()
  dealEndTime?: string;

  // Promotion information
  @IsOptional()
  @IsBoolean()
  hasPromotion?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  promotionType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionPercent?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  promotionDisplayText?: string;

  @IsOptional()
  @IsBoolean()
  isSubscribeAndSave?: boolean;

  @IsOptional()
  @IsBoolean()
  isCouponAvailable?: boolean;

  // Amazon Associates Compliance Fields - Editorial Analysis
  @IsOptional()
  @IsString()
  originalAnalysis?: string;

  @IsOptional()
  @IsString({ each: true })
  pros?: string[];

  @IsOptional()
  @IsString({ each: true })
  cons?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50)
  expertVerdict?: string;

  @IsOptional()
  @IsString()
  whenToBuy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bestFor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  retailer?: string;

  @IsOptional()
  @IsString()
  priceHistoryJson?: string;
}
