import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  DomainNotFoundException,
  DomainValidationException,
  DomainForbiddenException,
  DomainConflictException,
  DomainUnauthorizedException,
} from './domain.exceptions';

export function domainExceptionToHttpStatus(
  exception: DomainException,
): number {
  if (exception instanceof DomainNotFoundException) {
    return HttpStatus.NOT_FOUND;
  }
  if (exception instanceof DomainForbiddenException) {
    return HttpStatus.FORBIDDEN;
  }
  if (exception instanceof DomainUnauthorizedException) {
    return HttpStatus.UNAUTHORIZED;
  }
  if (exception instanceof DomainValidationException) {
    return HttpStatus.BAD_REQUEST;
  }
  if (exception instanceof DomainConflictException) {
    return HttpStatus.CONFLICT;
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
