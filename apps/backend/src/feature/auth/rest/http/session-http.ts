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
