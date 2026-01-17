import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { DealsModule } from './modules/deals/deals.module';
import { Deal } from './modules/deals/entities/deal.entity';

@Module({
  imports: [
    // TypeORM configuration with SQLite for development
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/deals.db',
      entities: [Deal],
      synchronize: true, // Auto-sync schema in development (disable in production)
      logging: process.env.NODE_ENV === 'development',
    }),
    SharedModule,
    DealsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
