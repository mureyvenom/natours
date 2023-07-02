import { NextFunction, RequestHandler, Request, Response } from 'express';

export default class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('5') ? 'error' : 'failed';
    this.message = message;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync: (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => RequestHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((e) => {
      next(e);
    });
  };
};
