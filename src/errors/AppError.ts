// [Skill: service]
export type AppErrorKind =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT';

export class AppError extends Error {
  readonly kind: AppErrorKind;

  constructor(message: string, kind: AppErrorKind) {
    super(message);
    this.name = new.target.name;
    this.kind = kind;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}
