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
import { CreateExpenseUseCase } from '../../core/application/use-cases/create-expense.use-case';
import { GetExpenseByIdUseCase } from '../../core/application/use-cases/get-expense-by-id.use-case';
import { ListExpensesUseCase } from '../../core/application/use-cases/list-expenses.use-case';
import { UpdateExpenseUseCase } from '../../core/application/use-cases/update-expense.use-case';
import { DeleteExpenseUseCase } from '../../core/application/use-cases/delete-expense.use-case';
import { GetExpenseStatisticsUseCase } from '../../core/application/use-cases/get-expense-statistics.use-case';
import { GetExpenseTrendsUseCase } from '../../core/application/use-cases/get-expense-trends.use-case';
import { ApprovePendingExpenseUseCase } from '../../core/application/use-cases/approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from '../../core/application/use-cases/reject-pending-expense.use-case';
import { ResubmitRejectedExpenseUseCase } from '../../core/application/use-cases/resubmit-rejected-expense.use-case';
import { UpdatePendingExpenseUseCase } from '../../core/application/use-cases/update-pending-expense.use-case';
import { ExpenseController } from './expense.controller';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OUTSIDER = '22222222-2222-4222-8222-222222222222';
const CO_MEMBER = '44444444-4444-4444-8444-444444444444';
const FAMILY = '33333333-3333-4333-8333-333333333333';

const EXPENSE_OF_MEMBER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FAMILY_EXPENSE = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const EXPENSE_OWNERS: Record<string, ResourceOwner> = {
  [EXPENSE_OF_MEMBER]: { userId: MEMBER, familyId: null },
  [FAMILY_EXPENSE]: { userId: MEMBER, familyId: FAMILY },
};

const FAMILY_MEMBERS = [MEMBER, CO_MEMBER];

const expenseOf = (id: string) => ({
  id,
  transactionId: 'transaction-1',
  categoryId: 'category-1',
  storeId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  category: { id: 'category-1', name: 'Groceries', parentId: null },
  store: null,
  items: [],
  receipt: null,
  transaction: {
    id: 'transaction-1',
    userId: MEMBER,
    type: 'EXPENSE',
    scope: 'FAMILY',
    status: 'CONFIRMED',
    value: { toNumber: () => 10 },
    paymentMethodId: undefined,
    rejectionReason: undefined,
    recordedAt: new Date('2026-01-01T00:00:00.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    user: { id: MEMBER, firstName: 'A', lastName: 'B' },
  },
});

describe('ExpenseController authorization', () => {
  let app: INestApplication;
  let server: Server;
  let currentUserId: string;

  const listExpensesUseCase = { execute: jest.fn() };
  const getExpenseStatisticsUseCase = { execute: jest.fn() };
  const getExpenseTrendsUseCase = { execute: jest.fn() };
  const getExpenseByIdUseCase = { execute: jest.fn() };
  const updateExpenseUseCase = { execute: jest.fn() };
  const deleteExpenseUseCase = { execute: jest.fn() };

  const resourceOwnerRepository: IResourceOwnerRepository = {
    findOwner: (_resource: OwnedResource, resourceId: string) =>
      Promise.resolve(EXPENSE_OWNERS[resourceId] ?? null),
  };

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: (familyId: string, userId: string) =>
      Promise.resolve(familyId === FAMILY && FAMILY_MEMBERS.includes(userId)),
    findRole: (familyId: string, userId: string) =>
      Promise.resolve(
        familyId === FAMILY && FAMILY_MEMBERS.includes(userId)
          ? FamilyMemberRole.MEMBER
          : null,
      ),
    findFamilyIds: (userId: string) =>
      Promise.resolve(FAMILY_MEMBERS.includes(userId) ? [FAMILY] : []),
    findCoMemberUserIds: (userId: string) => Promise.resolve([userId]),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        { provide: CreateExpenseUseCase, useValue: { execute: jest.fn() } },
        { provide: GetExpenseByIdUseCase, useValue: getExpenseByIdUseCase },
        { provide: ListExpensesUseCase, useValue: listExpensesUseCase },
        { provide: UpdateExpenseUseCase, useValue: updateExpenseUseCase },
        { provide: DeleteExpenseUseCase, useValue: deleteExpenseUseCase },
        {
          provide: GetExpenseStatisticsUseCase,
          useValue: getExpenseStatisticsUseCase,
        },
        { provide: GetExpenseTrendsUseCase, useValue: getExpenseTrendsUseCase },
        {
          provide: ApprovePendingExpenseUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RejectPendingExpenseUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ResubmitRejectedExpenseUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdatePendingExpenseUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: 'StorageProvider',
          useValue: { getPresignedDownloadUrl: jest.fn() },
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
    listExpensesUseCase.execute.mockResolvedValue({ data: [], total: 0 });
    getExpenseStatisticsUseCase.execute.mockResolvedValue({
      totalExpenses: new Decimal(100),
      expenseCount: 2,
      averageExpense: new Decimal(50),
      expensesByCategory: [],
      expensesByStore: [],
    });
    getExpenseTrendsUseCase.execute.mockResolvedValue([]);
    getExpenseByIdUseCase.execute.mockImplementation((id: string) =>
      Promise.resolve(expenseOf(id)),
    );
    updateExpenseUseCase.execute.mockImplementation((id: string) =>
      Promise.resolve(expenseOf(id)),
    );
    deleteExpenseUseCase.execute.mockResolvedValue(undefined);
  });

  it('rejects statistics for a family the caller does not belong to', async () => {
    currentUserId = OUTSIDER;

    await request(server)
      .get(`/expenses/statistics?familyId=${FAMILY}`)
      .expect(403);

    expect(getExpenseStatisticsUseCase.execute).not.toHaveBeenCalled();
  });

  it('returns statistics for a family the caller belongs to', async () => {
    currentUserId = MEMBER;

    const response = await request(server)
      .get(`/expenses/statistics?familyId=${FAMILY}`)
      .expect(200);

    expect(response.body).toMatchObject({ totalExpenses: 100 });
    expect(getExpenseStatisticsUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ familyId: FAMILY, userId: undefined }),
    );
  });

  it('scopes personal statistics to the caller without a membership lookup', async () => {
    currentUserId = OUTSIDER;

    await request(server).get('/expenses/statistics').expect(200);

    expect(getExpenseStatisticsUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ userId: OUTSIDER, familyId: undefined }),
    );
  });

  it("rejects listing another family's expenses", async () => {
    currentUserId = OUTSIDER;

    await request(server).get(`/expenses?familyId=${FAMILY}`).expect(403);

    expect(listExpensesUseCase.execute).not.toHaveBeenCalled();
  });

  it("rejects another family's expense trends", async () => {
    currentUserId = OUTSIDER;

    await request(server)
      .get(
        `/expenses/trends?familyId=${FAMILY}&dateFrom=2026-01-01&dateTo=2026-02-01`,
      )
      .expect(403);

    expect(getExpenseTrendsUseCase.execute).not.toHaveBeenCalled();
  });

  it("hides another user's expense behind a 404", async () => {
    currentUserId = OUTSIDER;

    await request(server).get(`/expenses/${EXPENSE_OF_MEMBER}`).expect(404);

    expect(getExpenseByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it("refuses to delete another user's expense", async () => {
    currentUserId = OUTSIDER;

    await request(server).delete(`/expenses/${EXPENSE_OF_MEMBER}`).expect(404);

    expect(deleteExpenseUseCase.execute).not.toHaveBeenCalled();
  });

  describe('writes stay owner-only even inside the family', () => {
    it('refuses to let a co-member update a family expense', async () => {
      currentUserId = CO_MEMBER;

      await request(server)
        .put(`/expenses/${FAMILY_EXPENSE}`)
        .send({ note: 'rewritten' })
        .expect(404);

      expect(updateExpenseUseCase.execute).not.toHaveBeenCalled();
    });

    it('refuses to let a co-member delete a family expense', async () => {
      currentUserId = CO_MEMBER;

      await request(server).delete(`/expenses/${FAMILY_EXPENSE}`).expect(404);

      expect(deleteExpenseUseCase.execute).not.toHaveBeenCalled();
    });

    it('lets a co-member read the same family expense', async () => {
      currentUserId = CO_MEMBER;

      await request(server).get(`/expenses/${FAMILY_EXPENSE}`).expect(200);

      expect(getExpenseByIdUseCase.execute).toHaveBeenCalledWith(
        FAMILY_EXPENSE,
        CO_MEMBER,
      );
    });

    it('still lets the owner update their family expense', async () => {
      currentUserId = MEMBER;

      await request(server)
        .put(`/expenses/${FAMILY_EXPENSE}`)
        .send({ note: 'rewritten' })
        .expect(200);

      expect(updateExpenseUseCase.execute).toHaveBeenCalled();
    });

    it('still lets the owner delete their family expense', async () => {
      currentUserId = MEMBER;

      await request(server).delete(`/expenses/${FAMILY_EXPENSE}`).expect(204);

      expect(deleteExpenseUseCase.execute).toHaveBeenCalled();
    });

    it('refuses a complete stranger', async () => {
      currentUserId = OUTSIDER;

      await request(server)
        .put(`/expenses/${FAMILY_EXPENSE}`)
        .send({ note: 'rewritten' })
        .expect(404);

      expect(updateExpenseUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
