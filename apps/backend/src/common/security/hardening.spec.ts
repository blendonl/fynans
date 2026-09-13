import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';
import { AppModule } from '~app.module';
import { ReceiptController } from '~feature/receipt/rest/controllers/receipt.controller';

const GLOBAL_LIMIT = 120;

describe('baseline hardening', () => {
  it('registers ThrottlerGuard globally so throttle metadata is enforced', () => {
    const providers = Reflect.getMetadata('providers', AppModule) as Array<{
      provide?: unknown;
      useClass?: unknown;
    }>;

    const globalGuards = providers
      .filter((provider) => provider?.provide === APP_GUARD)
      .map((provider) => provider.useClass);

    expect(globalGuards).toContain(ThrottlerGuard);
  });

  it('throttles receipt processing far tighter than the global default', () => {
    const handler = Object.getOwnPropertyDescriptor(
      ReceiptController.prototype,
      'processReceipt',
    )?.value as object;

    const limit = Reflect.getMetadata(
      `${THROTTLER_LIMIT}default`,
      handler,
    ) as number;
    const ttl = Reflect.getMetadata(
      `${THROTTLER_TTL}default`,
      handler,
    ) as number;

    expect(limit).toBeLessThan(GLOBAL_LIMIT);
    expect(ttl).toBeGreaterThan(0);
  });
});
