import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';

/**
 * DTO for syncing deals from Amazon PAAPI
 */
export class SyncDealsDto {
  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['Price:LowToHigh', 'Price:HighToLow', 'AvgCustomerReviews', 'NewestArrivals'])
  sortBy?: 'Price:LowToHigh' | 'Price:HighToLow' | 'AvgCustomerReviews' | 'NewestArrivals';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  itemCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99)
  minDiscountPercent?: number;
}
