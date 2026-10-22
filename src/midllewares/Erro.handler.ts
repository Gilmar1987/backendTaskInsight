// [Skill: infrastructure]
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, AppErrorKind } from '../errors/AppError';

interface CustomError extends Error {
  code?: number;
}

const statusByKind: Record<AppErrorKind, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const labelByKind: Record<AppErrorKind, string> = {
  VALIDATION: 'Validation Error',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found Error',
  CONFLICT: 'Conflict Error',
};

const isMongoDuplicateKeyError = (error: unknown): error is { code: number } => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown };
  return candidate.code === 11000;
};

const toSafeMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\r|\n/g, ' ');
};

export const globalErrorHandler = (
  err: CustomError | unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Log]:', toSafeMessage(err));

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(statusByKind[err.kind]).json({
      message: labelByKind[err.kind],
      errors: [{ path: [], message: err.message }],
    });
  }

  if (isMongoDuplicateKeyError(err)) {
    return res.status(409).json({
      message: 'Conflict Error',
      errors: [{ path: [], message: 'Email já cadastrado' }],
    });
  }

  return res.status(500).json({
    message: 'Erro interno do servidor',
  });
};