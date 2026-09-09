import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import {
  DomainConflictException,
  DomainForbiddenException,
  DomainNotFoundException,
  DomainUnauthorizedException,
  DomainValidationException,
} from '../exceptions/domain.exceptions';
import {
  AllExceptionsFilter,
  CORRELATION_ID_HEADER,
} from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let setHeader: jest.Mock;
  let request: { method: string; url: string; headers: Record<string, string> };

  const host = (): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ status, json, setHeader }),
        getRequest: () => request,
      }),
    }) as unknown as ArgumentsHost;

  const body = () => json.mock.calls[0][0] as Record<string, unknown>;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    setHeader = jest.fn();
    request = { method: 'GET', url: '/expenses', headers: {} };
    filter = new AllExceptionsFilter();
    jest.spyOn(filter['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
  });

  describe('domain exceptions', () => {
    const cases: [Error, number][] = [
      [new DomainNotFoundException('gone'), HttpStatus.NOT_FOUND],
      [new DomainForbiddenException('nope'), HttpStatus.FORBIDDEN],
      [new DomainUnauthorizedException('who'), HttpStatus.UNAUTHORIZED],
      [new DomainValidationException('bad'), HttpStatus.BAD_REQUEST],
      [new DomainConflictException('dup'), HttpStatus.CONFLICT],
    ];

    it.each(cases)('maps %p to its http status', (exception, expected) => {
      filter.catch(exception, host());

      expect(status).toHaveBeenCalledWith(expected);
      expect(body().message).toBe(exception.message);
    });
  });

  describe('prisma errors', () => {
    const known = (code: string) =>
      new Prisma.PrismaClientKnownRequestError('boom', {
        code,
        clientVersion: 'test',
      });

    it('maps P2002 unique violations to 409', () => {
      filter.catch(known('P2002'), host());

      expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(body().error).toBe('P2002');
      expect(body().message).toBe('A record with these values already exists');
    });

    it('maps P2025 missing records to 404', () => {
      filter.catch(known('P2025'), host());

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('maps P2003 foreign key violations to 400', () => {
      filter.catch(known('P2003'), host());

      expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('falls back to 500 for an unmapped prisma code', () => {
      filter.catch(known('P9999'), host());

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('never leaks the raw prisma message', () => {
      filter.catch(known('P2002'), host());

      expect(JSON.stringify(body())).not.toContain('boom');
    });
  });

  it('preserves the status and body of a nest HttpException', () => {
    filter.catch(new HttpException('teapot', 418), host());

    expect(status).toHaveBeenCalledWith(418);
    expect(body().message).toBe('teapot');
  });

  it('reports an unknown error as a generic 500', () => {
    filter.catch(new Error('secret internals'), host());

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body().message).toBe('Internal server error');
    expect(JSON.stringify(body())).not.toContain('secret internals');
  });

  describe('correlation id', () => {
    it('generates one when the request carries none', () => {
      filter.catch(new DomainNotFoundException(), host());

      expect(body().correlationId).toEqual(expect.any(String));
      expect(setHeader).toHaveBeenCalledWith(
        CORRELATION_ID_HEADER,
        body().correlationId,
      );
    });

    it('reuses the inbound correlation id', () => {
      request.headers[CORRELATION_ID_HEADER] = 'trace-42';

      filter.catch(new DomainNotFoundException(), host());

      expect(body().correlationId).toBe('trace-42');
      expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, 'trace-42');
    });

    it('logs 500s at error level with the correlation id', () => {
      const error = jest.spyOn(filter['logger'], 'error');

      filter.catch(new Error('kaboom'), host());

      expect(error.mock.calls[0][0]).toContain(body().correlationId as string);
    });
  });
});
