import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { SavedDeal } from './entities/saved-deal.entity';
import { UserFcmToken } from './entities/user-fcm-token.entity';
import { UsersController } from './users.controller';
import { UserAuthController } from './user-auth.controller';
import { UsersService } from './users.service';
import { UserAuthService } from './user-auth.service';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { AuthModule } from '../auth/auth.module';

/**
 * UsersModule - Feature module for user management
 *
 * SOLID Principles Applied:
 * - Dependency Inversion: Repository interface is bound to concrete implementation
 * - Single Responsibility: Module only configures user-related components
 *
 * Exports UsersService so other modules (like AuthModule) can access user data
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, SavedDeal, UserFcmToken]),
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dealhunter-secret-key'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, UserAuthController],
  providers: [
    UsersService,
    UserAuthService,
    TypeOrmUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UsersService, UserAuthService, USERS_REPOSITORY, TypeOrmUsersRepository],
})
export class UsersModule {}
