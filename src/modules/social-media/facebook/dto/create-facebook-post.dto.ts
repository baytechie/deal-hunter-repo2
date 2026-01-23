import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum FacebookTargetType {
  PAGE = 'PAGE',
  GROUP = 'GROUP',
}

/**
 * DTO for creating a Facebook post
 */
export class CreateFacebookPostDto {
  @IsString()
  dealId: string;

  @IsString()
  content: string;

  @IsEnum(FacebookTargetType)
  targetType: FacebookTargetType;

  @IsString()
  targetId: string; // Page ID or Group ID

  @IsOptional()
  @IsString()
  pageAccessToken?: string; // Required for Page posts

  @IsOptional()
  @IsBoolean()
  includeImage?: boolean;

  @IsOptional()
  @IsBoolean()
  saveAsDraft?: boolean;

  @IsOptional()
  @IsString()
  scheduledAt?: string;
}

/**
 * DTO for generating Facebook post preview
 */
export class GenerateFacebookPreviewDto {
  @IsString()
  dealId: string;
}

/**
 * DTO for Facebook OAuth callback
 */
export class FacebookOAuthCallbackDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  state?: string;
}

/**
 * DTO for setting Facebook access token
 */
export class SetFacebookTokenDto {
  @IsString()
  accessToken: string;
}
