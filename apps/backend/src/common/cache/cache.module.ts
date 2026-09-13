import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_STORE, ICacheStore } from './domain/cache-store.interface';
import { InMemoryCacheStore } from './infrastructure/in-memory-cache.store';
import { RedisCacheStore } from './infrastructure/redis-cache.store';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_STORE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ICacheStore => {
        const host = configService.get<string>('REDIS_HOST');
        const inProcess = new InMemoryCacheStore();

        if (!host) {
          return inProcess;
        }

        return new RedisCacheStore(
          { host, port: configService.get<number>('REDIS_PORT', 6379) },
          inProcess,
        );
      },
    },
  ],
  exports: [CACHE_STORE],
})
export class CacheModule {}
