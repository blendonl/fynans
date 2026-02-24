import {
  Controller,
  Post,
  Get,
  Sse,
  Param,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  MessageEvent,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Observable } from 'rxjs';
import {
  IReceiptJobQueue,
  ReceiptJobResult,
} from '../../core/application/interfaces/receipt-job-queue.interface';
import { SaveReceiptFileUseCase } from '../../core/application/use-cases/save-receipt-file.use-case';
import { ProcessedReceiptResponseDto } from '../dto/processed-receipt-response.dto';
import { ProcessReceiptBodyDto } from '../dto/process-receipt-body.dto';
import { EnrichedReceiptDataDto } from '../../core/application/dto/enriched-receipt-data.dto';
import { CurrentUser } from '~feature/auth/rest/decorators/current-user.decorator';
import { User } from '~feature/user/core/domain/entities/user.entity';

class ProcessReceiptResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty({ example: 'processing' })
  status: string;
}

class ReceiptJobStatusResponseDto {
  @ApiProperty({ enum: ['waiting', 'active', 'completed', 'failed', 'not_found'] })
  status: string;

  @ApiPropertyOptional({ type: () => ProcessedReceiptResponseDto })
  data?: ProcessedReceiptResponseDto;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  progress?: number;

  @ApiPropertyOptional()
  isPartial?: boolean;
}

class ReceiptUploadBodyDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

@ApiTags('Receipt')
@ApiBearerAuth('bearer')
@Controller('receipts')
export class ReceiptController {
  private readonly logger = new Logger(ReceiptController.name);

  constructor(
    @Inject('ReceiptJobQueue')
    private readonly receiptJobQueue: IReceiptJobQueue,
    private readonly saveReceiptFileUseCase: SaveReceiptFileUseCase,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Upload and process a receipt image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ReceiptUploadBodyDto })
  @ApiResponse({ status: 202, type: ProcessReceiptResponseDto })
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
  async processReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ProcessReceiptBodyDto,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    let receiptId: string | undefined;
    try {
      const stored = await this.saveReceiptFileUseCase.execute({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId: user.id,
        familyId: body.familyId,
      });
      receiptId = stored.id;
    } catch (error) {
      this.logger.error(
        `Failed to store receipt file: ${error instanceof Error ? error.message : error}`,
      );
    }

    const jobId = await this.receiptJobQueue.addJob(file.buffer, user.id, {
      receiptId,
      familyId: body.familyId,
    });

    return { jobId, status: 'processing', receiptId };
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get receipt processing job status and result' })
  @ApiResponse({ status: 200, type: ReceiptJobStatusResponseDto })
  async getJobStatus(@Param('jobId') jobId: string) {
    const result =
      await this.receiptJobQueue.getJobResult(jobId) as ReceiptJobResult<EnrichedReceiptDataDto>;

    if (result.status === 'not_found') {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    if (result.status === 'completed' && result.data) {
      return {
        ...result,
        data: ProcessedReceiptResponseDto.fromData(result.data),
      };
    }

    return result;
  }

  @Sse('jobs/:jobId/stream')
  @ApiOperation({ summary: 'Stream receipt processing job progress via SSE' })
  @ApiResponse({ status: 200, description: 'SSE stream of job progress events' })
  streamJobProgress(
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const abortController = new AbortController();

      req.on('close', () => abortController.abort());

      this.receiptJobQueue
        .streamJobProgress(
          jobId,
          (event) => {
            const typedEvent = event as ReceiptJobResult<EnrichedReceiptDataDto>;
            let data: Record<string, unknown> = {
              status: typedEvent.status,
              progress: typedEvent.progress,
            };

            if (typedEvent.isPartial && typedEvent.data) {
              const responseDto = ProcessedReceiptResponseDto.fromData(typedEvent.data);
              data = {
                ...data,
                data: responseDto,
                isPartial: true,
              };
              this.logger.log(
                `SSE [${jobId}] partial: store="${responseDto.store?.name}", ${responseDto.items.length} items, progress=${typedEvent.progress}%`,
              );
              this.logger.debug(
                `SSE [${jobId}] partial items: ${JSON.stringify(responseDto.items.map((i) => ({ name: i.name, nameEn: i.nameEn, size: i.size, price: i.price })))}`,
              );
            } else if (typedEvent.status === 'completed' && typedEvent.data) {
              const responseDto = ProcessedReceiptResponseDto.fromData(typedEvent.data);
              data = {
                ...data,
                data: responseDto,
              };
              this.logger.log(
                `SSE [${jobId}] completed: store="${responseDto.store?.name}", ${responseDto.items.length} items, ` +
                `expenseCategory="${responseDto.suggestedExpenseCategory?.name ?? 'none'}"`,
              );
              this.logger.debug(
                `SSE [${jobId}] final items: ${JSON.stringify(responseDto.items.map((i) => ({ name: i.name, nameEn: i.nameEn, size: i.size, categoryId: i.resolvedCategoryId })))}`,
              );
            } else {
              this.logger.debug(
                `SSE [${jobId}] ${typedEvent.status}: progress=${typedEvent.progress}%`,
              );
            }

            if (typedEvent.error) {
              data.error = typedEvent.error;
              this.logger.error(`SSE [${jobId}] error: ${typedEvent.error}`);
            }

            subscriber.next({ data });

            if (
              typedEvent.status === 'completed' ||
              typedEvent.status === 'failed' ||
              typedEvent.status === 'not_found'
            ) {
              subscriber.complete();
            }
          },
          abortController.signal,
        )
        .catch((err) => subscriber.error(err));
    });
  }
}
