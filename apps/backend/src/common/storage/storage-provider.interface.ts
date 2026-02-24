export interface IStorageProvider {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  getPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
