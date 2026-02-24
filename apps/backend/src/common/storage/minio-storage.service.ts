import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageProvider } from './storage-provider.interface';

@Injectable()
export class MinioStorageService implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'fynans');

    this.client = new S3Client({
      endpoint: this.configService.get<string>(
        'MINIO_ENDPOINT',
        'http://localhost:9000',
      ),
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>(
          'MINIO_ACCESS_KEY',
          'minioadmin',
        ),
        secretAccessKey: this.configService.get<string>(
          'MINIO_SECRET_KEY',
          'minioadmin',
        ),
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
