import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { ReceiptController } from './receipt.controller';
import { StoredReceiptController } from './stored-receipt.controller';

type Handler = (...args: unknown[]) => unknown;

function routesOf(controller: new (...args: never[]) => object): string[] {
  const base = Reflect.getMetadata(PATH_METADATA, controller) as string;
  const proto = controller.prototype as Record<string, Handler>;

  return Object.getOwnPropertyNames(proto)
    .filter((name) => name !== 'constructor')
    .map((name) => {
      const path = Reflect.getMetadata(PATH_METADATA, proto[name]) as
        | string
        | undefined;
      const method = Reflect.getMetadata(METHOD_METADATA, proto[name]) as
        | number
        | undefined;
      if (path === undefined || method === undefined) {
        return null;
      }
      return `${method} /${[base, path].filter((p) => p && p !== '/').join('/')}`;
    })
    .filter((route): route is string => route !== null);
}

describe('receipt route table', () => {
  const jobRoutes = routesOf(ReceiptController);
  const storedRoutes = routesOf(StoredReceiptController);

  it('gives the two controllers distinct base paths', () => {
    expect(Reflect.getMetadata(PATH_METADATA, ReceiptController)).toBe(
      'receipt-jobs',
    );
    expect(Reflect.getMetadata(PATH_METADATA, StoredReceiptController)).toBe(
      'receipts',
    );
  });

  it('no longer lets a job id and a stored receipt id compete for one path', () => {
    expect(jobRoutes).toContain('0 /receipt-jobs/:jobId');
    expect(storedRoutes).toContain('0 /receipts/:id');
    expect(jobRoutes.filter((route) => storedRoutes.includes(route))).toEqual(
      [],
    );
  });

  it('keeps every job route under receipt-jobs', () => {
    expect(jobRoutes).not.toHaveLength(0);
    for (const route of jobRoutes) {
      expect(route).toMatch(/ \/receipt-jobs/);
    }
  });

  it('keeps every stored receipt route under receipts', () => {
    expect(storedRoutes).not.toHaveLength(0);
    for (const route of storedRoutes) {
      expect(route).toMatch(/ \/receipts/);
    }
  });
});
