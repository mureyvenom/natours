import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import api from './routes/api';
import { globalErrorHandler, notFoundHandler } from './utils/middlewares';

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use('/api/v1', api);
app.all('*', notFoundHandler);
app.use(globalErrorHandler);

export default app;
