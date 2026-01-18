import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * AuthController handles authentication endpoints.
 */
@Controller('auth')
export class AuthController {
  private readonly context = 'AuthController';

  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /auth/login
   * Authenticate admin user and return JWT token
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for: ${loginDto.email}`, this.context);

    const result = await this.authService.login(loginDto);

    this.logger.log(`Login successful for: ${loginDto.email}`, this.context);
    return result;
  }

  /**
   * GET /auth/profile
   * Get current user profile (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    this.logger.log(`Profile requested for user: ${req.user.email}`, this.context);
    return this.authService.getProfile(req.user.userId);
  }
}
