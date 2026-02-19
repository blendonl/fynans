import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TesseractOcrService } from './infrastructure/services/tesseract-ocr.service';
import { PaddleOcrHttpService } from './infrastructure/services/paddleocr-http.service';
import { OllamaModule } from './ollama.module';
import { DonutHttpService } from './infrastructure/services/donut-http.service';
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
import { AlbanianReceiptParser } from './infrastructure/services/parsers/albanian-receipt.parser';
import { AlbanianStoreNameParser } from './infrastructure/services/parsers/implementations/albanian/albanian-store-name.parser';
import { AlbanianStoreLocationParser } from './infrastructure/services/parsers/implementations/albanian/albanian-store-location.parser';
import { AlbanianDateParser } from './infrastructure/services/parsers/implementations/albanian/albanian-date.parser';
import { AlbanianTimeParser } from './infrastructure/services/parsers/implementations/albanian/albanian-time.parser';
import { AlbanianItemsParser } from './infrastructure/services/parsers/implementations/albanian/albanian-items.parser';
import { AlbanianTotalParser } from './infrastructure/services/parsers/implementations/albanian/albanian-total.parser';
import { GenericReceiptParser } from './infrastructure/services/parsers/generic-receipt.parser';
import { GenericStoreNameParser } from './infrastructure/services/parsers/implementations/generic/generic-store-name.parser';
import { GenericStoreLocationParser } from './infrastructure/services/parsers/implementations/generic/generic-store-location.parser';
import { GenericDateParser } from './infrastructure/services/parsers/implementations/generic/generic-date.parser';
import { GenericTimeParser } from './infrastructure/services/parsers/implementations/generic/generic-time.parser';
import { GenericItemsParser } from './infrastructure/services/parsers/implementations/generic/generic-items.parser';
import { GenericTotalParser } from './infrastructure/services/parsers/implementations/generic/generic-total.parser';
import { VisionReceiptParser } from './infrastructure/services/parsers/vision-receipt.parser';
import { DonutReceiptParser } from './infrastructure/services/parsers/donut-receipt.parser';
import { ReceiptPostProcessor } from './infrastructure/services/receipt-post-processor';
import { IReceiptParser } from './application/services/receipt-parser.service';

@Module({
  imports: [
    ConfigModule,
    OllamaModule,
    StoreCoreModule,
    ItemCoreModule,
    StoreItemCategoryCoreModule,
    ExpenseCategoryCoreModule,
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
    DonutHttpService,
    DonutReceiptParser,
    VisionReceiptParser,
    {
      provide: 'VisionParser',
      useFactory: (
        configService: ConfigService,
        donutParser: DonutReceiptParser,
        visionParser: VisionReceiptParser,
      ): IReceiptParser | undefined => {
        const visionParserType = configService.get<string>('VISION_PARSER');
        if (visionParserType === 'donut') return donutParser;
        if (configService.get<string>('OLLAMA_VISION_MODEL')) return visionParser;
        return undefined;
      },
      inject: [ConfigService, DonutReceiptParser, VisionReceiptParser],
    },
    LlmReceiptParser,
    AlbanianStoreNameParser,
    AlbanianStoreLocationParser,
    AlbanianDateParser,
    AlbanianTimeParser,
    AlbanianItemsParser,
    AlbanianTotalParser,
    AlbanianReceiptParser,
    GenericStoreNameParser,
    GenericStoreLocationParser,
    GenericDateParser,
    GenericTimeParser,
    GenericItemsParser,
    GenericTotalParser,
    GenericReceiptParser,
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
