import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { validateEnv } from './env.validation';

const SRC = join(__dirname, '../..');

const REQUIRED: Record<string, string> = {
  CORS_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://admin:admin@localhost:5432/db',
  BETTER_AUTH_SECRET: 'a-test-secret-that-is-at-least-32-characters',
  BETTER_AUTH_URL: 'http://localhost:3001',
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return sourceFiles(full);
    }
    return full.endsWith('.ts') && !full.endsWith('.spec.ts') ? [full] : [];
  });
}

describe('validateEnv', () => {
  it('accepts a complete environment', () => {
    expect(() => validateEnv(REQUIRED)).not.toThrow();
  });

  it('rejects a missing required variable, naming it', () => {
    const { DATABASE_URL: _omitted, ...incomplete } = REQUIRED;

    expect(() => validateEnv(incomplete)).toThrow(/DATABASE_URL/);
  });

  it('rejects a BETTER_AUTH_SECRET shorter than 32 characters', () => {
    expect(() =>
      validateEnv({ ...REQUIRED, BETTER_AUTH_SECRET: 'too-short' }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('transforms PORT into a number', () => {
    expect(validateEnv({ ...REQUIRED, PORT: '4000' }).PORT).toBe(4000);
  });

  it('rejects a REPORTING_TIMEZONE that is not an IANA zone', () => {
    expect(() =>
      validateEnv({ ...REQUIRED, REPORTING_TIMEZONE: 'Mars/Olympus' }),
    ).toThrow(/REPORTING_TIMEZONE/);
  });

  describe('RECEIPT_NORMALIZE_NAMES', () => {
    it('is part of the schema, matching .env.example', () => {
      expect(readFileSync(join(SRC, '../.env.example'), 'utf8')).toContain(
        'RECEIPT_NORMALIZE_NAMES',
      );
      expect(validateEnv(REQUIRED).RECEIPT_NORMALIZE_NAMES).toBe('false');
    });

    it('passes an explicit value through', () => {
      expect(
        validateEnv({ ...REQUIRED, RECEIPT_NORMALIZE_NAMES: 'true' })
          .RECEIPT_NORMALIZE_NAMES,
      ).toBe('true');
    });
  });
});

describe('direct process.env access', () => {
  it('is confined to the env validation module', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => readFileSync(file, 'utf8').includes('process.env'))
      .map((file) => file.slice(SRC.length + 1));

    expect(offenders).toEqual(['common/config/env.validation.ts']);
  });
});

describe('ConfigModule wiring', () => {
  it('hands the zod schema to ConfigModule.forRoot', () => {
    const appModule = readFileSync(join(SRC, 'app.module.ts'), 'utf8');

    expect(appModule).toContain('validate: validateEnv');
    expect(appModule).toContain('isGlobal: true');
  });
});
