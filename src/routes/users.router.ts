import express from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/users.controller';

const router = express.Router();

const users = express.Router();

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:id', getUser);

router.patch('/:id', updateUser);

router.patch('/:id', deleteUser);

export default users.use('/users', router);
