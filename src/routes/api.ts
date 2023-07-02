import express from 'express';
import toursRouter from './tours.router';
import usersRouter from './users.router';

const api = express.Router();

api.use(toursRouter);
api.use(usersRouter);

export default api;
