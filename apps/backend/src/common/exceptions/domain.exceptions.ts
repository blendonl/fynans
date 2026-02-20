export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DomainNotFoundException extends DomainException {
  constructor(message: string = 'Resource not found') {
    super(message);
  }
}

export class DomainValidationException extends DomainException {
  constructor(message: string = 'Validation failed') {
    super(message);
  }
}

export class DomainForbiddenException extends DomainException {
  constructor(message: string = 'Access denied') {
    super(message);
  }
}

export class DomainConflictException extends DomainException {
  constructor(message: string = 'Resource conflict') {
    super(message);
  }
}
