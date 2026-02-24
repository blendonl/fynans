import { Module } from '@nestjs/common';
import { ReceiptCoreModule } from '../core/receipt-core.module';
import { ReceiptController } from './controllers/receipt.controller';
import { StoredReceiptController } from './controllers/stored-receipt.controller';

@Module({
  imports: [ReceiptCoreModule],
  controllers: [ReceiptController, StoredReceiptController],
})
export class ReceiptRestModule {}
