import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandlerFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown | Promise<unknown>;

export const asyncHandler = (fn: AsyncHandlerFn): RequestHandler => {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
