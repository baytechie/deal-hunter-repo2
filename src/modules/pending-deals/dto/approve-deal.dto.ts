import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, Min } from 'class-validator';

/**
 * DTO for approving a pending deal.
 * Admins can override or add promotion information when approving.
 */
export class ApproveDealDto {
  @IsOptional()
  @IsString()
  customTitle?: string;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;

  @IsOptional()
  @IsString()
  promoDescription?: string;

  // Override promotion display text (admin can customize the message)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  promotionDisplayText?: string;

  // Admin can mark as having a clippable coupon even if API didn't detect it
  @IsOptional()
  @IsBoolean()
  isCouponAvailable?: boolean;

  // Admin can specify promotion amount if known
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionAmount?: number;

  // Admin can specify promotion percentage if known
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionPercent?: number;
}
