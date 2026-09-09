import { UpdateExpenseCategoryUseCase } from './update-expense-category.use-case';
import { DeleteExpenseCategoryUseCase } from './delete-expense-category.use-case';
import { UpdateIncomeCategoryUseCase } from '~feature/income-category/core/application/use-cases/update-income-category.use-case';
import { DeleteIncomeCategoryUseCase } from '~feature/income-category/core/application/use-cases/delete-income-category.use-case';
import { UpdateItemUseCase } from '~feature/item/core/application/use-cases/update-item.use-case';
import { DeleteItemUseCase } from '~feature/item/core/application/use-cases/delete-item.use-case';
import { UpdateExpenseCategoryDto } from '../dto/update-expense-category.dto';
import { UpdateIncomeCategoryDto } from '~feature/income-category/core/application/dto/update-income-category.dto';
import { UpdateItemDto } from '~feature/item/core/application/dto/update-item.dto';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const linkedUser = 'linked-user';
const otherUser = 'other-user';

const linkOwnedBy = (owner: string) =>
  jest
    .fn()
    .mockImplementation((_id: string, userId: string) =>
      Promise.resolve(userId === owner),
    );

describe('category and item mutations require a link to the caller', () => {
  describe('expense categories', () => {
    let repository: Record<string, jest.Mock>;

    beforeEach(() => {
      repository = {
        findById: jest
          .fn()
          .mockResolvedValue({ id: 'category-1', parentId: null }),
        findByName: jest.fn().mockResolvedValue(null),
        findChildren: jest.fn().mockResolvedValue([]),
        countExpensesByCategory: jest.fn().mockResolvedValue(0),
        isLinkedToUser: linkOwnedBy(linkedUser),
        update: jest.fn().mockResolvedValue({ id: 'category-1' }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
    });

    it('rejects renaming a category the caller is not linked to', async () => {
      const useCase = new UpdateExpenseCategoryUseCase(repository as never);

      await expect(
        useCase.execute(
          'category-1',
          new UpdateExpenseCategoryDto({ name: 'Renamed' }),
          otherUser,
        ),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('rejects deleting a category the caller is not linked to', async () => {
      const useCase = new DeleteExpenseCategoryUseCase(repository as never);

      await expect(
        useCase.execute('category-1', otherUser),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('allows a linked user to rename and delete', async () => {
      await new UpdateExpenseCategoryUseCase(repository as never).execute(
        'category-1',
        new UpdateExpenseCategoryDto({ name: 'Renamed' }),
        linkedUser,
      );
      await new DeleteExpenseCategoryUseCase(repository as never).execute(
        'category-1',
        linkedUser,
      );

      expect(repository.update).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalled();
    });
  });

  describe('income categories', () => {
    let repository: Record<string, jest.Mock>;

    beforeEach(() => {
      repository = {
        findById: jest
          .fn()
          .mockResolvedValue({ id: 'category-1', parentId: null }),
        findChildren: jest.fn().mockResolvedValue([]),
        isLinkedToUser: linkOwnedBy(linkedUser),
        update: jest.fn().mockResolvedValue({ id: 'category-1' }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
    });

    it('rejects renaming a category the caller is not linked to', async () => {
      const useCase = new UpdateIncomeCategoryUseCase(repository as never);

      await expect(
        useCase.execute(
          'category-1',
          new UpdateIncomeCategoryDto({ name: 'Renamed' }),
          otherUser,
        ),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('rejects deleting a category the caller is not linked to', async () => {
      const useCase = new DeleteIncomeCategoryUseCase(repository as never);

      await expect(
        useCase.execute('category-1', otherUser),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('allows a linked user to rename and delete', async () => {
      await new UpdateIncomeCategoryUseCase(repository as never).execute(
        'category-1',
        new UpdateIncomeCategoryDto({ name: 'Renamed' }),
        linkedUser,
      );
      await new DeleteIncomeCategoryUseCase(repository as never).execute(
        'category-1',
        linkedUser,
      );

      expect(repository.update).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalled();
    });
  });

  describe('items', () => {
    let repository: Record<string, jest.Mock>;
    let categoryRepository: Record<string, jest.Mock>;
    let prisma: { storeItem: { count: jest.Mock } };

    beforeEach(() => {
      repository = {
        findById: jest.fn().mockResolvedValue({ id: 'item-1' }),
        findByName: jest.fn().mockResolvedValue(null),
        isLinkedToUser: linkOwnedBy(linkedUser),
        update: jest.fn().mockResolvedValue({ id: 'item-1' }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      categoryRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'item-category-1' }),
      };
      prisma = { storeItem: { count: jest.fn().mockResolvedValue(0) } };
    });

    it('rejects renaming an item the caller is not linked to', async () => {
      const useCase = new UpdateItemUseCase(
        repository as never,
        categoryRepository as never,
      );

      await expect(
        useCase.execute('item-1', new UpdateItemDto('Renamed'), otherUser),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('rejects deleting an item the caller is not linked to', async () => {
      const useCase = new DeleteItemUseCase(
        repository as never,
        prisma as never,
      );

      await expect(useCase.execute('item-1', otherUser)).rejects.toBeInstanceOf(
        DomainForbiddenException,
      );

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('allows a linked user to rename and delete', async () => {
      await new UpdateItemUseCase(
        repository as never,
        categoryRepository as never,
      ).execute('item-1', new UpdateItemDto('Renamed'), linkedUser);
      await new DeleteItemUseCase(repository as never, prisma as never).execute(
        'item-1',
        linkedUser,
      );

      expect(repository.update).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalled();
    });
  });
});
