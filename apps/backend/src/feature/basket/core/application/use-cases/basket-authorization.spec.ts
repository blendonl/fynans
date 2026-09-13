import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { BasketScope } from '../../domain/entities/basket.entity';
import { UpdateBasketItemUseCase } from './update-basket-item.use-case';
import { RemoveBasketItemUseCase } from './remove-basket-item.use-case';
import { CheckoutBasketItemsUseCase } from './checkout-basket-items.use-case';
import { UpdateBasketItemDto } from '../dto/update-basket-item.dto';
import { CheckoutBasketItemsDto } from '../dto/checkout-basket-items.dto';

const OWNER = 'owner-1';
const CO_MEMBER = 'co-member-1';
const SECOND_USER = 'second-user-1';
const FAMILY = 'family-1';
const PERSONAL_BASKET = 'basket-personal';
const FAMILY_BASKET = 'basket-family';
const ITEM = 'basket-item-1';

const baskets = {
  [PERSONAL_BASKET]: {
    id: PERSONAL_BASKET,
    scope: BasketScope.PERSONAL,
    userId: OWNER,
    familyId: null,
  },
  [FAMILY_BASKET]: {
    id: FAMILY_BASKET,
    scope: BasketScope.FAMILY,
    userId: OWNER,
    familyId: FAMILY,
  },
};

const basketItem = (basketId: string) => ({
  id: ITEM,
  basketId,
  name: 'Milk',
  price: 1.5,
  quantity: 2,
  categoryId: 'category-1',
  update: jest.fn(),
});

describe('basket authorization', () => {
  let basketRepository: {
    findById: jest.Mock;
    findItemById: jest.Mock;
    findItemsByIds: jest.Mock;
    updateItem: jest.Mock;
    removeItem: jest.Mock;
    removeItemsByIds: jest.Mock;
  };
  let familyService: { findMember: jest.Mock };
  let createExpenseUseCase: { execute: jest.Mock };
  let updateItem: UpdateBasketItemUseCase;
  let removeItem: RemoveBasketItemUseCase;
  let checkout: CheckoutBasketItemsUseCase;

  const givenBasket = (basketId: keyof typeof baskets) => {
    basketRepository.findById.mockResolvedValue(baskets[basketId]);
    basketRepository.findItemById.mockResolvedValue(basketItem(basketId));
    basketRepository.findItemsByIds.mockResolvedValue([basketItem(basketId)]);
  };

  const checkoutDtoFor = (basketId: string, userId: string) =>
    new CheckoutBasketItemsDto({
      basketId,
      itemIds: [ITEM],
      categoryId: 'category-1',
      storeId: 'store-1',
      userId,
    });

  beforeEach(() => {
    basketRepository = {
      findById: jest.fn(),
      findItemById: jest.fn(),
      findItemsByIds: jest.fn(),
      updateItem: jest.fn().mockResolvedValue({ id: ITEM }),
      removeItem: jest.fn().mockResolvedValue(undefined),
      removeItemsByIds: jest.fn().mockResolvedValue(undefined),
    };
    familyService = {
      findMember: jest
        .fn()
        .mockImplementation((familyId: string, userId: string) =>
          Promise.resolve(
            familyId === FAMILY && [OWNER, CO_MEMBER].includes(userId)
              ? { familyId, userId }
              : null,
          ),
        ),
    };
    createExpenseUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'expense-1' }),
    };

    updateItem = new UpdateBasketItemUseCase(
      basketRepository as never,
      familyService as never,
    );
    removeItem = new RemoveBasketItemUseCase(
      basketRepository as never,
      familyService as never,
    );
    checkout = new CheckoutBasketItemsUseCase(
      basketRepository as never,
      familyService as never,
      createExpenseUseCase as never,
      { notify: jest.fn().mockResolvedValue(undefined) } as never,
      createPrismaServiceDouble(),
    );
  });

  describe("a second user against another user's personal basket", () => {
    beforeEach(() => givenBasket(PERSONAL_BASKET));

    it('cannot reprice an item', async () => {
      await expect(
        updateItem.execute(
          ITEM,
          new UpdateBasketItemDto({ price: 999 }),
          SECOND_USER,
        ),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(basketRepository.updateItem).not.toHaveBeenCalled();
    });

    it('cannot remove an item', async () => {
      await expect(
        removeItem.execute(ITEM, SECOND_USER),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(basketRepository.removeItem).not.toHaveBeenCalled();
    });

    it('cannot check it out into an expense of their own', async () => {
      await expect(
        checkout.execute(checkoutDtoFor(PERSONAL_BASKET, SECOND_USER)),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(createExpenseUseCase.execute).not.toHaveBeenCalled();
      expect(basketRepository.removeItemsByIds).not.toHaveBeenCalled();
    });

    it('lets the owner do all three', async () => {
      await updateItem.execute(
        ITEM,
        new UpdateBasketItemDto({ price: 2 }),
        OWNER,
      );
      await removeItem.execute(ITEM, OWNER);
      await checkout.execute(checkoutDtoFor(PERSONAL_BASKET, OWNER));

      expect(basketRepository.updateItem).toHaveBeenCalled();
      expect(basketRepository.removeItem).toHaveBeenCalledWith(ITEM);
      expect(createExpenseUseCase.execute).toHaveBeenCalled();
    });

    it('does not let a family co-member reach a personal basket', async () => {
      await expect(removeItem.execute(ITEM, CO_MEMBER)).rejects.toBeInstanceOf(
        DomainForbiddenException,
      );
    });
  });

  describe('a family basket', () => {
    beforeEach(() => givenBasket(FAMILY_BASKET));

    it('refuses a user who does not belong to the family', async () => {
      await expect(
        updateItem.execute(
          ITEM,
          new UpdateBasketItemDto({ price: 999 }),
          SECOND_USER,
        ),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      await expect(
        removeItem.execute(ITEM, SECOND_USER),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      await expect(
        checkout.execute(checkoutDtoFor(FAMILY_BASKET, SECOND_USER)),
      ).rejects.toBeInstanceOf(DomainForbiddenException);
    });

    it('admits a co-member', async () => {
      await expect(
        removeItem.execute(ITEM, CO_MEMBER),
      ).resolves.toBeUndefined();
    });

    it('books a co-member checkout against the family, not their personal scope', async () => {
      await checkout.execute(checkoutDtoFor(FAMILY_BASKET, CO_MEMBER));

      expect(createExpenseUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: CO_MEMBER, familyId: FAMILY }),
      );
    });
  });

  describe('items borrowed from another basket', () => {
    it('refuses to check out items that belong to a different basket', async () => {
      basketRepository.findById.mockResolvedValue(baskets[PERSONAL_BASKET]);
      basketRepository.findItemsByIds.mockResolvedValue([
        basketItem(FAMILY_BASKET),
      ]);

      await expect(
        checkout.execute(checkoutDtoFor(PERSONAL_BASKET, OWNER)),
      ).rejects.toThrow('Some items do not belong to this basket');

      expect(createExpenseUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
