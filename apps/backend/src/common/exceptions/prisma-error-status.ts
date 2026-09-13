import { HttpStatus } from '@nestjs/common';

const PRISMA_ERROR_STATUS: Record<string, number> = {
  P2000: HttpStatus.BAD_REQUEST,
  P2001: HttpStatus.NOT_FOUND,
  P2002: HttpStatus.CONFLICT,
  P2003: HttpStatus.BAD_REQUEST,
  P2004: HttpStatus.BAD_REQUEST,
  P2011: HttpStatus.BAD_REQUEST,
  P2012: HttpStatus.BAD_REQUEST,
  P2014: HttpStatus.BAD_REQUEST,
  P2015: HttpStatus.NOT_FOUND,
  P2018: HttpStatus.NOT_FOUND,
  P2025: HttpStatus.NOT_FOUND,
};

const PRISMA_ERROR_MESSAGE: Record<string, string> = {
  P2002: 'A record with these values already exists',
  P2003: 'Referenced record does not exist',
  P2025: 'Resource not found',
};

export function prismaErrorToHttpStatus(code: string): number {
  return PRISMA_ERROR_STATUS[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}

export function prismaErrorToMessage(code: string): string {
  return PRISMA_ERROR_MESSAGE[code] ?? 'Database request failed';
}
