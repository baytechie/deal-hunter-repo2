import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { SavedDeal } from './entities/saved-deal.entity';
import { UserFcmToken } from './entities/user-fcm-token.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
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
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    TypeOrmUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UsersService, USERS_REPOSITORY, TypeOrmUsersRepository],
})
export class UsersModule {}
