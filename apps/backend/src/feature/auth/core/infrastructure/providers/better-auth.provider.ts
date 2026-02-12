import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { createBetterAuthInstance } from '../config/better-auth.config';

@Injectable()
export class BetterAuthProvider {
  public readonly auth: ReturnType<typeof createBetterAuthInstance>;

  constructor(prisma: PrismaService) {
    this.auth = createBetterAuthInstance(prisma);
  }
}
