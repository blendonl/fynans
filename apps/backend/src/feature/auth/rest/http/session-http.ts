import { Request, Response } from 'express';

export function toSessionHeaders(request: Request): Headers {
  const headers = new Headers();
  const { authorization, cookie } = request.headers;

  if (authorization) {
    headers.set('authorization', authorization);
  }

  if (cookie) {
    headers.set('cookie', cookie);
  }

  return headers;
}

export function hasSessionCredentials(request: Request): boolean {
  return Boolean(request.headers.authorization || request.headers.cookie);
}

export function applySessionCookies(
  response: Response,
  cookies: string[],
): void {
  for (const cookie of cookies) {
    response.append('Set-Cookie', cookie);
  }
}

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

export function sessionCacheKey(request: Request): string | null {
  const bearer = bearerToken(request);
  const cookie = sessionCookieValue(request);

  if (!bearer && !cookie) {
    return null;
  }

  return `cookie=${cookie ?? ''}|bearer=${bearer ?? ''}`;
}

function bearerToken(request: Request): string | null {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

  return scheme === 'Bearer' && token ? token : null;
}

function sessionCookieValue(request: Request): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');

    if (separator === -1) {
      continue;
    }

    const name = part.slice(0, separator).trim();

    if (!SESSION_COOKIE_NAMES.includes(name)) {
      continue;
    }

    const value = part.slice(separator + 1).trim();

    if (value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}
