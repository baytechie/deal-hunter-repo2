import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { DealsModule } from './modules/deals/deals.module';
import { AuthModule } from './modules/auth/auth.module';
import { AmazonModule } from './modules/amazon/amazon.module';
import { PendingDealsModule } from './modules/pending-deals/pending-deals.module';
import { Deal } from './modules/deals/entities/deal.entity';
import { AdminUser } from './modules/auth/entities/admin-user.entity';
import { PendingDeal } from './modules/pending-deals/entities/pending-deal.entity';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // TypeORM configuration with SQLite for development
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/deals.db',
      entities: [Deal, AdminUser, PendingDeal],
      synchronize: true, // Auto-sync schema in development (disable in production)
      logging: process.env.NODE_ENV === 'development',
    }),
    SharedModule,
    DealsModule,
    AuthModule,
    AmazonModule,
    PendingDealsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
