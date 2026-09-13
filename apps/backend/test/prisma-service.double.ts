import { PrismaService } from '~common/prisma/prisma.service';

export function createPrismaServiceDouble(
  db: Record<string, unknown> = {},
): PrismaService {
  return {
    db,
    hasActiveTransaction: false,
    runInTransaction: <T>(work: () => Promise<T>) => work(),
    afterCommit: (hook: () => Promise<unknown>) => hook(),
  } as unknown as PrismaService;
}
