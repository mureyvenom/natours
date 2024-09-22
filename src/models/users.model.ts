import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userRoles } from '../utils/helpers';

// const required = true;

export const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Provide an email address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Provide a valid email'],
    },
    photo: String,
    role: {
      type: String,
      enum: userRoles,
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Schema.Types.Mixed,
    passwordChangedAt: Schema.Types.Mixed,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    methods: {
      correctPassword: async function (candidatePassword: string, userPassword: string) {
        return await bcrypt.compare(candidatePassword, userPassword);
      },
      createPasswordResetToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        console.log({ resetToken }, this.passwordResetToken);

        this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        return resetToken;
      },
    },
  }
);

usersSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    next();
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

usersSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = new Date().getTime() - 1000;
  next();
});

usersSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default model('Users', usersSchema);
