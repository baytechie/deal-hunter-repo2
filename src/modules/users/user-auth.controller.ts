import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import {
  RegisterUserDto,
  LoginUserDto,
  AuthResponse,
} from './dto/user-auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * UserAuthController handles authentication endpoints for app users.
 *
 * Endpoints:
 * - POST /user-auth/register - Create new account
 * - POST /user-auth/login - Sign in with email/password
 * - POST /user-auth/refresh - Refresh access token
 * - GET /user-auth/me - Get current user profile
 */
@Controller('user-auth')
export class UserAuthController {
  private readonly context = 'UserAuthController';

  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /user-auth/register
   * Register a new user with email and password
   */
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto): Promise<AuthResponse> {
    this.logger.log(`Register request for: ${registerDto.email}`, this.context);

    const result = await this.userAuthService.register(registerDto);

    this.logger.log(`Registration successful for: ${registerDto.email}`, this.context);
    return result;
  }

  /**
   * POST /user-auth/login
   * Login with email and password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto): Promise<AuthResponse> {
    this.logger.log(`Login request for: ${loginDto.email}`, this.context);

    const result = await this.userAuthService.login(loginDto);

    this.logger.log(`Login successful for: ${loginDto.email}`, this.context);
    return result;
  }

  /**
   * POST /user-auth/refresh
   * Refresh access token using refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponse> {
    this.logger.log('Token refresh request', this.context);

    const result = await this.userAuthService.refreshToken(refreshToken);

    this.logger.log('Token refresh successful', this.context);
    return result;
  }

  /**
   * GET /user-auth/me
   * Get current user profile (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    this.logger.log(`Profile request for user: ${req.user.userId}`, this.context);

    const user = await this.userAuthService.getProfile(req.user.userId);

    if (!user) {
      this.logger.warn(`User not found: ${req.user.userId}`, this.context);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
