import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggerService } from './shared/services/logger.service';
import { DealsService } from './modules/deals/deals.service';
import { AuthService } from './modules/auth/auth.service';
import { sampleDeals } from './modules/deals/seeds/deals.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get LoggerService instance from the application context
  const logger = app.get(LoggerService);

  // Enable CORS for Flutter web app and admin panel
  // Production domains only
  app.enableCors({
    origin: [
      // Production domains
      'https://www.huntdeals.app',
      'https://huntdeals.app',
      'https://admin.huntdeals.app',
      'https://api.huntdeals.app',
      // Render deployment URLs
      'https://dealhunter-admin.onrender.com',
      'https://dealhunter-pwa.onrender.com',
    ],
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

  // Seed sample deals only in development (disabled in production)
  // FIXME: Remove this entirely once real Amazon deals are in use
  if (process.env.NODE_ENV !== 'production') {
    await seedDeals(app, logger);
  }

  // Seed default admin user
  await seedAdminUser(app, logger);

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

/**
 * Seed default admin user if none exists
 */
async function seedAdminUser(app: any, logger: LoggerService) {
  try {
    const authService = app.get(AuthService);
    await authService.seedAdminUser();
  } catch (error) {
    logger.error(`Failed to seed admin user: ${error.message}`, error.stack, 'Seeder');
  }
}

bootstrap();
