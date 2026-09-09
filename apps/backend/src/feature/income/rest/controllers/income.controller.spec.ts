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
import { CreateIncomeUseCase } from '../../core/application/use-cases/create-income.use-case';
import { GetIncomeByIdUseCase } from '../../core/application/use-cases/get-income-by-id.use-case';
import { GetIncomeByTransactionIdUseCase } from '../../core/application/use-cases/get-income-by-transaction-id.use-case';
import { ListIncomesUseCase } from '../../core/application/use-cases/list-incomes.use-case';
import { UpdateIncomeUseCase } from '../../core/application/use-cases/update-income.use-case';
import { DeleteIncomeUseCase } from '../../core/application/use-cases/delete-income.use-case';
import { IncomeController } from './income.controller';

const OWNER = '11111111-1111-4111-8111-111111111111';
const OUTSIDER = '22222222-2222-4222-8222-222222222222';
const CO_MEMBER = '33333333-3333-4333-8333-333333333333';
const FAMILY = '44444444-4444-4444-8444-444444444444';

const FAMILY_INCOME = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PERSONAL_INCOME = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const INCOME_OWNERS: Record<string, ResourceOwner> = {
  [FAMILY_INCOME]: { userId: OWNER, familyId: FAMILY },
  [PERSONAL_INCOME]: { userId: OWNER, familyId: null },
};

const FAMILY_MEMBERS = [OWNER, CO_MEMBER];

const CATEGORY = '55555555-5555-4555-8555-555555555555';

const incomeOf = (id: string) => ({
  id,
  transactionId: 'transaction-1',
  storeId: 'store-1',
  categoryId: 'category-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('IncomeController authorization', () => {
  let app: INestApplication;
  let server: Server;
  let currentUserId: string;

  const getIncomeByIdUseCase = { execute: jest.fn() };
  const updateIncomeUseCase = { execute: jest.fn() };
  const deleteIncomeUseCase = { execute: jest.fn() };
  const listIncomesUseCase = { execute: jest.fn() };

  const resourceOwnerRepository: IResourceOwnerRepository = {
    findOwner: (_resource: OwnedResource, resourceId: string) =>
      Promise.resolve(INCOME_OWNERS[resourceId] ?? null),
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
      controllers: [IncomeController],
      providers: [
        { provide: CreateIncomeUseCase, useValue: { execute: jest.fn() } },
        { provide: GetIncomeByIdUseCase, useValue: getIncomeByIdUseCase },
        {
          provide: GetIncomeByTransactionIdUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: ListIncomesUseCase, useValue: listIncomesUseCase },
        { provide: UpdateIncomeUseCase, useValue: updateIncomeUseCase },
        { provide: DeleteIncomeUseCase, useValue: deleteIncomeUseCase },
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
    listIncomesUseCase.execute.mockResolvedValue({ data: [], total: 0 });
    getIncomeByIdUseCase.execute.mockImplementation((id: string) =>
      Promise.resolve(incomeOf(id)),
    );
    updateIncomeUseCase.execute.mockImplementation((id: string) =>
      Promise.resolve(incomeOf(id)),
    );
    deleteIncomeUseCase.execute.mockResolvedValue(undefined);
  });

  describe('writes stay owner-only even inside the family', () => {
    it('refuses to let a co-member update a family income', async () => {
      currentUserId = CO_MEMBER;

      await request(server)
        .put(`/incomes/${FAMILY_INCOME}`)
        .send({ categoryId: CATEGORY })
        .expect(404);

      expect(updateIncomeUseCase.execute).not.toHaveBeenCalled();
    });

    it('refuses to let a co-member delete a family income', async () => {
      currentUserId = CO_MEMBER;

      await request(server).delete(`/incomes/${FAMILY_INCOME}`).expect(404);

      expect(deleteIncomeUseCase.execute).not.toHaveBeenCalled();
    });

    it('still lets the owner update their family income', async () => {
      currentUserId = OWNER;

      await request(server)
        .put(`/incomes/${FAMILY_INCOME}`)
        .send({ categoryId: CATEGORY })
        .expect(200);

      expect(updateIncomeUseCase.execute).toHaveBeenCalled();
    });

    it('still lets the owner delete their family income', async () => {
      currentUserId = OWNER;

      await request(server).delete(`/incomes/${FAMILY_INCOME}`).expect(204);

      expect(deleteIncomeUseCase.execute).toHaveBeenCalledWith(FAMILY_INCOME);
    });

    it('refuses a complete stranger', async () => {
      currentUserId = OUTSIDER;

      await request(server)
        .put(`/incomes/${FAMILY_INCOME}`)
        .send({ categoryId: CATEGORY })
        .expect(404);

      expect(updateIncomeUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('reads stay family-scoped', () => {
    it('lets a co-member read a family income', async () => {
      currentUserId = CO_MEMBER;

      await request(server).get(`/incomes/${FAMILY_INCOME}`).expect(200);

      expect(getIncomeByIdUseCase.execute).toHaveBeenCalledWith(FAMILY_INCOME);
    });

    it('hides a personal income from a co-member', async () => {
      currentUserId = CO_MEMBER;

      await request(server).get(`/incomes/${PERSONAL_INCOME}`).expect(404);

      expect(getIncomeByIdUseCase.execute).not.toHaveBeenCalled();
    });

    it('hides an income from a stranger', async () => {
      currentUserId = OUTSIDER;

      await request(server).get(`/incomes/${FAMILY_INCOME}`).expect(404);

      expect(getIncomeByIdUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
