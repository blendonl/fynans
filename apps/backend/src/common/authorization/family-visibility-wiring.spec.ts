import { Test } from '@nestjs/testing';
import { ExpenseCategoryCoreModule } from '~feature/expense-category/core/expense-category-core.module';
import { IncomeCategoryCoreModule } from '~feature/income-category/core/income-category-core.module';
import { ItemCoreModule } from '~feature/item/core/item-core.module';
import { StoreCoreModule } from '~feature/store/core/store-core.module';
import { StoreItemCategoryCoreModule } from '~feature/store-item-category/core/store-item-category-core.module';
import { PrismaExpenseCategoryRepository } from '~feature/expense-category/core/infrastructure/repositories/prisma-expense-category.repository';
import { PrismaIncomeCategoryRepository } from '~feature/income-category/core/infrastructure/repositories/prisma-income-category.repository';
import { PrismaItemRepository } from '~feature/item/core/infrastructure/repositories/prisma-item.repository';
import { PrismaStoreRepository } from '~feature/store/core/infrastructure/repositories/prisma-store.repository';
import { PrismaStoreItemRepository } from '~feature/store/core/infrastructure/repositories/prisma-store-item.repository';
import { PrismaStoreItemCategoryRepository } from '~feature/store-item-category/core/infrastructure/repositories/prisma-store-item-category.repository';
import { FAMILY_MEMBERSHIP_REPOSITORY } from './domain/repositories/family-membership.repository.interface';

const coMembers = ['user-1', 'co-member-1'];

const membershipDouble = () => ({
  isMember: jest.fn(),
  findRole: jest.fn(),
  findFamilyIds: jest.fn(),
  findCoMemberUserIds: jest.fn().mockResolvedValue(coMembers),
});

const wiring: [string, unknown, string, unknown][] = [
  [
    'expense categories',
    ExpenseCategoryCoreModule,
    'ExpenseCategoryRepository',
    PrismaExpenseCategoryRepository,
  ],
  [
    'income categories',
    IncomeCategoryCoreModule,
    'IncomeCategoryRepository',
    PrismaIncomeCategoryRepository,
  ],
  ['items', ItemCoreModule, 'ItemRepository', PrismaItemRepository],
  ['stores', StoreCoreModule, 'StoreRepository', PrismaStoreRepository],
  [
    'store items',
    StoreCoreModule,
    'StoreItemRepository',
    PrismaStoreItemRepository,
  ],
  [
    'item categories',
    StoreItemCategoryCoreModule,
    'StoreItemCategoryRepository',
    PrismaStoreItemCategoryRepository,
  ],
];

describe('repositories resolve family visibility through the membership port', () => {
  it.each(wiring)('%s', async (_name, module, token, repositoryClass) => {
    const testingModule = await Test.createTestingModule({
      imports: [module as never],
    })
      .overrideProvider(FAMILY_MEMBERSHIP_REPOSITORY)
      .useValue(membershipDouble())
      .compile();

    expect(testingModule.get(token)).toBeInstanceOf(repositoryClass as never);
  });

  it('scopes an expense category listing to the co-member ids the port returns', async () => {
    const membershipRepository = membershipDouble();
    const prisma = {
      expenseCategory: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const repository = new PrismaExpenseCategoryRepository(
      prisma as never,
      membershipRepository as never,
    );

    await repository.findAll('user-1');

    expect(membershipRepository.findCoMemberUserIds).toHaveBeenCalledWith(
      'user-1',
    );
    expect(prisma.expenseCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: { in: coMembers } },
      }),
    );
  });
});
