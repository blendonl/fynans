import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { bearer } from 'better-auth/plugins';

export function createBetterAuthInstance(prisma: PrismaClient) {
  const trustedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

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
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        enabled: !!process.env.GOOGLE_CLIENT_ID,
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID || '',
        clientSecret: process.env.APPLE_CLIENT_SECRET || '',
        enabled: !!process.env.APPLE_CLIENT_ID,
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
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
  });
}
