import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Prisma } from 'prisma/generated/prisma/client';
import { DomainException } from '../exceptions/domain.exceptions';
import { domainExceptionToHttpStatus } from '../exceptions/domain-exception-status';
import {
  prismaErrorToHttpStatus,
  prismaErrorToMessage,
} from '../exceptions/prisma-error-status';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

interface ResolvedError {
  status: number;
  message: string | string[];
  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = this.resolveCorrelationId(request);
    const resolved = this.resolve(exception);

    this.log(correlationId, request, resolved, exception);

    response.setHeader(CORRELATION_ID_HEADER, correlationId);
    response.status(resolved.status).json({
      statusCode: resolved.status,
      message: resolved.message,
      error: resolved.error,
      correlationId,
    });
  }

  private resolveCorrelationId(request: Request | undefined): string {
    const header = request?.headers?.[CORRELATION_ID_HEADER];
    const value = Array.isArray(header) ? header[0] : header;
    return value && value.length > 0 ? value : randomUUID();
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof DomainException) {
      return {
        status: domainExceptionToHttpStatus(exception),
        message: exception.message,
        error: exception.name,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        return { status, message: body, error: exception.name };
      }
      const record = body as { message?: string | string[]; error?: string };
      return {
        status,
        message: record.message ?? exception.message,
        error: record.error ?? exception.name,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        status: prismaErrorToHttpStatus(exception.code),
        message: prismaErrorToMessage(exception.code),
        error: exception.code,
      };
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid database request',
        error: 'PrismaClientValidationError',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }

  private log(
    correlationId: string,
    request: Request | undefined,
    resolved: ResolvedError,
    exception: unknown,
  ): void {
    const where = `${request?.method ?? '-'} ${request?.url ?? '-'}`;
    const context = `[${correlationId}] ${where} -> ${resolved.status} ${resolved.error}`;

    if (resolved.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        context,
        exception instanceof Error ? exception.stack : String(exception),
      );
      return;
    }

    this.logger.warn(context);
  }
}
