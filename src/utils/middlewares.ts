import usersModel from '../models/users.model';
import AppError, { catchAsync } from './AppError';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';

export const authProtect = catchAsync(async (req, res, next) => {
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
  const checkUser = await usersModel.findById((validUser as any).id);
  if (!checkUser) {
    return next(new AppError('This account does not exist', 404));
  }
  (req as any).user = checkUser.toObject();
  next();
});

export const restrictTo: (...roles: string[]) => RequestHandler = (roles) => {
  return (req, res, next) => {
    if (!roles.includes((req as any).user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const rateLimiter = () => {
  return rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again in one hour!',
    legacyHeaders: true,
  });
};
