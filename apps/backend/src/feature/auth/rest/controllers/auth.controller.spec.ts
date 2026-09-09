import { Server } from 'http';
import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';
import { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from '../../core/application/services/auth.service';
import { SessionCacheService } from '../../core/application/services/session-cache.service';
import { AuthController } from './auth.controller';

const GLOBAL_THROTTLE_LIMIT = 120;
const KNOWN_EMAIL = 'registered@example.com';
const UNKNOWN_EMAIL = 'nobody@example.com';

describe('AuthController password reset and verification', () => {
  let app: INestApplication;
  let server: Server;
  let requestedResets: string[];
  let requestedVerifications: string[];
  let resetPasswordOutcome: () => Promise<void>;
  let currentUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };

  const authService = {
    requestPasswordReset: (email: string) => {
      requestedResets.push(email);
      return Promise.resolve();
    },
    requestEmailVerification: (email: string) => {
      requestedVerifications.push(email);
      return Promise.resolve();
    },
    resetPassword: () => resetPasswordOutcome(),
  };

  const sessionCache = { invalidate: () => Promise.resolve() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: SessionCacheService, useValue: sessionCache },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: unknown }).user = currentUser;
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    server = app.getHttpServer() as Server;

    await app.init();
  });

  beforeEach(() => {
    requestedResets = [];
    requestedVerifications = [];
    resetPasswordOutcome = () => Promise.resolve();
    currentUser = {
      id: 'user-a',
      email: KNOWN_EMAIL,
      firstName: 'Test',
      lastName: 'User',
      emailVerified: false,
    };
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers a reset request for an unknown address exactly as for a known one', async () => {
    const known = await request(server)
      .post('/auth/forgot-password')
      .send({ email: KNOWN_EMAIL });
    const unknown = await request(server)
      .post('/auth/forgot-password')
      .send({ email: UNKNOWN_EMAIL });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(known.status);
    expect(unknown.body).toEqual(known.body);
  });

  it('hands both addresses to the service so neither is short-circuited', async () => {
    await request(server)
      .post('/auth/forgot-password')
      .send({ email: KNOWN_EMAIL });
    await request(server)
      .post('/auth/forgot-password')
      .send({ email: UNKNOWN_EMAIL });

    expect(requestedResets).toEqual([KNOWN_EMAIL, UNKNOWN_EMAIL]);
  });

  it('answers a verification request identically for any address', async () => {
    const known = await request(server)
      .post('/auth/send-verification-email')
      .send({ email: KNOWN_EMAIL });
    const unknown = await request(server)
      .post('/auth/send-verification-email')
      .send({ email: UNKNOWN_EMAIL });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(known.status);
    expect(unknown.body).toEqual(known.body);
    expect(requestedVerifications).toEqual([KNOWN_EMAIL, UNKNOWN_EMAIL]);
  });

  it('rejects a new password shorter than the minimum before reaching the service', async () => {
    let called = false;
    resetPasswordOutcome = () => {
      called = true;
      return Promise.resolve();
    };

    await request(server)
      .post('/auth/reset-password')
      .send({ token: 'a-token', newPassword: 'short' })
      .expect(400);

    expect(called).toBe(false);
  });

  it('reports an expired or already used token as a bad request', async () => {
    resetPasswordOutcome = () =>
      Promise.reject(
        new BadRequestException('This password reset link is invalid'),
      );

    const response = await request(server)
      .post('/auth/reset-password')
      .send({ token: 'stale-token', newPassword: 'a-long-enough-password' });

    expect(response.status).toBe(400);
  });

  it('confirms a successful reset', async () => {
    const response = await request(server)
      .post('/auth/reset-password')
      .send({ token: 'fresh-token', newPassword: 'a-long-enough-password' })
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('reports whether the current user has verified their email', async () => {
    const response = await request(server).get('/auth/me').expect(200);

    expect(response.body).toMatchObject({ emailVerified: false });
  });

  it('throttles reset requests far tighter than the global default', () => {
    const throttledRoutes = [
      'forgotPassword',
      'resetPassword',
      'sendVerificationEmail',
    ];

    for (const route of throttledRoutes) {
      const handler = Object.getOwnPropertyDescriptor(
        AuthController.prototype,
        route,
      )?.value as object;

      const limit = Reflect.getMetadata(
        `${THROTTLER_LIMIT}default`,
        handler,
      ) as number;
      const ttl = Reflect.getMetadata(
        `${THROTTLER_TTL}default`,
        handler,
      ) as number;

      expect(limit).toBeLessThan(GLOBAL_THROTTLE_LIMIT);
      expect(ttl).toBeGreaterThan(0);
    }
  });
});
