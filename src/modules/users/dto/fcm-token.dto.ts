import {
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';

/**
 * DTO for registering an FCM token
 */
export class RegisterFcmTokenDto {
  @IsString()
  @MaxLength(500)
  fcmToken: string;

  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;
}
