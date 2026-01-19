import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DealsModule } from '../deals/deals.module';
import { PendingDealsModule } from '../pending-deals/pending-deals.module';
import { SharedModule } from '../../shared/shared.module';

/**
 * AdminModule provides administrative endpoints for managing the application.
 */
@Module({
  imports: [DealsModule, PendingDealsModule, SharedModule],
  controllers: [AdminController],
})
export class AdminModule {}
