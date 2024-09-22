import { ErrorRequestHandler, RequestHandler } from 'express';
import AppError, { catchAsync } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import { Response } from 'express-serve-static-core';

const handleCastErrorDB = (err: { path: any; value: any }) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: { errmsg: { match: (arg0: RegExp) => any[] } }) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: { errors: Record<string, unknown> | ArrayLike<unknown> }) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (
  err: { statusCode: any; status: any; message: any; stack: any },
  res: Response<any, Record<string, any>, number>
) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (
  err: { isOperational: any; statusCode: any; status: any; message: any },
  res: Response<any, Record<string, any>, number>
) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const notFoundHandler: RequestHandler = (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: `Cant find ${req.originalUrl} on this server`,
  });

  const err = new AppError(`Cant find ${req.originalUrl} on this server`, 404);

  next(err);
};

export const authProtect = catchAsync(async (req, res, next) => {
  try {
    let token = '';
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(new AppError('You must be logged in for this action', 401));
    }

    const jwtVerifyPromisified = (token: string, secret: string) => {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, payload) => {
          if (err) {
            reject(err);
          } else {
            resolve(payload);
          }
        });
      });
    };

    const validUser = await jwtVerifyPromisified(token, process.env.JWT_SECRET!);
    console.log('validUser', validUser);

    next();
  } catch (error) {
    console.log(error);
  }
});

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }

  err.statusCode = err?.statusCode || 500;
  err.status = err?.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
