import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z
    .string()
    .default('3001')
    .transform(Number)
    .pipe(z.number().int().positive()),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),

  // Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),

  // OAuth (optional - social login)
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  APPLE_CLIENT_ID: z.string().optional().default(''),
  APPLE_CLIENT_SECRET: z.string().optional().default(''),

  // Cookies
  COOKIE_DOMAIN: z.string().optional().default(''),

  // Redis (optional - defaults provided)
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z
    .string()
    .optional()
    .default('6379')
    .transform(Number)
    .pipe(z.number().int().positive()),

  // Web Push (optional)
  VAPID_PUBLIC_KEY: z.string().optional().default(''),
  VAPID_PRIVATE_KEY: z.string().optional().default(''),
  VAPID_SUBJECT: z.string().optional().default(''),

  // OCR/Vision services (optional - have defaults in service layer)
  PADDLEOCR_SERVICE_URL: z.string().optional(),
  PADDLEOCR_TIMEOUT: z.string().optional(),
  OCR_ENGINE: z.string().optional(),
  OLLAMA_SERVICE_URL: z.string().optional(),
  OLLAMA_MODEL: z.string().optional(),
  OLLAMA_VISION_MODEL: z.string().optional(),
  OLLAMA_TIMEOUT: z.string().optional(),
  OLLAMA_KEEP_ALIVE: z.string().optional(),
  VISION_PARSER: z.string().optional(),
  DONUT_SERVICE_URL: z.string().optional(),
  DONUT_TIMEOUT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Environment validation failed:\n${errors}\n\nCheck your .env file against .env.example`,
    );
  }

  return result.data;
}
