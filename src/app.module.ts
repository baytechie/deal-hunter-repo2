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
import { AdminModule } from './modules/admin/admin.module';
import { Deal } from './modules/deals/entities/deal.entity';
import { AdminUser } from './modules/auth/entities/admin-user.entity';
import { PendingDeal } from './modules/pending-deals/entities/pending-deal.entity';
import * as path from 'path';
import * as fs from 'fs';

// Ensure data directory exists for SQLite
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // TypeORM configuration with SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || path.join(dataDir, 'deals.db'),
      entities: [Deal, AdminUser, PendingDeal],
      synchronize: true, // Auto-sync schema (consider disabling in production with migrations)
      logging: process.env.NODE_ENV === 'development',
    }),
    SharedModule,
    DealsModule,
    AuthModule,
    AmazonModule,
    PendingDealsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
