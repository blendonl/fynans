import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcessReceiptUseCase } from '../../core/application/use-cases/process-receipt.use-case';
import { EnrichReceiptDataUseCase } from '../../core/application/use-cases/enrich-receipt-data.use-case';
import { ProcessedReceiptResponseDto } from '../dto/processed-receipt-response.dto';

@Controller('receipts')
export class ReceiptController {
  constructor(
    private readonly processReceiptUseCase: ProcessReceiptUseCase,
    private readonly enrichReceiptDataUseCase: EnrichReceiptDataUseCase,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpeg|jpg|png)/)) {
          return cb(
            new BadRequestException('Only JPEG and PNG images are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async processReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const processedResult = await this.processReceiptUseCase.execute(
      file.buffer,
    );

    const enrichedResult =
      await this.enrichReceiptDataUseCase.execute(processedResult);

    return ProcessedReceiptResponseDto.fromData(enrichedResult);
  }
}
