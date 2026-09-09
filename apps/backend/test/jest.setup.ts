import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEST_DEFAULTS: Record<string, string> = {
  NODE_ENV: 'test',
  CORS_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://admin:admin@localhost:5432/db',
  BETTER_AUTH_SECRET: 'a-test-secret-that-is-at-least-32-characters',
  BETTER_AUTH_URL: 'http://localhost:3001',
};

for (const [key, value] of Object.entries(TEST_DEFAULTS)) {
  process.env[key] ??= value;
}
