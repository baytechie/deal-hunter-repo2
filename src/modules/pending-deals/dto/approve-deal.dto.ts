import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * DTO for approving a pending deal
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
}
