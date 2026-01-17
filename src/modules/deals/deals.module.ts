import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './entities/deal.entity';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { TypeOrmDealsRepository } from './repositories/typeorm-deals.repository';
import { DEALS_REPOSITORY } from './repositories/deals.repository.interface';
import { AffiliateService } from './services/affiliate.service';

/**
 * DealsModule - Feature module for deals functionality
 * 
 * SOLID Principles Applied:
 * - Dependency Inversion: Repository interface is bound to concrete implementation
 *   This allows swapping implementations without changing service/controller code
 * - Single Responsibility: Module only configures deals-related components
 * 
 * Services:
 * - DealsService: Core deal business logic
 * - AffiliateService: Affiliate URL tagging and validation
 */
@Module({
  imports: [TypeOrmModule.forFeature([Deal])],
  controllers: [DealsController],
  providers: [
    DealsService,
    AffiliateService,
    TypeOrmDealsRepository,
    // Bind the interface token to the concrete implementation
    // This enables dependency injection based on the interface
    {
      provide: DEALS_REPOSITORY,
      useClass: TypeOrmDealsRepository,
    },
  ],
  exports: [DealsService, AffiliateService],
})
export class DealsModule {}
