import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PRISMA_DIR = join(__dirname, '..', '..', '..', 'prisma');
const SCHEMA_DIR = join(PRISMA_DIR, 'schema');
const MIGRATIONS_DIR = join(PRISMA_DIR, 'migrations');

function schema(file: string): string {
  return readFileSync(join(SCHEMA_DIR, file), 'utf8');
}

function migrationNames(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((entry) => entry !== 'migration_lock.toml')
    .sort();
}

function allMigrationSql(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((entry) => entry !== 'migration_lock.toml')
    .map((entry) =>
      readFileSync(join(MIGRATIONS_DIR, entry, 'migration.sql'), 'utf8'),
    )
    .join('\n');
}

describe('prisma schema', () => {
  describe('money and quantity precision', () => {
    const moneyColumns: [string, RegExp][] = [
      ['transaction.prisma', /value\s+Decimal\s+@db\.Decimal\(12, 2\)/],
      ['expense-item.prisma', /price\s+Decimal @db\.Decimal\(12, 2\)/],
      ['expense-item.prisma', /discount Decimal @db\.Decimal\(12, 2\)/],
      ['store.prisma', /price\s+Decimal @db\.Decimal\(12, 2\)/],
      ['store.prisma', /discount\s+Decimal\s+@db\.Decimal\(12, 2\)/],
      [
        'payment-method.prisma',
        /initialBalance Decimal.*@db\.Decimal\(12, 2\)/,
      ],
      [
        'payment-method.prisma',
        /currentBalance Decimal.*@db\.Decimal\(12, 2\)/,
      ],
      ['basket.prisma', /price\s+Decimal\? @db\.Decimal\(12, 2\)/],
      ['family.prisma', /balance Decimal @default\(0\) @db\.Decimal\(12, 2\)/],
    ];

    it.each(moneyColumns)(
      'gives %s money columns two decimals',
      (file, pattern) => {
        expect(schema(file)).toMatch(pattern);
      },
    );

    const quantityColumns: [string, RegExp][] = [
      [
        'expense-item.prisma',
        /quantity Decimal @default\(1\) @db\.Decimal\(12, 3\)/,
      ],
      [
        'basket.prisma',
        /quantity\s+Decimal @default\(1\) @db\.Decimal\(12, 3\)/,
      ],
      ['store.prisma', /value\s+Decimal @db\.Decimal\(12, 3\)/],
    ];

    it.each(quantityColumns)(
      'gives %s quantity columns three decimals',
      (file, pattern) => {
        expect(schema(file)).toMatch(pattern);
      },
    );

    it('leaves no bare Decimal column behind', () => {
      const bare = readdirSync(SCHEMA_DIR).flatMap((file) =>
        schema(file)
          .split('\n')
          .filter(
            (line) =>
              /\bDecimal\??\s/.test(line) &&
              !line.includes('@db.Decimal') &&
              !line.trim().startsWith('//'),
          )
          .map((line) => `${file}: ${line.trim()}`),
      );

      expect(bare).toEqual([]);
    });
  });

  describe('foreign key indexes used in filters', () => {
    const indexes: [string, string][] = [
      ['expense.prisma', '@@index([categoryId])'],
      ['expense.prisma', '@@index([storeId])'],
      ['expense.prisma', '@@index([parentId])'],
      ['expense-item.prisma', '@@index([expenseId])'],
      ['expense-item.prisma', '@@index([itemId])'],
      ['income.prisma', '@@index([categoryId])'],
      ['income.prisma', '@@index([parentId])'],
      ['store.prisma', '@@index([storeItemId])'],
      ['store.prisma', '@@index([parentId])'],
      ['transaction.prisma', '@@index([recordedAt])'],
    ];

    it.each(indexes)('indexes %s on %s', (file, index) => {
      expect(schema(file)).toContain(index);
    });

    it('indexes both sides of the store item join', () => {
      const storeItem = schema('store.prisma').split('model StoreItem {')[1];
      expect(storeItem).toContain('@@index([itemId])');
      expect(storeItem).toContain('@@index([storeId])');
    });
  });

  describe('income has no store', () => {
    it('drops the column from the model', () => {
      expect(schema('income.prisma')).not.toContain('storeId');
    });

    it('drops the column from the database', () => {
      expect(allMigrationSql()).toContain(
        'ALTER TABLE "income" DROP COLUMN "store_id"',
      );
    });

    it('defers the drop until after the soft-delete migration', () => {
      const names = migrationNames();
      const drop = names.indexOf('20260909036000_drop_income_store_id');
      const softDelete = names.indexOf(
        '20260909035000_add_soft_delete_and_audit_log',
      );

      expect(drop).toBeGreaterThan(-1);
      expect(drop).toBeGreaterThan(softDelete);
      expect(names[names.length - 1]).toBe(
        '20260909036000_drop_income_store_id',
      );
    });
  });

  describe('basket uniqueness', () => {
    it('no longer keys a basket on user and scope', () => {
      expect(schema('basket.prisma')).not.toContain('@@unique([userId, scope]');
    });

    it('allows one basket per family', () => {
      expect(schema('basket.prisma')).toContain('@@unique([familyId])');
    });

    it('keeps one personal basket per user with a partial unique index', () => {
      expect(allMigrationSql()).toContain(
        'CREATE UNIQUE INDEX "basket_personal_user_id_key" ON "basket"("user_id") WHERE "scope" = \'PERSONAL\'',
      );
    });
  });

  describe('cascades and primary keys', () => {
    it('cascades expense items when their expense is removed', () => {
      expect(schema('expense-item.prisma')).toContain(
        'expense  Expense             @relation(fields: [expenseId], references: [id], onDelete: Cascade)',
      );
    });

    it('cascades a receipt when its expense is removed', () => {
      expect(schema('receipt.prisma')).toContain(
        'expense Expense? @relation(fields: [expenseId], references: [id], onDelete: Cascade)',
      );
    });

    it('refuses to strand a family transaction', () => {
      expect(schema('transaction.prisma')).toContain(
        'family        Family?        @relation(fields: [familyId], references: [id], onDelete: Restrict)',
      );
    });

    it('guards the family scope invariant in the database', () => {
      expect(allMigrationSql()).toContain('transaction_family_scope_check');
    });

    const generatedIds: [string, string][] = [
      ['expense.prisma', 'model Expense {'],
      ['income.prisma', 'model Income {'],
      ['store.prisma', 'model StoreItemDiscount {'],
    ];

    it.each(generatedIds)('generates the %s primary key', (file, marker) => {
      const model = schema(file).split(marker)[1].split('}')[0];
      expect(model).toMatch(/id\s+String @id @default\(uuid\(\)\)/);
    });

    it('no longer declares ad-hoc composite primary keys', () => {
      expect(schema('expense.prisma')).not.toContain('@@id([id])');
      expect(schema('income.prisma')).not.toContain('@@id([id])');
    });
  });

  describe('audit trail', () => {
    const softDeleted = [
      'transaction.prisma',
      'expense.prisma',
      'income.prisma',
    ];

    it.each(softDeleted)('soft deletes %s', (file) => {
      expect(schema(file)).toMatch(
        /deletedAt\s+DateTime\? @map\("deleted_at"\)/,
      );
    });

    it('keeps a financial audit log keyed to an actor', () => {
      const audit = schema('audit.prisma');
      expect(audit).toContain('model FinancialAuditLog {');
      expect(audit).toContain('actor User @relation');
    });
  });
});
