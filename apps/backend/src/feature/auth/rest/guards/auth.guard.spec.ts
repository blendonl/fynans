import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { FamilyScopeGuard } from '~common/authorization/rest/guards/family-scope.guard';
import { User } from '~feature/user/core/domain/entities/user.entity';
import { AuthService } from '../../core/application/services/auth.service';
import { SessionCacheService } from '../../core/application/services/session-cache.service';
import { AuthGuard } from './auth.guard';

const TOKEN = 'a-session-token';
const COOKIE_VALUE = 'a-session-cookie-value';

const user = new User({
  id: 'user-1',
  email: 'a@b.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  emailVerified: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

interface FakeRequest {
  method: string;
  headers: Record<string, string>;
  user?: User;
}

class RouteHost {}
const routeHandler = () => undefined;

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => routeHandler,
    getClass: () => RouteHost,
  } as unknown as ExecutionContext;
}

function authenticatedRequest(): FakeRequest {
  return { method: 'GET', headers: { authorization: `Bearer ${TOKEN}` } };
}

function cookieRequest(name: string): FakeRequest {
  return {
    method: 'GET',
    headers: { cookie: `other=1; ${name}=${COOKIE_VALUE}; another=2` },
  };
}

describe('AuthGuard session caching', () => {
  let guard: AuthGuard;
  let validateRequestSession: jest.Mock;
  let cacheGet: jest.Mock;
  let cacheSet: jest.Mock;

  beforeEach(() => {
    validateRequestSession = jest.fn().mockResolvedValue(user);
    cacheGet = jest.fn().mockResolvedValue(null);
    cacheSet = jest.fn().mockResolvedValue(undefined);

    guard = new AuthGuard(
      { validateRequestSession } as unknown as AuthService,
      { get: cacheGet, set: cacheSet } as unknown as SessionCacheService,
      new Reflector(),
    );
  });

  it('validates and caches on a miss', async () => {
    const request = authenticatedRequest();

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(validateRequestSession).toHaveBeenCalled();
    expect(cacheSet).toHaveBeenCalledWith(TOKEN, user);
    expect(request.user).toBe(user);
  });

  it('serves a hit without touching better-auth or the database', async () => {
    cacheGet.mockResolvedValue(user);
    const request = authenticatedRequest();

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(validateRequestSession).not.toHaveBeenCalled();
    expect(cacheSet).not.toHaveBeenCalled();
    expect(request.user).toBe(user);
  });

  it('falls back to full validation when the cache is unavailable', async () => {
    cacheGet.mockResolvedValue(null);
    cacheSet.mockResolvedValue(undefined);
    const request = authenticatedRequest();

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(validateRequestSession).toHaveBeenCalled();
  });

  it('authenticates a cookie-only request and caches it under the cookie value', async () => {
    const request = cookieRequest('better-auth.session_token');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(validateRequestSession).toHaveBeenCalled();
    expect(cacheSet).toHaveBeenCalledWith(COOKIE_VALUE, user);
    expect(request.user).toBe(user);
  });

  it('recognises the secure cookie name', async () => {
    const request = cookieRequest('__Secure-better-auth.session_token');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(cacheSet).toHaveBeenCalledWith(COOKIE_VALUE, user);
  });

  it('serves a cookie-authenticated hit from the cache', async () => {
    cacheGet.mockResolvedValue(user);
    const request = cookieRequest('better-auth.session_token');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(cacheGet).toHaveBeenCalledWith(COOKIE_VALUE);
    expect(validateRequestSession).not.toHaveBeenCalled();
  });

  it('prefers the bearer token over a cookie when both are present', async () => {
    const request: FakeRequest = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${TOKEN}`,
        cookie: `better-auth.session_token=${COOKIE_VALUE}`,
      },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(cacheSet).toHaveBeenCalledWith(TOKEN, user);
  });

  it('still validates when a cookie carries no recognised session name', async () => {
    const request: FakeRequest = {
      method: 'GET',
      headers: { cookie: 'unrelated=1' },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);

    expect(validateRequestSession).toHaveBeenCalled();
    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('does not cache a session better-auth rejected', async () => {
    validateRequestSession.mockRejectedValue(new Error('expired'));

    await expect(
      guard.canActivate(contextFor(authenticatedRequest())),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('rejects a request with no credentials before consulting the cache', async () => {
    await expect(
      guard.canActivate(contextFor({ method: 'GET', headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(cacheGet).not.toHaveBeenCalled();
  });
});

describe('global guard ordering', () => {
  it('registers AuthGuard before the guards that read request.user', async () => {
    const { AppModule } = (await import('~/app.module')) as {
      AppModule: object;
    };

    const providers = Reflect.getMetadata('providers', AppModule) as {
      provide?: unknown;
      useClass?: unknown;
      useExisting?: unknown;
    }[];

    const globalGuards = providers
      .filter((provider) => provider.provide === APP_GUARD)
      .map((provider) => provider.useClass ?? provider.useExisting);

    expect(globalGuards).toContain(AuthGuard);
    expect(globalGuards).toContain(FamilyScopeGuard);
    expect(globalGuards.indexOf(AuthGuard)).toBeLessThan(
      globalGuards.indexOf(FamilyScopeGuard),
    );
  });
});
