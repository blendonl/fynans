export type ReceiptJobStatus =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'not_found';

export interface ReceiptJobResult {
  status: ReceiptJobStatus;
  data?: Record<string, any>;
  error?: string;
  progress?: number;
}

export interface IReceiptJobQueue {
  addJob(imageBuffer: Buffer, userId?: string): Promise<string>;
  getJobStatus(jobId: string): Promise<ReceiptJobStatus>;
  getJobResult(jobId: string): Promise<ReceiptJobResult>;
}
