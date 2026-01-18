import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO for admin login request
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
