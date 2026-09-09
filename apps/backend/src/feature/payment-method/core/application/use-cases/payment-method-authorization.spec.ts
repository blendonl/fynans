import { NotFoundException } from '@nestjs/common';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { GetPaymentMethodByIdUseCase } from './get-payment-method-by-id.use-case';
import { UpdatePaymentMethodUseCase } from './update-payment-method.use-case';
import { DeletePaymentMethodUseCase } from './delete-payment-method.use-case';
import { VerifyPaymentMethodOwnershipUseCase } from './verify-payment-method-ownership.use-case';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';

const OWNER = 'owner-1';
const SECOND_USER = 'second-user-1';
const CARD = 'payment-method-1';

describe('payment method authorization', () => {
  let paymentMethodRepository: {
    findById: jest.Mock;
    findByUserIdAndName: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    recalculateBalance: jest.Mock;
  };
  let findOne: GetPaymentMethodByIdUseCase;
  let update: UpdatePaymentMethodUseCase;
  let remove: DeletePaymentMethodUseCase;
  let verifyOwnership: VerifyPaymentMethodOwnershipUseCase;

  beforeEach(() => {
    paymentMethodRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: CARD, userId: OWNER, name: 'Card' }),
      findByUserIdAndName: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: CARD, userId: OWNER }),
      delete: jest.fn().mockResolvedValue(undefined),
      recalculateBalance: jest.fn().mockResolvedValue(undefined),
    };

    findOne = new GetPaymentMethodByIdUseCase(paymentMethodRepository as never);
    update = new UpdatePaymentMethodUseCase(paymentMethodRepository as never);
    remove = new DeletePaymentMethodUseCase(paymentMethodRepository as never);
    verifyOwnership = new VerifyPaymentMethodOwnershipUseCase(
      paymentMethodRepository as never,
    );
  });

  describe('a second user', () => {
    it('cannot read the account', async () => {
      await expect(findOne.execute(CARD, SECOND_USER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('cannot rename it or rewrite its opening balance', async () => {
      await expect(
        update.execute(
          CARD,
          SECOND_USER,
          new UpdatePaymentMethodDto({ name: 'Seized', initialBalance: 9999 }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(paymentMethodRepository.update).not.toHaveBeenCalled();
    });

    it('cannot delete it', async () => {
      await expect(remove.execute(CARD, SECOND_USER)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(paymentMethodRepository.delete).not.toHaveBeenCalled();
    });

    it('cannot attach a transaction to it', async () => {
      await expect(
        verifyOwnership.execute(CARD, SECOND_USER),
      ).rejects.toBeInstanceOf(DomainForbiddenException);
    });

    it('is told the account is missing rather than that it is forbidden', async () => {
      paymentMethodRepository.findById.mockResolvedValueOnce(null);

      const missing = await findOne
        .execute('no-such-card', OWNER)
        .catch((error: Error) => error);
      const forbidden = await findOne
        .execute(CARD, SECOND_USER)
        .catch((error: Error) => error);

      expect(missing).toBeInstanceOf(NotFoundException);
      expect((forbidden as Error).message).toBe((missing as Error).message);
    });
  });

  describe('the owner', () => {
    it('reads the account', async () => {
      await expect(findOne.execute(CARD, OWNER)).resolves.toEqual(
        expect.objectContaining({ id: CARD }),
      );
    });

    it('updates the account', async () => {
      await update.execute(
        CARD,
        OWNER,
        new UpdatePaymentMethodDto({ name: 'Everyday card' }),
      );

      expect(paymentMethodRepository.update).toHaveBeenCalledWith(CARD, {
        name: 'Everyday card',
      });
    });

    it('deletes the account', async () => {
      await remove.execute(CARD, OWNER);

      expect(paymentMethodRepository.delete).toHaveBeenCalledWith(CARD);
    });

    it('may attach a transaction to it', async () => {
      await expect(
        verifyOwnership.execute(CARD, OWNER),
      ).resolves.toBeUndefined();
    });
  });
});
