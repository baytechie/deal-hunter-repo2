import { IsString, IsOptional, IsBoolean } from 'class-validator';

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
}
