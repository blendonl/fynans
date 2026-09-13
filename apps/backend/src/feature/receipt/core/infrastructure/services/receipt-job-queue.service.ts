import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueEvents } from 'bullmq';
import {
  IReceiptJobQueue,
  ReceiptJobStatus,
  ReceiptJobResult,
  ReceiptJobMeta,
  ReceiptJobOptions,
} from '../../application/interfaces/receipt-job-queue.interface';

@Injectable()
export class ReceiptJobQueueService
  implements IReceiptJobQueue, OnModuleDestroy
{
  private readonly logger = new Logger(ReceiptJobQueueService.name);
  private readonly redisConnection: { host: string; port: number };
  private queueEvents: QueueEvents | null = null;
  private queueEventsReady: Promise<QueueEvents> | null = null;

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

  async addJob(
    storageKey: string,
    userId?: string,
    options?: ReceiptJobOptions,
    meta?: ReceiptJobMeta,
  ): Promise<string> {
    const job = await this.queue.add(
      'process-receipt',
      {
        storageKey,
        userId,
        receiptId: meta?.receiptId,
        familyId: options?.familyId ?? meta?.familyId,
        autoCreatePending: options?.autoCreatePending,
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

  async findJobOwnerId(jobId: string): Promise<string | null> {
    const job = await this.queue.getJob(jobId);
    const userId = (job?.data as { userId?: string } | undefined)?.userId;
    return userId ?? null;
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

  private async sharedQueueEvents(): Promise<QueueEvents> {
    this.queueEventsReady ??= (async () => {
      const events = new QueueEvents('receipt-processing', {
        connection: this.redisConnection,
      });
      events.setMaxListeners(0);
      await events.waitUntilReady();
      this.queueEvents = events;
      return events;
    })();

    return this.queueEventsReady;
  }

  async onModuleDestroy(): Promise<void> {
    const events = this.queueEvents;
    this.queueEvents = null;
    this.queueEventsReady = null;
    if (events) {
      await events.close().catch(() => undefined);
    }
  }

  async streamJobProgress(
    jobId: string,
    onEvent: (event: ReceiptJobResult) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const current = await this.getJobResult(jobId);
    if (current.status === 'completed' || current.status === 'failed') {
      onEvent(current);
      return;
    }
    if (current.status === 'not_found') {
      onEvent(current);
      return;
    }

    onEvent(current);

    const queueEvents = await this.sharedQueueEvents();

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const finish = (fail?: Error) => {
        if (settled) return;
        settled = true;
        queueEvents.off('progress', onProgress);
        queueEvents.off('completed', onCompleted);
        queueEvents.off('failed', onFailed);
        queueEvents.off('error', onError);
        signal?.removeEventListener('abort', onAbort);
        if (fail) {
          reject(fail);
          return;
        }
        resolve();
      };

      const onProgress = ({
        jobId: jId,
        data,
      }: {
        jobId: string;
        data: unknown;
      }) => {
        if (jId !== jobId) return;

        if (
          data &&
          typeof data === 'object' &&
          'type' in data &&
          (data as { type?: string }).type === 'partial-result'
        ) {
          const structured = data as {
            type: string;
            percent: number;
            data: unknown;
          };
          onEvent({
            status: 'active',
            progress: structured.percent,
            data: structured.data,
            isPartial: true,
          });
          return;
        }

        onEvent({
          status: 'active',
          progress: typeof data === 'number' ? data : undefined,
        });
      };

      const onCompleted = ({ jobId: jId }: { jobId: string }) => {
        if (jId !== jobId) return;
        void this.getJobResult(jobId).then((result) => {
          onEvent(result);
          finish();
        });
      };

      const onFailed = ({
        jobId: jId,
        failedReason,
      }: {
        jobId: string;
        failedReason: string;
      }) => {
        if (jId !== jobId) return;
        onEvent({
          status: 'failed',
          error: failedReason || 'Unknown error',
        });
        finish();
      };

      const onError = (err: Error) => {
        this.logger.error(`QueueEvents error for job ${jobId}: ${err.message}`);
        finish(err);
      };

      const onAbort = () => finish();

      signal?.addEventListener('abort', onAbort);
      queueEvents.on('progress', onProgress);
      queueEvents.on('completed', onCompleted);
      queueEvents.on('failed', onFailed);
      queueEvents.on('error', onError);
    });
  }
}
