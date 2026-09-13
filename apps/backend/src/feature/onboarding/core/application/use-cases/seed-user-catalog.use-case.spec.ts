import { SeedUserCatalogUseCase } from './seed-user-catalog.use-case';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_ITEM_CATEGORIES,
  countSeedNodes,
} from '../../domain/default-catalog';

const USER = 'user-1';

interface CreatedCategory {
  name: string;
  parentId: string | null;
  userId: string;
}

function createCategoryService(existingTotal: number) {
  const created: CreatedCategory[] = [];
  let nextId = 0;

  return {
    created,
    findAll: jest.fn().mockResolvedValue({ data: [], total: existingTotal }),
    create: jest
      .fn()
      .mockImplementation(
        (dto: { name: string; parentId?: string | null }, userId: string) => {
          nextId += 1;
          created.push({
            name: dto.name,
            parentId: dto.parentId ?? null,
            userId,
          });
          return Promise.resolve({ id: `category-${nextId}`, name: dto.name });
        },
      ),
  };
}

describe('SeedUserCatalogUseCase', () => {
  it('creates the whole starter tree for a user who can see no categories', async () => {
    const expenseCategoryService = createCategoryService(0);
    const incomeCategoryService = createCategoryService(0);
    const storeItemCategoryService = createCategoryService(0);

    const useCase = new SeedUserCatalogUseCase(
      expenseCategoryService as never,
      incomeCategoryService as never,
      storeItemCategoryService as never,
    );

    const result = await useCase.execute(USER);

    expect(result.expenseCategoriesCreated).toBe(
      countSeedNodes(DEFAULT_EXPENSE_CATEGORIES),
    );
    expect(result.incomeCategoriesCreated).toBe(
      countSeedNodes(DEFAULT_INCOME_CATEGORIES),
    );
    expect(result.itemCategoriesCreated).toBe(DEFAULT_ITEM_CATEGORIES.length);
    expect(
      expenseCategoryService.created.every((row) => row.userId === USER),
    ).toBe(true);
  });

  it('attaches child categories to the parent that was just created', async () => {
    const expenseCategoryService = createCategoryService(0);

    const useCase = new SeedUserCatalogUseCase(
      expenseCategoryService as never,
      createCategoryService(1) as never,
      createCategoryService(1) as never,
    );

    await useCase.execute(USER);

    const housing = DEFAULT_EXPENSE_CATEGORIES.find(
      (node) => node.name === 'Housing & Bills',
    );
    const housingIndex = expenseCategoryService.created.findIndex(
      (row) => row.name === 'Housing & Bills',
    );
    const parentId = `category-${housingIndex + 1}`;

    for (const child of housing?.children ?? []) {
      const row = expenseCategoryService.created.find(
        (candidate) => candidate.name === child.name,
      );
      expect(row?.parentId).toBe(parentId);
    }
  });

  it('seeds nothing when the user can already see categories', async () => {
    const expenseCategoryService = createCategoryService(1);
    const incomeCategoryService = createCategoryService(1);
    const storeItemCategoryService = createCategoryService(1);

    const useCase = new SeedUserCatalogUseCase(
      expenseCategoryService as never,
      incomeCategoryService as never,
      storeItemCategoryService as never,
    );

    const result = await useCase.execute(USER);

    expect(result).toEqual({
      expenseCategoriesCreated: 0,
      incomeCategoriesCreated: 0,
      itemCategoriesCreated: 0,
    });
    expect(expenseCategoryService.create).not.toHaveBeenCalled();
    expect(incomeCategoryService.create).not.toHaveBeenCalled();
    expect(storeItemCategoryService.create).not.toHaveBeenCalled();
  });

  it('keeps going when one catalog fails and never throws', async () => {
    const expenseCategoryService = createCategoryService(0);
    expenseCategoryService.create.mockRejectedValue(
      new Error('unique constraint'),
    );
    const incomeCategoryService = createCategoryService(0);
    const storeItemCategoryService = createCategoryService(0);

    const useCase = new SeedUserCatalogUseCase(
      expenseCategoryService as never,
      incomeCategoryService as never,
      storeItemCategoryService as never,
    );

    const result = await useCase.execute(USER);

    expect(result.expenseCategoriesCreated).toBe(0);
    expect(result.incomeCategoriesCreated).toBe(
      countSeedNodes(DEFAULT_INCOME_CATEGORIES),
    );
    expect(result.itemCategoriesCreated).toBe(DEFAULT_ITEM_CATEGORIES.length);
  });
});
