import { IsString, IsUrl, IsOptional, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';

/**
 * DTO for updating an RSS feed source
 * All fields are optional
 */
export class UpdateRssFeedSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  crawlIntervalMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;
}
