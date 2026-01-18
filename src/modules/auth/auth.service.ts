import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './entities/admin-user.entity';
import { LoginDto } from './dto/login.dto';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * AuthService handles authentication logic including:
 * - User validation
 * - JWT token generation
 * - Admin user seeding
 */
@Injectable()
export class AuthService {
  private readonly context = 'AuthService';

  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  /**
   * Validate user credentials and return user if valid
   */
  async validateUser(email: string, password: string): Promise<AdminUser | null> {
    this.logger.debug(`Validating user: ${email}`, this.context);

    const user = await this.adminUserRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      this.logger.warn(`User not found or inactive: ${email}`, this.context);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`, this.context);
      return null;
    }

    this.logger.log(`User validated successfully: ${email}`, this.context);
    return user;
  }

  /**
   * Login and generate JWT token
   */
  async login(loginDto: LoginDto): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    this.logger.log(`JWT token generated for user: ${email}`, this.context);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<{ id: string; email: string; name: string; createdAt: Date }> {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  /**
   * Seed default admin user if none exists.
   * Called during application startup.
   */
  async seedAdminUser(): Promise<void> {
    const existingAdmin = await this.adminUserRepository.findOne({
      where: { email: 'admin@dealhunter.com' },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping seed', this.context);
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = this.adminUserRepository.create({
      email: 'admin@dealhunter.com',
      password: hashedPassword,
      name: 'Admin',
      isActive: true,
    });

    await this.adminUserRepository.save(adminUser);
    this.logger.log('Default admin user created: admin@dealhunter.com', this.context);
  }
}
