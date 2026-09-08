jest.mock('../../core/application/services/expense-item.service', () => ({
  ExpenseItemService: class ExpenseItemService {},
}));

import { Server } from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DomainExceptionFilter } from '~common/filters/domain-exception.filter';
import { VerifyResourceAccessUseCase } from '~common/authorization/application/use-cases/verify-resource-access.use-case';
import { ResourceOwnershipGuard } from '~common/authorization/rest/guards/resource-ownership.guard';
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
import { ExpenseItemService } from '../../core/application/services/expense-item.service';
import { ExpenseItem } from '../../core/domain/entities/expense-item.entity';
import { ExpenseItemController } from './expense-item.controller';

const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';
const USER_C = '33333333-3333-4333-8333-333333333333';
const FAMILY = '44444444-4444-4444-8444-444444444444';
const CATEGORY = '55555555-5555-4555-8555-555555555555';
const STORE = '66666666-6666-4666-8666-666666666666';

const EXPENSE_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const EXPENSE_FAMILY = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EXPENSE_B = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ITEM_A = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const ITEM_FAMILY = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const ITEM_B = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

const EXPENSE_OWNERS: Record<string, ResourceOwner> = {
  [EXPENSE_A]: { userId: USER_A, familyId: null },
  [EXPENSE_FAMILY]: { userId: USER_A, familyId: FAMILY },
  [EXPENSE_B]: { userId: USER_B, familyId: null },
};

const EXPENSE_ITEM_OWNERS: Record<string, ResourceOwner> = {
  [ITEM_A]: EXPENSE_OWNERS[EXPENSE_A],
  [ITEM_FAMILY]: EXPENSE_OWNERS[EXPENSE_FAMILY],
  [ITEM_B]: EXPENSE_OWNERS[EXPENSE_B],
};

const FAMILY_MEMBERS: Record<string, string[]> = {
  [FAMILY]: [USER_A, USER_C],
};

function decimalOf(value: number) {
  return { toNumber: () => value };
}

function expenseItemOf(id: string): ExpenseItem {
  return {
    id,
    itemId: STORE,
    itemName: 'Milk',
    expenseId: EXPENSE_A,
    categoryId: CATEGORY,
    price: decimalOf(2.5),
    discount: decimalOf(0),
    quantity: decimalOf(1),
    getFinalPrice: () => decimalOf(2.5),
    getDiscountPercentage: () => 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  } as unknown as ExpenseItem;
}

describe('ExpenseItemController authorization', () => {
  let app: INestApplication;
  let server: Server;
  let currentUserId: string;
  let expenseItemService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const resourceOwnerRepository: IResourceOwnerRepository = {
    findOwner: (resource: OwnedResource, resourceId: string) =>
      Promise.resolve(
        (resource === 'expense'
          ? EXPENSE_OWNERS[resourceId]
          : EXPENSE_ITEM_OWNERS[resourceId]) ?? null,
      ),
  };

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: (familyId: string, userId: string) =>
      Promise.resolve((FAMILY_MEMBERS[familyId] ?? []).includes(userId)),
    findFamilyIds: (userId: string) =>
      Promise.resolve(
        Object.keys(FAMILY_MEMBERS).filter((familyId) =>
          FAMILY_MEMBERS[familyId].includes(userId),
        ),
      ),
    findCoMemberUserIds: (userId: string) => Promise.resolve([userId]),
  };

  const createBody = (expenseId: string) => ({
    expenseId,
    categoryId: CATEGORY,
    itemName: 'Milk',
    itemPrice: 2.5,
  });

  beforeAll(async () => {
    expenseItemService = {
      create: jest.fn(() => Promise.resolve(expenseItemOf(ITEM_A))),
      findAll: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
      findById: jest.fn((id: string) => Promise.resolve(expenseItemOf(id))),
      update: jest.fn((id: string) => Promise.resolve(expenseItemOf(id))),
      delete: jest.fn(() => Promise.resolve()),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ExpenseItemController],
      providers: [
        { provide: ExpenseItemService, useValue: expenseItemService },
        {
          provide: RESOURCE_OWNER_REPOSITORY,
          useValue: resourceOwnerRepository,
        },
        {
          provide: FAMILY_MEMBERSHIP_REPOSITORY,
          useValue: familyMembershipRepository,
        },
        VerifyResourceAccessUseCase,
        ResourceOwnershipGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: { id: string } }).user = { id: currentUserId };
      next();
    });
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
  });

  describe("user B against every one of user A's object IDs", () => {
    beforeEach(() => {
      currentUserId = USER_B;
    });

    it('cannot read a line item', async () => {
      await request(server).get(`/expense-items/${ITEM_A}`).expect(404);

      expect(expenseItemService.findById).not.toHaveBeenCalled();
    });

    it('cannot update a line item', async () => {
      await request(server)
        .put(`/expense-items/${ITEM_A}`)
        .send({ price: 999 })
        .expect(404);

      expect(expenseItemService.update).not.toHaveBeenCalled();
    });

    it('cannot delete a line item', async () => {
      await request(server).delete(`/expense-items/${ITEM_A}`).expect(404);

      expect(expenseItemService.delete).not.toHaveBeenCalled();
    });

    it("cannot list another user's expense line items", async () => {
      await request(server)
        .get('/expense-items')
        .query({ expenseId: EXPENSE_A })
        .expect(404);

      expect(expenseItemService.findAll).not.toHaveBeenCalled();
    });

    it("cannot add a line item to another user's expense", async () => {
      await request(server)
        .post('/expense-items')
        .query({ storeId: STORE })
        .send(createBody(EXPENSE_A))
        .expect(404);

      expect(expenseItemService.create).not.toHaveBeenCalled();
    });

    it('cannot read a family-attributed line item of a family it does not belong to', async () => {
      await request(server).get(`/expense-items/${ITEM_FAMILY}`).expect(404);
    });

    it('receives the same response for an unknown id as for a forbidden one', async () => {
      const forbidden = await request(server).get(`/expense-items/${ITEM_A}`);
      const unknown = await request(server).get(
        '/expense-items/99999999-9999-4999-8999-999999999999',
      );

      expect(unknown.status).toBe(forbidden.status);
      expect(unknown.body).toEqual(forbidden.body);
    });
  });

  describe('user A against their own object IDs', () => {
    beforeEach(() => {
      currentUserId = USER_A;
    });

    it('reads a line item', async () => {
      await request(server).get(`/expense-items/${ITEM_A}`).expect(200);

      expect(expenseItemService.findById).toHaveBeenCalledWith(ITEM_A);
    });

    it('updates a line item', async () => {
      await request(server)
        .put(`/expense-items/${ITEM_A}`)
        .send({ price: 3 })
        .expect(200);

      expect(expenseItemService.update).toHaveBeenCalled();
    });

    it('deletes a line item', async () => {
      await request(server).delete(`/expense-items/${ITEM_A}`).expect(204);

      expect(expenseItemService.delete).toHaveBeenCalledWith(ITEM_A);
    });

    it('lists their own expense line items', async () => {
      await request(server)
        .get('/expense-items')
        .query({ expenseId: EXPENSE_A })
        .expect(200);

      expect(expenseItemService.findAll).toHaveBeenCalledWith(
        USER_A,
        EXPENSE_A,
        expect.anything(),
      );
    });

    it('adds a line item to their own expense', async () => {
      await request(server)
        .post('/expense-items')
        .query({ storeId: STORE })
        .send(createBody(EXPENSE_A))
        .expect(201);

      expect(expenseItemService.create).toHaveBeenCalled();
    });
  });

  describe('unfiltered listing', () => {
    it('is scoped to the requesting user', async () => {
      currentUserId = USER_B;

      await request(server).get('/expense-items').expect(200);

      expect(expenseItemService.findAll).toHaveBeenCalledWith(
        USER_B,
        undefined,
        expect.anything(),
      );
    });
  });

  describe('family co-member', () => {
    beforeEach(() => {
      currentUserId = USER_C;
    });

    it('reads a line item on a family-attributed transaction', async () => {
      await request(server).get(`/expense-items/${ITEM_FAMILY}`).expect(200);
    });

    it('cannot read a line item on a personal transaction', async () => {
      await request(server).get(`/expense-items/${ITEM_A}`).expect(404);
    });
  });
});
