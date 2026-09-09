import { readFileSync } from 'fs';
import { join } from 'path';
import { BaseFilters } from '~common/dto/base-filters.dto';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';
import { ExpenseFilters } from './expense-filters.dto';

const repositoryInterface = join(
  __dirname,
  '../../domain/repositories/expense.repository.interface.ts',
);

describe('ExpenseFilters', () => {
  it('is the only declaration of the expense filter shape', () => {
    const source = readFileSync(repositoryInterface, 'utf8');

    expect(source).not.toMatch(/interface ExpenseFilters\b/);
    expect(source).toContain(
      "from '../../application/dto/expense-filters.dto'",
    );
  });

  it('extends the shared base filters rather than restating them', () => {
    const filters = new ExpenseFilters({
      userId: 'user-1',
      familyId: 'family-1',
      search: 'qumësht',
      status: TransactionStatus.CONFIRMED,
    });

    expect(filters).toBeInstanceOf(BaseFilters);
    expect(filters.userId).toBe('user-1');
    expect(filters.familyId).toBe('family-1');
    expect(filters.search).toBe('qumësht');
    expect(filters.status).toBe(TransactionStatus.CONFIRMED);
  });
});

describe('ExpenseStatistics', () => {
  it('is the only declaration of the expense statistics shape', () => {
    const source = readFileSync(repositoryInterface, 'utf8');

    expect(source).not.toMatch(/interface ExpenseStatistics\b/);
    expect(source).toContain(
      "from '../../application/dto/expense-statistics.dto'",
    );
  });

  it('is not restated by the rest response dto', () => {
    const source = readFileSync(
      join(__dirname, '../../../rest/dto/expense-statistics-response.dto.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/(interface|class) ExpenseStatistics\b/);
    expect(source).toContain(
      "from '../../core/application/dto/expense-statistics.dto'",
    );
  });
});
