import { Module } from '@nestjs/common';
import { BasketCoreModule } from '../core/basket-core.module';
import { BasketController } from './controllers/basket.controller';

@Module({
  imports: [BasketCoreModule],
  controllers: [BasketController],
})
export class BasketRestModule {}
