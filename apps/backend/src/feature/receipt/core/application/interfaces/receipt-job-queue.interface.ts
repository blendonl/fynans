export type ReceiptJobStatus =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'not_found';

export interface ReceiptJobResult<T = unknown> {
  status: ReceiptJobStatus;
  data?: T;
  error?: string;
  progress?: number;
  isPartial?: boolean;
}

export interface ReceiptJobMeta {
  receiptId?: string;
  familyId?: string;
}

export interface IReceiptJobQueue {
  addJob(imageBuffer: Buffer, userId?: string, meta?: ReceiptJobMeta): Promise<string>;
  getJobStatus(jobId: string): Promise<ReceiptJobStatus>;
  getJobResult(jobId: string): Promise<ReceiptJobResult>;
  streamJobProgress(
    jobId: string,
    onEvent: (event: ReceiptJobResult) => void,
    signal?: AbortSignal,
  ): Promise<void>;
}
