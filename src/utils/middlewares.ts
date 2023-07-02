import { ErrorRequestHandler, RequestHandler } from 'express';
import AppError from './AppError';

export const notFoundHandler: RequestHandler = (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: `Cant find ${req.originalUrl} on this server`,
  });

  const err = new AppError(`Cant find ${req.originalUrl} on this server`, 404);

  next(err);
};

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res) => {
  err.statusCode = err?.statusCode || 500;
  err.status = err?.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
