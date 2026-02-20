import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  DomainNotFoundException,
  DomainValidationException,
  DomainForbiddenException,
  DomainConflictException,
} from '../exceptions/domain.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.getHttpStatus(exception);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }

  private getHttpStatus(exception: DomainException): number {
    if (exception instanceof DomainNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof DomainForbiddenException) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof DomainValidationException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof DomainConflictException) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
