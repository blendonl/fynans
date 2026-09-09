import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaService } from '~common/prisma/prisma.service';
import { StorageModule } from '~common/storage/storage.module';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { UserAccountDeletionModule } from './user-account-deletion.module';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';
import { PrismaAccountEraser } from './infrastructure/repositories/prisma-account-eraser';
import { BetterAuthAccountAuthenticator } from './infrastructure/services/better-auth-account-authenticator';
import { BetterAuthSessionRevoker } from './infrastructure/services/better-auth-session-revoker';
import { ACCOUNT_ERASER } from './domain/repositories/account-eraser.interface';
import { ACCOUNT_AUTHENTICATOR } from './domain/services/account-authenticator.interface';
import { SESSION_REVOKER } from './domain/services/session-revoker.interface';

async function compileAccountDeletion() {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      StorageModule,
      UserAccountDeletionModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(createPrismaServiceDouble())
    .overrideProvider('StorageProvider')
    .useValue({ delete: jest.fn() })
    .compile();
}

describe('UserAccountDeletionModule', () => {
  it('resolves the deletion use case across the family module boundary', async () => {
    const testingModule = await compileAccountDeletion();

    expect(testingModule.get(DeleteAccountUseCase)).toBeInstanceOf(
      DeleteAccountUseCase,
    );
  });

  const ports: [string, string, unknown][] = [
    ['account eraser', ACCOUNT_ERASER, PrismaAccountEraser],
    [
      'account authenticator',
      ACCOUNT_AUTHENTICATOR,
      BetterAuthAccountAuthenticator,
    ],
    ['session revoker', SESSION_REVOKER, BetterAuthSessionRevoker],
  ];

  it.each(ports)('binds the %s port', async (_name, token, implementation) => {
    const testingModule = await compileAccountDeletion();

    expect(testingModule.get(token)).toBeInstanceOf(implementation as never);
  });
});
