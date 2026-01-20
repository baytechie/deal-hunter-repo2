import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for saving a deal
 */
export class SaveDealDto {
  @IsOptional()
  @IsBoolean()
  priceAlertEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  priceAlertThreshold?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating saved deal alert settings
 */
export class UpdateSavedDealAlertDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  threshold?: number;
}
