import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

/**
 * DTO for user registration with email/password
 */
export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

/**
 * DTO for user login with email/password
 */
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

/**
 * DTO for Google OAuth login
 */
export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Google ID token is required' })
  idToken: string;
}

/**
 * DTO for Apple OAuth login
 */
export class AppleAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Apple identity token is required' })
  identityToken: string;

  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

/**
 * Auth response containing tokens and user info
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}
