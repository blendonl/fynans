import { Server } from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DomainExceptionFilter } from '~common/filters/domain-exception.filter';
import { VerifyFamilyAccessUseCase } from '~common/authorization/application/use-cases/verify-family-access.use-case';
import { VerifyResourceAccessUseCase } from '~common/authorization/application/use-cases/verify-resource-access.use-case';
import { FamilyScopeGuard } from '~common/authorization/rest/guards/family-scope.guard';
import { ResourceOwnershipGuard } from '~common/authorization/rest/guards/resource-ownership.guard';
import { FamilyMemberRole } from '~common/authorization/domain/family-role';
import {
  OwnedResource,
  ResourceOwner,
} from '~common/authorization/domain/owned-resource';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  IFamilyMembershipRepository,
} from '~common/authorization/domain/repositories/family-membership.repository.interface';
import {
  RESOURCE_OWNER_REPOSITORY,
  IResourceOwnerRepository,
} from '~common/authorization/domain/repositories/resource-owner.repository.interface';
import { RecalculateBalanceUseCase } from '~feature/payment-method/core/application/use-cases/recalculate-balance.use-case';
import { CreateTransactionUseCase } from '../../core/application/use-cases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from '../../core/application/use-cases/get-transaction-by-id.use-case';
import { ListTransactionsUseCase } from '../../core/application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from '../../core/application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../core/application/use-cases/delete-transaction.use-case';
import { GetTransactionStatisticsUseCase } from '../../core/application/use-cases/get-transaction-statistics.use-case';
import { GetTransactionStatisticsComparisonUseCase } from '../../core/application/use-cases/get-transaction-statistics-comparison.use-case';
import { TransactionController } from './transaction.controller';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OUTSIDER = '22222222-2222-4222-8222-222222222222';
const CO_MEMBER = '33333333-3333-4333-8333-333333333333';
const FAMILY = '44444444-4444-4444-8444-444444444444';

const PERSONAL_TRANSACTION = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FAMILY_TRANSACTION = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const transactionOf = (id: string) => ({
  id,
  userId: MEMBER,
  type: 'EXPENSE',
  scope: 'PERSONAL',
  status: 'CONFIRMED',
  value: { toNumber: () => 10 },
  paymentMethodId: undefined,
  rejectionReason: undefined,
  recordedAt: new Date('2026-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  user: { id: MEMBER, firstName: 'A', lastName: 'B' },
});

const TRANSACTION_OWNERS: Record<string, ResourceOwner> = {
  [PERSONAL_TRANSACTION]: { userId: MEMBER, familyId: null },
  [FAMILY_TRANSACTION]: { userId: MEMBER, familyId: FAMILY },
};

const FAMILY_ROLES: Record<string, FamilyMemberRole> = {
  [MEMBER]: FamilyMemberRole.OWNER,
  [CO_MEMBER]: FamilyMemberRole.MEMBER,
};

describe('TransactionController authorization', () => {
  let app: INestApplication;
  let server: Server;
  let currentUserId: string;

  const listTransactionsUseCase = { execute: jest.fn() };
  const getTransactionStatisticsUseCase = { execute: jest.fn() };
  const getTransactionStatisticsComparisonUseCase = { execute: jest.fn() };
  const getTransactionByIdUseCase = { execute: jest.fn() };
  const updateTransactionUseCase = { execute: jest.fn() };
  const deleteTransactionUseCase = { execute: jest.fn() };

  const resourceOwnerRepository: IResourceOwnerRepository = {
    findOwner: (_resource: OwnedResource, resourceId: string) =>
      Promise.resolve(TRANSACTION_OWNERS[resourceId] ?? null),
  };

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: (familyId: string, userId: string) =>
      Promise.resolve(familyId === FAMILY && userId in FAMILY_ROLES),
    findRole: (familyId: string, userId: string) =>
      Promise.resolve(
        familyId === FAMILY ? (FAMILY_ROLES[userId] ?? null) : null,
      ),
    findFamilyIds: (userId: string) =>
      Promise.resolve(userId in FAMILY_ROLES ? [FAMILY] : []),
    findCoMemberUserIds: (userId: string) => Promise.resolve([userId]),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: { execute: jest.fn() } },
        {
          provide: GetTransactionByIdUseCase,
          useValue: getTransactionByIdUseCase,
        },
        { provide: ListTransactionsUseCase, useValue: listTransactionsUseCase },
        {
          provide: UpdateTransactionUseCase,
          useValue: updateTransactionUseCase,
        },
        {
          provide: DeleteTransactionUseCase,
          useValue: deleteTransactionUseCase,
        },
        {
          provide: GetTransactionStatisticsUseCase,
          useValue: getTransactionStatisticsUseCase,
        },
        {
          provide: GetTransactionStatisticsComparisonUseCase,
          useValue: getTransactionStatisticsComparisonUseCase,
        },
        {
          provide: RecalculateBalanceUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RESOURCE_OWNER_REPOSITORY,
          useValue: resourceOwnerRepository,
        },
        {
          provide: FAMILY_MEMBERSHIP_REPOSITORY,
          useValue: familyMembershipRepository,
        },
        VerifyResourceAccessUseCase,
        VerifyFamilyAccessUseCase,
        ResourceOwnershipGuard,
        FamilyScopeGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: { id: string } }).user = { id: currentUserId };
      next();
    });
    app.useGlobalGuards(app.get(FamilyScopeGuard));
    app.useGlobalFilters(new DomainExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    server = app.getHttpServer() as Server;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    listTransactionsUseCase.execute.mockResolvedValue({ data: [], total: 0 });
    getTransactionStatisticsUseCase.execute.mockResolvedValue({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      count: 0,
    });
    getTransactionByIdUseCase.execute.mockImplementation((id: string) =>
      Promise.resolve(transactionOf(id)),
    );
    updateTransactionUseCase.execute.mockImplementation((id: string) =>
      Promise.resolve(transactionOf(id)),
    );
    deleteTransactionUseCase.execute.mockResolvedValue(undefined);
  });

  describe('family-scoped listings', () => {
    it("rejects listing another family's transactions", async () => {
      currentUserId = OUTSIDER;

      await request(server).get(`/transactions?familyId=${FAMILY}`).expect(403);

      expect(listTransactionsUseCase.execute).not.toHaveBeenCalled();
    });

    it('lists transactions for a family the caller belongs to', async () => {
      currentUserId = CO_MEMBER;

      await request(server).get(`/transactions?familyId=${FAMILY}`).expect(200);

      expect(listTransactionsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ familyId: FAMILY, userId: undefined }),
        expect.anything(),
      );
    });

    it('scopes a personal listing to the caller without a membership lookup', async () => {
      currentUserId = OUTSIDER;

      await request(server).get('/transactions').expect(200);

      expect(listTransactionsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: OUTSIDER, familyId: undefined }),
        expect.anything(),
      );
    });

    it("rejects another family's statistics", async () => {
      currentUserId = OUTSIDER;

      await request(server)
        .get(`/transactions/statistics?familyId=${FAMILY}`)
        .expect(403);

      expect(getTransactionStatisticsUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe("a second user against another user's transaction id", () => {
    beforeEach(() => {
      currentUserId = OUTSIDER;
    });

    it('cannot read it', async () => {
      await request(server)
        .get(`/transactions/${PERSONAL_TRANSACTION}`)
        .expect(404);

      expect(getTransactionByIdUseCase.execute).not.toHaveBeenCalled();
    });

    it('cannot rewrite its amount', async () => {
      await request(server)
        .put(`/transactions/${PERSONAL_TRANSACTION}`)
        .send({ value: 999 })
        .expect(404);

      expect(updateTransactionUseCase.execute).not.toHaveBeenCalled();
    });

    it('cannot delete it', async () => {
      await request(server)
        .delete(`/transactions/${PERSONAL_TRANSACTION}`)
        .expect(404);

      expect(deleteTransactionUseCase.execute).not.toHaveBeenCalled();
    });

    it('cannot reach a family transaction it has no membership for', async () => {
      await request(server)
        .get(`/transactions/${FAMILY_TRANSACTION}`)
        .expect(404);

      expect(getTransactionByIdUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('the owner and their family', () => {
    it('reads their own transaction', async () => {
      currentUserId = MEMBER;

      await request(server)
        .get(`/transactions/${PERSONAL_TRANSACTION}`)
        .expect(200);

      expect(getTransactionByIdUseCase.execute).toHaveBeenCalledWith(
        PERSONAL_TRANSACTION,
      );
    });

    it('lets a family co-member read a family-scoped transaction', async () => {
      currentUserId = CO_MEMBER;

      await request(server)
        .get(`/transactions/${FAMILY_TRANSACTION}`)
        .expect(200);
    });

    it('lets a family co-member not reach a personal transaction', async () => {
      currentUserId = CO_MEMBER;

      await request(server)
        .get(`/transactions/${PERSONAL_TRANSACTION}`)
        .expect(404);
    });
  });

  describe('writes stay owner-only even inside the family', () => {
    beforeEach(() => {
      currentUserId = CO_MEMBER;
    });

    it('refuses to let a co-member rewrite a family transaction', async () => {
      await request(server)
        .put(`/transactions/${FAMILY_TRANSACTION}`)
        .send({ value: 999 })
        .expect(404);

      expect(updateTransactionUseCase.execute).not.toHaveBeenCalled();
    });

    it('refuses to let a co-member delete a family transaction', async () => {
      await request(server)
        .delete(`/transactions/${FAMILY_TRANSACTION}`)
        .expect(404);

      expect(deleteTransactionUseCase.execute).not.toHaveBeenCalled();
    });

    it('still lets the owner rewrite their family transaction', async () => {
      currentUserId = MEMBER;

      await request(server)
        .put(`/transactions/${FAMILY_TRANSACTION}`)
        .send({ value: 999 })
        .expect(200);

      expect(updateTransactionUseCase.execute).toHaveBeenCalled();
    });

    it('still lets the owner delete their family transaction', async () => {
      currentUserId = MEMBER;

      await request(server)
        .delete(`/transactions/${FAMILY_TRANSACTION}`)
        .expect(204);

      expect(deleteTransactionUseCase.execute).toHaveBeenCalledWith(
        FAMILY_TRANSACTION,
      );
    });

    it('refuses a complete stranger', async () => {
      currentUserId = OUTSIDER;

      await request(server)
        .put(`/transactions/${FAMILY_TRANSACTION}`)
        .send({ value: 999 })
        .expect(404);

      expect(updateTransactionUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
