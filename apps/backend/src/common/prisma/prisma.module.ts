import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UNIT_OF_WORK } from '../persistence/unit-of-work.interface';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: UNIT_OF_WORK, useExisting: PrismaService },
  ],
  exports: [PrismaService, UNIT_OF_WORK],
})
export class PrismaModule {}
