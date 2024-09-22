import usersModel from '../models/users.model';
import AppError, { catchAsync } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/email.handler';
import crypto from 'crypto';
import { filterObj } from '../utils/helpers';
// import dotenv from 'dotenv';

// dotenv.config();

const signToken = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET ?? 'secret_key',
    {
      // expiresIn: 90dmoment
    }
  );
};

export const createAndSendToken = (user: any, statusCode: number, res: any) => {
  const token = signToken(user._id.toString());

  res.cookie('jwt', token, {
    // expires: new Date(Date.now() + process.env.90 * 24 * 60 * 60 * 1000),
    // secure: true,
  });
  user.password = undefined;
  res.status(statusCode).json({
    data: {
      user,
      // token,
    },
  });
};

export const signup = catchAsync(async (req, res) => {
  try {
    const userExists = await usersModel.findOne({
      email: req.body.email,
    });

    if (userExists) {
      res.status(401).json({
        status: 'failed',
        message: 'This user already exists',
      });
    }

    const newUser = await usersModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    createAndSendToken(newUser, 201, res);
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: (error as any).message as string,
    });
  }
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Fill all required fields to proceed', 400));
  }

  const userExists = await usersModel
    .findOne({
      email,
      active: true,
    })
    .select('+password');

  if (!userExists) {
    return next(new AppError('Incorrect credentials', 401));
  }
  const passwordValid = await userExists?.correctPassword(password, userExists.password || '');

  if (!userExists || !passwordValid) {
    return next(new AppError('Incorrect credentials', 401));
  }

  const { password: _, ...fullUser } = userExists.toObject();
  createAndSendToken(fullUser, 201, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Enter a valid email to proceed', 400));
  }

  const userExists = await usersModel.findOne({
    email,
    active: true,
  });

  if (!userExists) {
    return next(new AppError('Account not found', 401));
  }

  const resetToken = userExists?.createPasswordResetToken();
  await userExists.save({
    validateBeforeSave: false,
  });

  const resetURL = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;
  const message = `Complete your password reset process by entering your old password and your new password by clicking on this link: ${resetURL}. This link is only valid for 10 minutes. If you did not initiate this request you can kindly ignore this message.`;

  try {
    await sendMail({
      to: email,
      subject: 'Reset your password',
      text: message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Password reset initiated',
    });
  } catch (error) {
    userExists.passwordResetExpires = undefined;
    userExists.passwordResetToken = undefined;
    await userExists.save({
      validateBeforeSave: false,
    });
    return new AppError('There was an error sending out your mail. Try again later', 500);
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  if (!resetToken) {
    return next(new AppError('Invalid reset token', 400));
  }
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const userExists = await usersModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: new Date().getTime(),
    },
  });

  if (!userExists) {
    return next(new AppError('Invalid or expired reset token', 401));
  }

  // if (req.body.oldPassword === req.body.newPassword) {
  //   return next(new AppError('New password cannot be the same with old password', 401));
  // }

  userExists.password = req.body.newPassword;
  userExists.passwordResetToken = undefined;
  userExists.passwordResetExpires = undefined;
  await userExists.save();
  createAndSendToken(userExists, 201, res);
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const userExists = await usersModel.findById((req as any).user._id).select('+password');

  if (!userExists) {
    return next(new AppError('Invalid or expired session', 401));
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Fill all required fields to proceed', 400));
  }
  const passwordValid = await userExists?.correctPassword(oldPassword, userExists.password || '');

  if (!passwordValid) {
    return next(new AppError('Incorrect password', 401));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }
  userExists.password = newPassword;
  await userExists.save({});
  createAndSendToken(userExists, 201, res);
});

export const updateProfile = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('Unnecessary password field', 400));
  }

  const filteredBody = filterObj(req.body, ...['name', 'email']);
  const userExists = await usersModel.findByIdAndUpdate((req as any).user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!userExists) {
    return next(new AppError('Invalid or expired session', 401));
  }

  await userExists.save({});
  res.status(201).json({
    status: 'success',
    user: userExists,
  });
});

export const deleteProfile = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('Unnecessary password field', 400));
  }

  const userExists = await usersModel.findByIdAndUpdate((req as any).user._id, {
    active: false,
  });

  if (!userExists) {
    return next(new AppError('Invalid or expired session', 401));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
