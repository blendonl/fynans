import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { FamilyBalanceService } from './family-balance.service';
import {
  FamilyBalanceSnapshot,
  IFamilyRepository,
} from '../../domain/repositories/family.repository.interface';
import { TransactionAmountNormalizer } from '../../../../transaction/core/domain/services/transaction-amount.normalizer';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { Transaction } from '../../../../transaction/core/domain/entities/transaction.entity';

const FAMILY = 'family-1';
const ALICE = 'alice';
const BOB = 'bob';

interface LedgerEntry {
  id: string;
  userId: string;
  type: TransactionType;
  value: Decimal;
  status: TransactionStatus;
}

class FamilyLedger implements Partial<IFamilyRepository> {
  private readonly entries = new Map<string, LedgerEntry>();
  private readonly members = [ALICE, BOB];
  private cachedFamilyBalance = new Decimal(0);
  private readonly cachedMemberBalances = new Map<string, Decimal>([
    [ALICE, new Decimal(0)],
    [BOB, new Decimal(0)],
  ]);

  record(entry: LedgerEntry): Transaction {
    this.entries.set(entry.id, { ...entry });
    return this.asTransaction(entry);
  }

  confirm(id: string): Transaction {
    const entry = this.entries.get(id)!;
    entry.status = TransactionStatus.CONFIRMED;
    return this.asTransaction(entry);
  }

  reject(id: string): Transaction {
    const entry = this.entries.get(id)!;
    entry.status = TransactionStatus.REJECTED;
    return this.asTransaction(entry);
  }

  changeValue(id: string, value: Decimal): void {
    this.entries.get(id)!.value = value;
  }

  remove(id: string): void {
    this.entries.delete(id);
  }

  corruptFamilyBalance(delta: Decimal): void {
    this.cachedFamilyBalance = this.cachedFamilyBalance.plus(delta);
  }

  incrementBalances(
    familyId: string,
    userId: string,
    delta: Decimal,
  ): Promise<void> {
    expect(familyId).toBe(FAMILY);
    this.cachedFamilyBalance = this.cachedFamilyBalance.plus(delta);
    this.cachedMemberBalances.set(
      userId,
      (this.cachedMemberBalances.get(userId) ?? new Decimal(0)).plus(delta),
    );
    return Promise.resolve();
  }

  computeBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    const memberBalances = new Map<string, Decimal>(
      this.members.map((userId) => [userId, new Decimal(0)]),
    );
    let balance = new Decimal(0);

    for (const entry of this.entries.values()) {
      if (entry.status !== TransactionStatus.CONFIRMED) continue;

      const signed = TransactionAmountNormalizer.signedTotal(
        entry.type,
        TransactionAmountNormalizer.normalize(entry),
      );
      memberBalances.set(
        entry.userId,
        (memberBalances.get(entry.userId) ?? new Decimal(0)).plus(signed),
      );
      balance = balance.plus(signed);
    }

    return Promise.resolve({ familyId, balance, memberBalances });
  }

  readBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    return Promise.resolve({
      familyId,
      balance: this.cachedFamilyBalance,
      memberBalances: new Map(this.cachedMemberBalances),
    });
  }

  async recalculateBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    const computed = await this.computeBalances(familyId);
    this.cachedFamilyBalance = computed.balance;
    for (const [userId, balance] of computed.memberBalances) {
      this.cachedMemberBalances.set(userId, balance);
    }
    return computed;
  }

  findAllIds(): Promise<string[]> {
    return Promise.resolve([FAMILY]);
  }

  private asTransaction(entry: LedgerEntry): Transaction {
    return {
      id: entry.id,
      userId: entry.userId,
      type: entry.type,
      value: entry.value,
      status: entry.status,
      familyId: FAMILY,
    } as unknown as Transaction;
  }
}

describe('FamilyBalanceService balance invariant', () => {
  let ledger: FamilyLedger;
  let service: FamilyBalanceService;

  const expectBalanced = async () => {
    const report = await service.inspect(FAMILY);
    expect(report.family.drift.toString()).toBe('0');
    for (const member of report.members) {
      expect(member.drift.toString()).toBe('0');
    }
    expect(report.isBalanced).toBe(true);
  };

  const expense = (id: string, userId: string, value: string) => ({
    id,
    userId,
    type: TransactionType.EXPENSE,
    value: new Decimal(value),
    status: TransactionStatus.CONFIRMED,
  });

  const income = (id: string, userId: string, value: string) => ({
    id,
    userId,
    type: TransactionType.INCOME,
    value: new Decimal(value),
    status: TransactionStatus.CONFIRMED,
  });

  beforeEach(() => {
    ledger = new FamilyLedger();
    service = new FamilyBalanceService(ledger as unknown as IFamilyRepository);
  });

  it('holds after creating a confirmed expense', async () => {
    const transaction = ledger.record(expense('t1', ALICE, '25.50'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, transaction);

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('-25.5');
  });

  it('holds after creating a confirmed income', async () => {
    const transaction = ledger.record(income('t1', BOB, '100'));
    await service.updateBalancesAfterTransaction(FAMILY, BOB, transaction);

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('100');
  });

  it('holds across many concurrent creates', async () => {
    const transactions = Array.from({ length: 20 }, (_, index) =>
      ledger.record(
        expense(`t${index}`, index % 2 === 0 ? ALICE : BOB, '3.33'),
      ),
    );

    await Promise.all(
      transactions.map((transaction) =>
        service.updateBalancesAfterTransaction(
          FAMILY,
          transaction.userId,
          transaction,
        ),
      ),
    );

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('-66.6');
  });

  it('holds after approving a pending expense', async () => {
    ledger.record({
      ...expense('t1', ALICE, '40'),
      status: TransactionStatus.PENDING,
    });

    await expectBalanced();

    const confirmed = ledger.confirm('t1');
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, confirmed);

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('-40');
  });

  it('holds after rejecting a pending expense', async () => {
    ledger.record({
      ...expense('t1', ALICE, '40'),
      status: TransactionStatus.PENDING,
    });
    ledger.reject('t1');

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('0');
  });

  it('holds after updating an expense amount and recalculating', async () => {
    const transaction = ledger.record(expense('t1', ALICE, '25'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, transaction);

    ledger.changeValue('t1', new Decimal('75'));
    await service.recalculateBalances(FAMILY);

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('-75');
  });

  it('holds after deleting an expense and recalculating', async () => {
    const first = ledger.record(expense('t1', ALICE, '25'));
    const second = ledger.record(expense('t2', BOB, '10'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, first);
    await service.updateBalancesAfterTransaction(FAMILY, BOB, second);

    ledger.remove('t1');
    await service.recalculateBalances(FAMILY);

    await expectBalanced();
    const report = await service.inspect(FAMILY);
    expect(report.family.cached.toString()).toBe('-10');
    expect(
      report.members
        .find((member) => member.userId === ALICE)!
        .cached.toString(),
    ).toBe('0');
  });

  it('holds when a transaction is reversed instead of recalculated', async () => {
    const transaction = ledger.record(expense('t1', ALICE, '25'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, transaction);

    ledger.remove('t1');
    await service.reverseBalancesAfterTransaction(FAMILY, ALICE, transaction);

    await expectBalanced();
  });

  it('reports drift when a cached balance diverges', async () => {
    const transaction = ledger.record(expense('t1', ALICE, '25'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, transaction);

    ledger.corruptFamilyBalance(new Decimal('7'));

    const report = await service.inspect(FAMILY);
    expect(report.isBalanced).toBe(false);
    expect(report.family.drift.toString()).toBe('7');
    expect(report.repaired).toBe(false);
  });

  it('repairs drift when reconciling', async () => {
    const transaction = ledger.record(expense('t1', ALICE, '25'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, transaction);
    ledger.corruptFamilyBalance(new Decimal('-13.5'));

    const report = await service.reconcile(FAMILY);

    expect(report.repaired).toBe(true);
    await expectBalanced();
  });

  it('leaves a balanced family untouched when reconciling', async () => {
    const transaction = ledger.record(expense('t1', ALICE, '25'));
    await service.updateBalancesAfterTransaction(FAMILY, ALICE, transaction);

    const report = await service.reconcile(FAMILY);

    expect(report.isBalanced).toBe(true);
    expect(report.repaired).toBe(false);
  });

  it('reconciles every family', async () => {
    ledger.corruptFamilyBalance(new Decimal('5'));

    const reports = await service.reconcileAll();

    expect(reports).toHaveLength(1);
    expect(reports[0].familyId).toBe(FAMILY);
    await expectBalanced();
  });
});
