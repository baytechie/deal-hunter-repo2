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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { Deal } from './modules/deals/entities/deal.entity';
import { AdminUser } from './modules/auth/entities/admin-user.entity';
import { PendingDeal } from './modules/pending-deals/entities/pending-deal.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import * as path from 'path';
import * as fs from 'fs';

// Ensure data directory exists for SQLite (local development only)
const dataDir = path.join(process.cwd(), 'data');
if (!process.env.DATABASE_URL && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Determine database configuration based on DATABASE_URL
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // PostgreSQL for production (Render)
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      entities: [Deal, AdminUser, PendingDeal, Notification],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      logging: process.env.NODE_ENV === 'development',
    };
  }
  // SQLite for local development
  return {
    type: 'sqlite' as const,
    database: process.env.DATABASE_PATH || path.join(dataDir, 'deals.db'),
    entities: [Deal, AdminUser, PendingDeal, Notification],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
  };
};

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // TypeORM configuration - PostgreSQL in production, SQLite locally
    TypeOrmModule.forRoot(getDatabaseConfig()),
    SharedModule,
    NotificationsModule,
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
