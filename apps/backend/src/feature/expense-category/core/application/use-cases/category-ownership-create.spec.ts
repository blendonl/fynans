import { CreateExpenseCategoryUseCase } from './create-expense-category.use-case';
import { GetExpenseCategoryByIdUseCase } from './get-expense-category-by-id.use-case';
import { CreateIncomeCategoryUseCase } from '~feature/income-category/core/application/use-cases/create-income-category.use-case';
import { CreateItemUseCase } from '~feature/item/core/application/use-cases/create-item.use-case';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';
import { CreateIncomeCategoryDto } from '~feature/income-category/core/application/dto/create-income-category.dto';
import { CreateItemDto } from '~feature/item/core/application/dto/create-item.dto';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

const owner = 'owner-user';
const otherUser = 'other-user';

describe('creating a category or item never reuses another user row', () => {
  it('gives a second user their own expense category with the same name', async () => {
    const repository = {
      findById: jest.fn(),
      findOwnedByName: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'category-2', userId: otherUser }),
    };

    const category = await new CreateExpenseCategoryUseCase(
      repository as never,
    ).execute(new CreateExpenseCategoryDto('Groceries', false), otherUser);

    expect(repository.findOwnedByName).toHaveBeenCalledWith(
      'Groceries',
      otherUser,
    );
    expect(repository.create).toHaveBeenCalledWith({
      userId: otherUser,
      name: 'Groceries',
      parentId: null,
      isConnectedToStore: false,
    });
    expect(category).toEqual({ id: 'category-2', userId: otherUser });
  });

  it('returns the caller own expense category when the name is already taken by them', async () => {
    const existing = { id: 'category-1', userId: owner };
    const repository = {
      findById: jest.fn(),
      findOwnedByName: jest.fn().mockResolvedValue(existing),
      create: jest.fn(),
    };

    const category = await new CreateExpenseCategoryUseCase(
      repository as never,
    ).execute(new CreateExpenseCategoryDto('Groceries', false), owner);

    expect(category).toBe(existing);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('refuses to nest an expense category under a parent owned by somebody else', async () => {
    const repository = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'parent-1', userId: otherUser }),
      findOwnedByName: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };

    await expect(
      new CreateExpenseCategoryUseCase(repository as never).execute(
        new CreateExpenseCategoryDto('Groceries', false, 'parent-1'),
        owner,
      ),
    ).rejects.toBeInstanceOf(DomainValidationException);

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('gives a second user their own income category with the same name', async () => {
    const repository = {
      findById: jest.fn(),
      findOwnedByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'category-2' }),
    };

    await new CreateIncomeCategoryUseCase(repository as never).execute(
      new CreateIncomeCategoryDto('Salary'),
      otherUser,
    );

    expect(repository.create).toHaveBeenCalledWith({
      userId: otherUser,
      name: 'Salary',
      parentId: null,
    });
  });

  it('lets two users each own an item with the same name', async () => {
    const repository = {
      findOwnedByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'item-2' }),
    };
    const categoryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'item-category-1' }),
    };

    await new CreateItemUseCase(
      repository as never,
      categoryRepository as never,
    ).execute(new CreateItemDto('Milk', 'item-category-1'), otherUser);

    expect(repository.findOwnedByName).toHaveBeenCalledWith('Milk', otherUser);
    expect(repository.create).toHaveBeenCalledWith({
      userId: otherUser,
      name: 'Milk',
      categoryId: 'item-category-1',
    });
  });

  it('hides an expense category that belongs to nobody the caller shares a family with', async () => {
    const repository = {
      findVisibleById: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new GetExpenseCategoryByIdUseCase(repository as never).execute(
        'category-1',
        otherUser,
      ),
    ).rejects.toBeInstanceOf(DomainNotFoundException);

    expect(repository.findVisibleById).toHaveBeenCalledWith(
      'category-1',
      otherUser,
    );
  });
});
