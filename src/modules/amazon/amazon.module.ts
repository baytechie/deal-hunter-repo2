import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmazonPaapiService } from './services/amazon-paapi.service';
import { SharedModule } from '../../shared/shared.module';

/**
 * AmazonModule provides Amazon PAAPI integration services.
 */
@Module({
  imports: [ConfigModule, SharedModule],
  providers: [AmazonPaapiService],
  exports: [AmazonPaapiService],
})
export class AmazonModule {}
