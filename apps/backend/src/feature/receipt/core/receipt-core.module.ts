import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TesseractOcrService } from './infrastructure/services/tesseract-ocr.service';
import { PaddleOcrHttpService } from './infrastructure/services/paddleocr-http.service';
import { OllamaModule } from './ollama.module';
import { ReceiptJobQueueService } from './infrastructure/services/receipt-job-queue.service';
import { ReceiptProcessingWorker } from './infrastructure/workers/receipt-processing.worker';
import { ProcessReceiptUseCase } from './application/use-cases/process-receipt.use-case';
import { EnrichReceiptDataUseCase } from './application/use-cases/enrich-receipt-data.use-case';
import { IOcrService } from './application/services/ocr.service';
import { ReceiptParserFactory } from './infrastructure/services/parsers/parser-factory.service';
import { LlmReceiptParser } from './infrastructure/services/parsers/llm-receipt.parser';
import { StoreCoreModule } from '~feature/store/core/store-core.module';
import { ItemCoreModule } from '~feature/item/core/item-core.module';
import { StoreItemCategoryCoreModule } from '~feature/store-item-category/core/store-item-category-core.module';
import { ExpenseCategoryCoreModule } from '~feature/expense-category/core/expense-category-core.module';
import { AutoCreateCategoriesUseCase } from './application/use-cases/auto-create-categories.use-case';
import { ReceiptPostProcessor } from './infrastructure/services/receipt-post-processor';
import { OpencodeReceiptParser } from './infrastructure/services/parsers/opencode-receipt.parser';
import { ItemNameNormalizerService } from './infrastructure/services/parsers/item-name-normalizer.service';
import { ExpenseCoreModule } from '~feature/expense/core/expense-core.module';

@Module({
  imports: [
    ConfigModule,
    OllamaModule,
    StoreCoreModule,
    ItemCoreModule,
    StoreItemCategoryCoreModule,
    ExpenseCategoryCoreModule,
    forwardRef(() => ExpenseCoreModule),
    BullModule.registerQueue({ name: 'receipt-processing' }),
  ],
  providers: [
    {
      provide: 'OcrService',
      useFactory: (configService: ConfigService): IOcrService => {
        const engine = configService.get<string>('OCR_ENGINE', 'paddleocr');
        return engine === 'paddleocr'
          ? new PaddleOcrHttpService(configService)
          : new TesseractOcrService();
      },
      inject: [ConfigService],
    },
    {
      provide: 'ReceiptJobQueue',
      useClass: ReceiptJobQueueService,
    },
    ReceiptProcessingWorker,
    ReceiptPostProcessor,
    ItemNameNormalizerService,
    {
      provide: 'OpencodeParser',
      useFactory: (
        config: ConfigService,
        postProcessor: ReceiptPostProcessor,
        nameNormalizer: ItemNameNormalizerService,
      ): OpencodeReceiptParser | undefined => {
        const enabled = config.get<string>('OPENCODE_ENABLED', 'true') === 'true';
        if (!enabled) return undefined;
        return new OpencodeReceiptParser(config, postProcessor, nameNormalizer);
      },
      inject: [ConfigService, ReceiptPostProcessor, ItemNameNormalizerService],
    },
    LlmReceiptParser,
    {
      provide: 'ReceiptParserService',
      useClass: ReceiptParserFactory,
    },
    AutoCreateCategoriesUseCase,
    ProcessReceiptUseCase,
    EnrichReceiptDataUseCase,
  ],
  exports: [
    ProcessReceiptUseCase,
    EnrichReceiptDataUseCase,
    'ReceiptJobQueue',
  ],
})
export class ReceiptCoreModule {}
