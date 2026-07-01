import { Response } from 'express';

export const sendSuccess = <T>(res: Response, status: number, data: T) =>
  res.status(status).json({ success: true, data });

export const sendMessage = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: true, message });

export const sendError = (
  res: Response,
  status: number,
  message: string,
  errorMessage: string,
) =>
  res
    .status(status)
    .json({ message, errors: [{ path: [], message: errorMessage }] });
