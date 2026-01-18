import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying pending deals with filters and pagination
 */
export class GetPendingDealsQueryDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
