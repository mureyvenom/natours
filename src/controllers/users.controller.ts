import { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { catchAsync } from '../utils/AppError';
const dataPath = path.join(__dirname, '..', 'assets', 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

export const getUsers: RequestHandler = catchAsync(async (_, res) => {
  res.send({
    status: 'success',
    data: {
      results: users.length,
      users,
    },
  });
});

export const createUser: RequestHandler = catchAsync(async (req, res) => {
  const newId = Number(users[users.length - 1]._id) + 1;
  const newUser = Object.assign({ id: newId }, req.body);
  users.push(newUser);
  fs.writeFile(dataPath, JSON.stringify(users), () => {
    res.status(201).send({
      status: 'success',
      message: 'User added',
      data: {
        user: newUser,
      },
    });
  });
});

export const getUser: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const findUser = [...users].find((t) => t._id === id);
  if (findUser) {
    res.status(200).send({
      status: 'success',
      message: 'users fetched',
      data: {
        user: findUser,
      },
    });
  } else {
    res.status(404).send({
      status: 'failed',
      message: 'No user with this id exists',
    });
  }
});

export const updateUser: RequestHandler = catchAsync(async (req, res) => {
  const localUser = [...users];
  const { id } = req.params;
  const findUser = localUser.findIndex((t) => t._id === id);
  if (findUser > -1) {
    delete req.body.id;
    localUser[findUser] = {
      ...localUser[findUser],
      ...req.body,
    };
    fs.writeFile(dataPath, JSON.stringify(localUser), () => {
      res.status(200).send({
        status: 'success',
        message: 'User updated',
        data: {
          tour: localUser[findUser],
        },
      });
    });
  } else {
    res.status(404).send({
      status: 'failed',
      message: 'No user with this id exists',
    });
  }
});

export const deleteUser: RequestHandler = catchAsync(async (req, res) => {
  const localUser = [...users];
  const { id } = req.params;
  const findUser = localUser.findIndex((t) => t._id === id);
  if (findUser > -1) {
    localUser.splice(findUser, 1);
    fs.writeFile(dataPath, JSON.stringify(localUser), () => {
      res.status(200).send({
        status: 'success',
        message: 'User deleted',
        data: {
          tour: localUser,
        },
      });
    });
  } else {
    res.status(404).send({
      status: 'failed',
      message: 'No user with this id exists',
    });
  }
});
