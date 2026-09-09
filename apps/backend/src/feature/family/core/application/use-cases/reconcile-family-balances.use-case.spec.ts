import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { ReconcileFamilyBalancesUseCase } from './reconcile-family-balances.use-case';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const FAMILY = 'family-1';
const ADMIN = 'admin-1';
const MEMBER = 'member-1';

describe('ReconcileFamilyBalancesUseCase', () => {
  let familyRepository: { findMember: jest.Mock };
  let familyBalanceService: { reconcile: jest.Mock };
  let useCase: ReconcileFamilyBalancesUseCase;

  beforeEach(() => {
    familyRepository = {
      findMember: jest.fn().mockImplementation((_familyId: string, userId: string) => {
        if (userId === ADMIN) {
          return Promise.resolve({ canManageMembers: () => true });
        }
        if (userId === MEMBER) {
          return Promise.resolve({ canManageMembers: () => false });
        }
        return Promise.resolve(null);
      }),
    };
    familyBalanceService = {
      reconcile: jest.fn().mockResolvedValue({
        familyId: FAMILY,
        family: {
          cached: new Decimal(0),
          computed: new Decimal(0),
          drift: new Decimal(0),
        },
        members: [],
        isBalanced: true,
        repaired: false,
      }),
    };
    useCase = new ReconcileFamilyBalancesUseCase(
      familyRepository as never,
      familyBalanceService as never,
    );
  });

  it('reconciles for an owner or admin', async () => {
    const report = await useCase.execute(FAMILY, ADMIN);

    expect(report.familyId).toBe(FAMILY);
    expect(familyBalanceService.reconcile).toHaveBeenCalledWith(FAMILY);
  });

  it('rejects a plain member', async () => {
    await expect(useCase.execute(FAMILY, MEMBER)).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );
    expect(familyBalanceService.reconcile).not.toHaveBeenCalled();
  });

  it('rejects a non-member', async () => {
    await expect(useCase.execute(FAMILY, 'outsider')).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );
    expect(familyBalanceService.reconcile).not.toHaveBeenCalled();
  });
});
