import { Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { bearer } from 'better-auth/plugins';
import {
  EmailMessage,
  EmailSender,
} from '~common/email/email-sender.interface';
import {
  emailVerificationEmail,
  passwordResetEmail,
} from '../email/auth-email.templates';

const RESET_PASSWORD_TOKEN_TTL_SECONDS = 60 * 60;
const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 60 * 60 * 24;

const logger = new Logger('BetterAuthEmail');

async function deliver(
  emailSender: EmailSender,
  message: EmailMessage,
): Promise<void> {
  try {
    await emailSender.send(message);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logger.error(`Could not deliver "${message.subject}": ${reason}`);
  }
}

function usesSecureCookies(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.BETTER_AUTH_URL?.startsWith('https://') === true
  );
}

function webAppOrigin(trustedOrigins: string[]): string {
  return trustedOrigins[0]?.trim() || 'http://localhost:3000';
}

function resetPasswordPageUrl(webOrigin: string, token: string): string {
  const url = new URL('/reset-password', webOrigin);
  url.searchParams.set('token', token);
  return url.href;
}

function withCallbackUrl(verificationUrl: string, callbackUrl: string): string {
  const url = new URL(verificationUrl);
  url.searchParams.set('callbackURL', callbackUrl);
  return url.href;
}

export function createBetterAuthInstance(
  prisma: PrismaClient,
  emailSender: EmailSender,
) {
  const trustedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
  const secureCookies = usesSecureCookies();
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  const webOrigin = webAppOrigin(trustedOrigins);
  const verifiedEmailCallbackUrl = new URL('/verify-email', webOrigin).href;

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: false,
      resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_TTL_SECONDS,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, token }) => {
        await deliver(
          emailSender,
          passwordResetEmail(
            user,
            resetPasswordPageUrl(webOrigin, token),
            RESET_PASSWORD_TOKEN_TTL_SECONDS / 60,
          ),
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
      sendVerificationEmail: async ({ user, url }) => {
        await deliver(
          emailSender,
          emailVerificationEmail(
            user,
            withCallbackUrl(url, verifiedEmailCallbackUrl),
          ),
        );
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 120,
      customRules: {
        '/request-password-reset': { window: 60, max: 3 },
        '/forget-password': { window: 60, max: 3 },
        '/reset-password': { window: 60, max: 5 },
        '/reset-password/:token': { window: 60, max: 5 },
        '/send-verification-email': { window: 60, max: 3 },
        '/verify-email': { window: 60, max: 10 },
      },
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
