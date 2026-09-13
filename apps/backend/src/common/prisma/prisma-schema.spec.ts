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

function migrationSql(name: string): string {
  return readFileSync(join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8');
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
      const drop = names.indexOf('20260909040000_drop_income_store_id');
      const softDelete = names.indexOf(
        '20260909035000_add_soft_delete_and_audit_log',
      );

      expect(drop).toBeGreaterThan(-1);
      expect(drop).toBeGreaterThan(softDelete);
      expect(names[names.length - 1]).toBe(
        '20260909040000_drop_income_store_id',
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

  describe('multi-currency columns', () => {
    const CURRENCY_MIGRATION = '20260909037000_add_currency_columns';

    it('gives a user a reporting currency that is required and undefaulted', () => {
      const user = schema('schema.prisma').split('model User {')[1];
      expect(user).toMatch(
        /reportingCurrency String @map\("reporting_currency"\) @db\.Char\(3\)/,
      );
      expect(user).not.toMatch(/reportingCurrency[^\n]*@default/);
    });

    const nullableCurrencies: [string, RegExp][] = [
      ['payment-method.prisma', /currency\s+String\?\s+@db\.Char\(3\)/],
      ['transaction.prisma', /currency\s+String\?\s+@db\.Char\(3\)/],
    ];

    it.each(nullableCurrencies)(
      'leaves %s currency nullable',
      (file, pattern) => {
        expect(schema(file)).toMatch(pattern);
      },
    );

    it('stores the rate at eight decimals and the settled value at two', () => {
      const transaction = schema('transaction.prisma');
      expect(transaction).toMatch(
        /exchangeRate\s+Decimal\?\s+@map\("exchange_rate"\) @db\.Decimal\(18, 8\)/,
      );
      expect(transaction).toMatch(
        /settledValue\s+Decimal\?\s+@map\("settled_value"\) @db\.Decimal\(12, 2\)/,
      );
    });

    it('lands between the category re-ownership and the income store drop', () => {
      const names = migrationNames();
      expect(names.indexOf(CURRENCY_MIGRATION)).toBeGreaterThan(
        names.indexOf('20260909036000_own_categories_and_items'),
      );
      expect(names.indexOf(CURRENCY_MIGRATION)).toBeLessThan(
        names.indexOf('20260909040000_drop_income_store_id'),
      );
    });

    it('names the deploy-time currency exactly once', () => {
      expect(migrationSql(CURRENCY_MIGRATION).match(/'EUR'/g)).toHaveLength(1);
    });

    it('backfills in the order the rollout depends on', () => {
      const sql = migrationSql(CURRENCY_MIGRATION);
      const steps = [
        'SET "reporting_currency" = (SELECT "reporting_currency" FROM "_currency_backfill_parameter")',
        'UPDATE "payment_method" pm',
        'UPDATE "transaction" t',
        'UPDATE "transaction" SET "exchange_rate" = 1;',
        'UPDATE "transaction" SET "settled_value" = "value";',
      ].map((step) => sql.indexOf(step));

      expect(steps).not.toContain(-1);
      expect([...steps].sort((a, b) => a - b)).toEqual(steps);
    });

    it('derives the dependent currencies from the user row, not the parameter', () => {
      const sql = migrationSql(CURRENCY_MIGRATION);
      const derived = sql.match(/SET "currency" = u\."reporting_currency"/g);

      expect(derived).toHaveLength(2);
      expect(sql.match(/FROM "_currency_backfill_parameter"/g)).toHaveLength(1);
    });

    it('requires the user reporting currency after the backfill', () => {
      expect(migrationSql(CURRENCY_MIGRATION)).toContain(
        'ALTER TABLE "users" ALTER COLUMN "reporting_currency" SET NOT NULL',
      );
    });

    const currencyChecks: [string, string][] = [
      ['users_reporting_currency_check', 'reporting_currency'],
      ['payment_method_currency_check', 'currency'],
      ['transaction_currency_check', 'currency'],
    ];

    it.each(currencyChecks)(
      'constrains %s to an ISO 4217 shape',
      (name, column) => {
        const sql = migrationSql(CURRENCY_MIGRATION);
        expect(sql).toContain(`CONSTRAINT "${name}"`);
        expect(sql).toContain(`CHECK ("${column}" ~ '^[A-Z]{3}$')`);
      },
    );

    it('pins the exchange rate direction in the migration itself', () => {
      expect(migrationSql(CURRENCY_MIGRATION)).toContain(
        'settled_value = value * exchange_rate',
      );
    });

    it('states the rule for a transaction with no payment method', () => {
      const sql = migrationSql(CURRENCY_MIGRATION);
      expect(sql).toContain('NULL PAYMENT METHOD');
      expect(sql).toContain('the settlement currency IS the');
    });

    it('adds no index on any currency column', () => {
      expect(migrationSql(CURRENCY_MIGRATION)).not.toMatch(
        /CREATE\s+(UNIQUE\s+)?INDEX[^;]*currency/i,
      );
    });
  });
});
