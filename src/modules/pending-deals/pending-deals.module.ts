import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingDeal } from './entities/pending-deal.entity';
import { Deal } from '../deals/entities/deal.entity';
import { PendingDealsController } from './pending-deals.controller';
import { PendingDealsService } from './pending-deals.service';
import { TypeOrmPendingDealsRepository } from './repositories/typeorm-pending-deals.repository';
import { PENDING_DEALS_REPOSITORY } from './repositories/pending-deals.repository.interface';
import { AmazonModule } from '../amazon/amazon.module';
import { DealsModule } from '../deals/deals.module';
import { SharedModule } from '../../shared/shared.module';

/**
 * PendingDealsModule provides admin workflow for deal approval.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PendingDeal, Deal]),
    AmazonModule,
    DealsModule,
    SharedModule,
  ],
  controllers: [PendingDealsController],
  providers: [
    PendingDealsService,
    TypeOrmPendingDealsRepository,
    {
      provide: PENDING_DEALS_REPOSITORY,
      useClass: TypeOrmPendingDealsRepository,
    },
  ],
  exports: [PendingDealsService],
})
export class PendingDealsModule {}
