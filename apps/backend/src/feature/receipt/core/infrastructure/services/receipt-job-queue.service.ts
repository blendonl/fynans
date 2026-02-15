import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  IReceiptJobQueue,
  ReceiptJobStatus,
  ReceiptJobResult,
} from '../../application/interfaces/receipt-job-queue.interface';

@Injectable()
export class ReceiptJobQueueService implements IReceiptJobQueue {
  private readonly logger = new Logger(ReceiptJobQueueService.name);

  constructor(
    @InjectQueue('receipt-processing')
    private readonly queue: Queue,
  ) {}

  async addJob(imageBuffer: Buffer, userId?: string): Promise<string> {
    const job = await this.queue.add(
      'process-receipt',
      {
        imageBase64: imageBuffer.toString('base64'),
        userId,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 86_400 },
        removeOnFail: { age: 86_400 },
      },
    );

    this.logger.log(`Receipt job created: ${job.id}`);
    return job.id!;
  }

  async getJobStatus(jobId: string): Promise<ReceiptJobStatus> {
    const job = await this.queue.getJob(jobId);
    if (!job) return 'not_found';

    const state = await job.getState();

    const stateMap: Record<string, ReceiptJobStatus> = {
      waiting: 'waiting',
      delayed: 'waiting',
      active: 'active',
      completed: 'completed',
      failed: 'failed',
    };

    return stateMap[state] ?? 'waiting';
  }

  async getJobResult(jobId: string): Promise<ReceiptJobResult> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const status = await this.getJobStatus(jobId);
    const progress =
      typeof job.progress === 'number' ? job.progress : undefined;

    if (status === 'completed') {
      return {
        status,
        data: job.returnvalue,
        progress: 100,
      };
    }

    if (status === 'failed') {
      return {
        status,
        error: job.failedReason ?? 'Unknown error',
        progress,
      };
    }

    return { status, progress };
  }
}
