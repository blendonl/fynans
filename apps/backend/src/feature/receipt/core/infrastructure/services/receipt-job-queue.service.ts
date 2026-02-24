import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueEvents } from 'bullmq';
import {
  IReceiptJobQueue,
  ReceiptJobStatus,
  ReceiptJobResult,
  ReceiptJobOptions,
} from '../../application/interfaces/receipt-job-queue.interface';

@Injectable()
export class ReceiptJobQueueService implements IReceiptJobQueue {
  private readonly logger = new Logger(ReceiptJobQueueService.name);
  private readonly redisConnection: { host: string; port: number };

  constructor(
    @InjectQueue('receipt-processing')
    private readonly queue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.redisConnection = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    };
  }

  async addJob(imageBuffer: Buffer, userId?: string, options?: ReceiptJobOptions): Promise<string> {
    const job = await this.queue.add(
      'process-receipt',
      {
        imageBase64: imageBuffer.toString('base64'),
        userId,
        autoCreatePending: options?.autoCreatePending,
        familyId: options?.familyId,
        paymentMethodId: options?.paymentMethodId,
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

  async streamJobProgress(
    jobId: string,
    onEvent: (event: ReceiptJobResult) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    // Check if job already finished before subscribing
    const current = await this.getJobResult(jobId);
    if (current.status === 'completed' || current.status === 'failed') {
      onEvent(current);
      return;
    }
    if (current.status === 'not_found') {
      onEvent(current);
      return;
    }

    // Emit current state as initial event
    onEvent(current);

    const queueEvents = new QueueEvents('receipt-processing', {
      connection: this.redisConnection,
    });

    try {
      await queueEvents.waitUntilReady();

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          queueEvents.removeAllListeners();
          queueEvents.close().catch(() => {});
        };

        signal?.addEventListener('abort', () => {
          cleanup();
          resolve();
        });

        queueEvents.on('progress', ({ jobId: jId, data }) => {
          if (jId !== jobId) return;

          // Handle structured progress objects (partial results)
          if (data && typeof data === 'object' && 'type' in data && (data as any).type === 'partial-result') {
            const structured = data as { type: string; percent: number; data: unknown };
            onEvent({
              status: 'active',
              progress: structured.percent,
              data: structured.data,
              isPartial: true,
            });
            return;
          }

          const progress = typeof data === 'number' ? data : undefined;
          onEvent({ status: 'active', progress });
        });

        queueEvents.on('completed', async ({ jobId: jId }) => {
          if (jId !== jobId) return;
          const result = await this.getJobResult(jobId);
          onEvent(result);
          cleanup();
          resolve();
        });

        queueEvents.on('failed', async ({ jobId: jId, failedReason }) => {
          if (jId !== jobId) return;
          onEvent({
            status: 'failed',
            error: failedReason || 'Unknown error',
          });
          cleanup();
          resolve();
        });

        queueEvents.on('error', (err) => {
          this.logger.error(`QueueEvents error for job ${jobId}: ${err.message}`);
          cleanup();
          reject(err);
        });
      });
    } catch (error) {
      await queueEvents.close().catch(() => {});
      throw error;
    }
  }
}
