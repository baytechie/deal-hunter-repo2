import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggerService } from './shared/services/logger.service';
import { DealsService } from './modules/deals/deals.service';
import { sampleDeals } from './modules/deals/seeds/deals.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get LoggerService instance from the application context
  const logger = app.get(LoggerService);

  // Enable CORS for Flutter web app and admin panel
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8085', 'http://localhost:8086'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Apply global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply global exception filter with custom logger
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Seed sample deals if database is empty
  await seedDeals(app, logger);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}

/**
 * Seed sample deals into the database if it's empty
 */
async function seedDeals(app: any, logger: LoggerService) {
  try {
    const dealsService = app.get(DealsService);
    const existingDeals = await dealsService.findAll();
    
    if (existingDeals.data.length === 0) {
      logger.log('Database is empty, seeding sample deals...', 'Seeder');
      
      for (const dealData of sampleDeals) {
        await dealsService.create(dealData as any);
      }
      
      logger.log(`Seeded ${sampleDeals.length} sample deals`, 'Seeder');
    } else {
      logger.log(`Database already has ${existingDeals.data.length} deals, skipping seed`, 'Seeder');
    }
  } catch (error) {
    logger.error(`Failed to seed deals: ${error.message}`, error.stack, 'Seeder');
  }
}

bootstrap();
