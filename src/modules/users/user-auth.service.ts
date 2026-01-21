import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './repositories/users.repository.interface';
import {
  RegisterUserDto,
  LoginUserDto,
  AuthResponse,
} from './dto/user-auth.dto';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * UserAuthService handles authentication for app users.
 *
 * Supports:
 * - Email/password registration and login
 * - JWT access tokens for API authentication
 * - Refresh tokens for session management
 */
@Injectable()
export class UserAuthService {
  private readonly context = 'UserAuthService';
  private readonly SALT_ROUNDS = 10;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Register a new user with email and password
   */
  async register(registerDto: RegisterUserDto): Promise<AuthResponse> {
    this.logger.log(`Registration attempt for: ${registerDto.email}`, this.context);

    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(registerDto.email);
    if (existingUser) {
      this.logger.warn(`Registration failed - email exists: ${registerDto.email}`, this.context);
      throw new ConflictException('An account with this email already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(registerDto.password, this.SALT_ROUNDS);

    // Create the user
    const user = await this.usersRepository.create({
      email: registerDto.email,
      displayName: registerDto.displayName || registerDto.email.split('@')[0],
    });

    // Update with password hash (since CreateUserDto doesn't include password)
    await this.usersRepository.update(user.id, {
      passwordHash,
      emailVerified: false,
    } as Partial<User>);

    this.logger.log(`User registered successfully: ${user.id}`, this.context);

    // Generate tokens and return
    return this.generateAuthResponse(user);
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginUserDto): Promise<AuthResponse> {
    this.logger.log(`Login attempt for: ${loginDto.email}`, this.context);

    // Find user by email
    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(`Login failed - user not found: ${loginDto.email}`, this.context);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      this.logger.warn(`Login failed - user inactive: ${loginDto.email}`, this.context);
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    if (!user.passwordHash) {
      this.logger.warn(`Login failed - no password set: ${loginDto.email}`, this.context);
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google or Apple.',
      );
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed - invalid password: ${loginDto.email}`, this.context);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    this.logger.log(`Login successful for: ${user.id}`, this.context);

    // Generate tokens and return
    return this.generateAuthResponse(user);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dealhunter-refresh-secret',
      });

      // Hash the token to find the session
      const tokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
      const session = await this.usersRepository.findSessionByToken(tokenHash);

      if (!session || session.isExpired()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Get the user
      const user = await this.usersRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Update session last used
      await this.usersRepository.updateSessionLastUsed(session.id);

      this.logger.log(`Token refreshed for user: ${user.id}`, this.context);

      return this.generateAuthResponse(user);
    } catch (error) {
      this.logger.warn(`Token refresh failed: ${error.message}`, this.context);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }

  /**
   * Generate auth response with tokens and user info
   */
  private generateAuthResponse(user: User): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Access token expires in 1 hour
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dealhunter-refresh-secret',
      expiresIn: `${this.REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
