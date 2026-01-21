import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
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
  private readonly googleClient: OAuth2Client;

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {
    // Initialize Google OAuth client
    // Client ID should be configured via environment variable
    const googleClientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    this.googleClient = new OAuth2Client(googleClientId);
  }

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
   * Login with Google OAuth
   * Verifies the Google ID token, creates user if needed, and returns auth tokens
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    this.logger.log('Google login attempt', this.context);

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.warn(`Google token verification failed: ${error.message}`, this.context);
      throw new BadRequestException('Invalid Google ID token');
    }

    if (!payload) {
      this.logger.warn('Google token payload is empty', this.context);
      throw new BadRequestException('Invalid Google ID token');
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!googleId) {
      throw new BadRequestException('Google ID not found in token');
    }

    // Check if user exists with this Google ID
    let user = await this.usersRepository.findByGoogleId(googleId);

    if (user) {
      // Existing Google user - check if active
      if (!user.isActive) {
        this.logger.warn(`Google login failed - user inactive: ${email}`, this.context);
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update last login and avatar if changed
      await this.usersRepository.update(user.id, {
        lastLoginAt: new Date(),
        avatarUrl: picture || user.avatarUrl,
      });

      this.logger.log(`Google login successful for existing user: ${user.id}`, this.context);
      return this.generateAuthResponse(user);
    }

    // Check if email exists with password login
    if (email) {
      const existingEmailUser = await this.usersRepository.findByEmail(email);
      if (existingEmailUser) {
        // Link Google account to existing email user
        await this.usersRepository.update(existingEmailUser.id, {
          googleId,
          avatarUrl: picture || existingEmailUser.avatarUrl,
          emailVerified: true, // Google has verified the email
          lastLoginAt: new Date(),
        });

        this.logger.log(
          `Google account linked to existing user: ${existingEmailUser.id}`,
          this.context,
        );

        // Fetch updated user
        user = await this.usersRepository.findById(existingEmailUser.id);
        return this.generateAuthResponse(user!);
      }
    }

    // Create new user with Google account
    user = await this.usersRepository.create({
      email: email || null,
      displayName: name || email?.split('@')[0] || 'User',
    });

    // Update with Google-specific fields
    await this.usersRepository.update(user.id, {
      googleId,
      avatarUrl: picture || null,
      emailVerified: !!email, // Google has verified the email
      lastLoginAt: new Date(),
    } as Partial<User>);

    this.logger.log(`New user created via Google login: ${user.id}`, this.context);

    // Fetch updated user to get all fields
    user = await this.usersRepository.findById(user.id);
    return this.generateAuthResponse(user!);
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
