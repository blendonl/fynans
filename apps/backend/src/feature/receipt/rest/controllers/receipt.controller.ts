import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IReceiptJobQueue } from '../../core/application/interfaces/receipt-job-queue.interface';
import { ProcessedReceiptResponseDto } from '../dto/processed-receipt-response.dto';
import { EnrichedReceiptDataDto } from '../../core/application/dto/enriched-receipt-data.dto';
import { CurrentUser } from '~feature/auth/rest/decorators/current-user.decorator';
import { User } from '~feature/user/core/domain/entities/user.entity';

@Controller('receipts')
export class ReceiptController {
  constructor(
    @Inject('ReceiptJobQueue')
    private readonly receiptJobQueue: IReceiptJobQueue,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
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
  async processReceipt(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const jobId = await this.receiptJobQueue.addJob(file.buffer, user.id);

    return { jobId, status: 'processing' };
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const result = await this.receiptJobQueue.getJobResult(jobId);

    if (result.status === 'not_found') {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    if (result.status === 'completed' && result.data) {
      return {
        ...result,
        data: ProcessedReceiptResponseDto.fromData(
          result.data as unknown as EnrichedReceiptDataDto,
        ),
      };
    }

    return result;
  }
}
