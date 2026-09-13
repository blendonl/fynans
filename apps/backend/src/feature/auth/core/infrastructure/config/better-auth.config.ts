import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { bearer } from 'better-auth/plugins';
import { appEnv, type EnvConfig } from '~common/config/env.validation';

function usesSecureCookies(env: EnvConfig): boolean {
  return (
    env.NODE_ENV === 'production' || env.BETTER_AUTH_URL.startsWith('https://')
  );
}

export function createBetterAuthInstance(prisma: PrismaClient) {
  const env = appEnv();
  const trustedOrigins = env.CORS_ORIGIN.split(',');
  const secureCookies = usesSecureCookies(env);
  const cookieDomain = env.COOKIE_DOMAIN || undefined;

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        enabled: env.GOOGLE_CLIENT_ID !== '',
      },
      apple: {
        clientId: env.APPLE_CLIENT_ID,
        clientSecret: env.APPLE_CLIENT_SECRET,
        enabled: env.APPLE_CLIENT_ID !== '',
      },
    },
    user: {
      additionalFields: {
        firstName: {
          type: 'string',
          defaultValue: '',
          fieldName: 'firstName',
        },
        lastName: {
          type: 'string',
          defaultValue: '',
          fieldName: 'lastName',
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (user.name && !user.firstName) {
              const parts = user.name.trim().split(/\s+/);
              const firstName = parts[0] || '';
              const lastName = parts.slice(1).join(' ') || '';
              return { data: { ...user, firstName, lastName } };
            }
            return { data: user };
          },
        },
      },
    },
    plugins: [bearer()],
    trustedOrigins,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    account: {
      storeStateStrategy: 'cookie',
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: cookieDomain !== undefined,
        domain: cookieDomain,
      },
      useSecureCookies: secureCookies,
      defaultCookieAttributes: {
        sameSite: secureCookies ? 'none' : 'lax',
        secure: secureCookies,
      },
    },
  });
}
