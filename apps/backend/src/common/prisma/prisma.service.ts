import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { Prisma } from 'prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type PostCommitHook = () => Promise<unknown>;

interface TransactionScope {
  client: Prisma.TransactionClient;
  postCommitHooks: PostCommitHook[];
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly scope = new AsyncLocalStorage<TransactionScope>();

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }

  get db(): Prisma.TransactionClient {
    return this.scope.getStore()?.client ?? this;
  }

  get hasActiveTransaction(): boolean {
    return this.scope.getStore() !== undefined;
  }

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    if (this.scope.getStore()) {
      return work();
    }

    const postCommitHooks: PostCommitHook[] = [];
    const result = await this.$transaction((client) =>
      this.scope.run({ client, postCommitHooks }, work),
    );

    for (const hook of postCommitHooks) {
      await hook();
    }

    return result;
  }

  async afterCommit(hook: PostCommitHook): Promise<void> {
    const scope = this.scope.getStore();

    if (!scope) {
      await hook();
      return;
    }

    scope.postCommitHooks.push(hook);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
