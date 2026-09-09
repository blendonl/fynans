import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  EMAIL_SENDER,
  EmailSender,
} from '../../../../../common/email/email-sender.interface';
import { createBetterAuthInstance } from '../config/better-auth.config';

@Injectable()
export class BetterAuthProvider {
  public readonly auth: ReturnType<typeof createBetterAuthInstance>;

  constructor(
    prisma: PrismaService,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
  ) {
    this.auth = createBetterAuthInstance(prisma, emailSender);
  }
}
