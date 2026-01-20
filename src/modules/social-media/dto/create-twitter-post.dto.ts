import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

/**
 * DTO for creating a Twitter post
 */
export class CreateTwitterPostDto {
  @IsString()
  dealId: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  includeImage?: boolean = true;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string; // ISO date string for scheduled posts

  @IsBoolean()
  @IsOptional()
  saveAsDraft?: boolean = false; // Save as draft for approval workflow
}

/**
 * DTO for generating tweet preview
 */
export class GenerateTweetPreviewDto {
  @IsString()
  dealId: string;
}

/**
 * Response DTO for social post
 */
export class SocialPostResponseDto {
  id: string;
  platform: string;
  dealId: string;
  dealTitle?: string;
  postContent: string;
  postId?: string;
  postUrl?: string;
  imageUrl?: string;
  status: string;
  scheduledAt?: Date;
  postedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}
