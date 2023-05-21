import express from 'express';
import toursRouter from './tours.router';
// import planetsRouter from './planets.router';
// import launchesRouter from './launches.router';

const api = express.Router();

api.use(toursRouter);
// api.use(launchesRouter);

export default api;
