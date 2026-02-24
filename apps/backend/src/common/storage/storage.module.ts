import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioStorageService } from './minio-storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'StorageProvider',
      useClass: MinioStorageService,
    },
  ],
  exports: ['StorageProvider'],
})
export class StorageModule {}
