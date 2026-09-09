import { SaveReceiptFileUseCase } from './save-receipt-file.use-case';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const member = 'member-1';
const outsider = 'outsider-1';

describe('SaveReceiptFileUseCase', () => {
  let receiptRepo: { create: jest.Mock };
  let storage: { upload: jest.Mock };
  let familyService: { verifyMembership: jest.Mock };
  let useCase: SaveReceiptFileUseCase;

  const inputFor = (userId: string, familyId?: string) => ({
    buffer: Buffer.from('image'),
    originalName: 'receipt.jpg',
    mimeType: 'image/jpeg',
    userId,
    familyId,
  });

  beforeEach(() => {
    receiptRepo = { create: jest.fn().mockResolvedValue({ id: 'receipt-1' }) };
    storage = { upload: jest.fn().mockResolvedValue(undefined) };
    familyService = {
      verifyMembership: jest
        .fn()
        .mockImplementation((_familyId: string, userId: string) => {
          if (userId !== member) {
            throw new DomainForbiddenException('Not a member of this family');
          }
          return Promise.resolve();
        }),
    };
    useCase = new SaveReceiptFileUseCase(
      receiptRepo as never,
      storage as never,
      familyService as never,
    );
  });

  it('rejects planting a receipt in a family the caller does not belong to', async () => {
    await expect(
      useCase.execute(inputFor(outsider, 'family-1')),
    ).rejects.toBeInstanceOf(DomainForbiddenException);

    expect(storage.upload).not.toHaveBeenCalled();
    expect(receiptRepo.create).not.toHaveBeenCalled();
  });

  it('stores the receipt for a member of the family', async () => {
    await useCase.execute(inputFor(member, 'family-1'));

    expect(familyService.verifyMembership).toHaveBeenCalledWith(
      'family-1',
      member,
    );
    expect(receiptRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: member, familyId: 'family-1' }),
    );
  });

  it('skips the membership check for a personal receipt', async () => {
    await useCase.execute(inputFor(outsider, undefined));

    expect(familyService.verifyMembership).not.toHaveBeenCalled();
    expect(receiptRepo.create).toHaveBeenCalled();
  });
});
