import express from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/users.controller';
import {
  changePassword,
  deleteProfile,
  forgotPassword,
  resetPassword,
  signin,
  signup,
  updateProfile,
} from '../controllers/auth.controller';
import { authProtect } from '../utils/middlewares';

const router = express.Router();

const users = express.Router();

router.get('/', getUsers);

router.post('/', createUser);

router.post('/signup', signup);

router.post('/signin', signin);

router.delete('/delete-account', authProtect, deleteProfile);

router.post('/update-profile', authProtect, updateProfile);

router.post('/change-password', authProtect, changePassword);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.get('/:id', getUser);

router.patch('/:id', updateUser);

router.patch('/:id', deleteUser);

export default users.use('/users', router);
