import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import api from './routes/api';
import { globalErrorHandler, notFoundHandler } from './controllers/error.controller';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import { xss } from 'express-xss-sanitizer';
import hpp from 'hpp';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again in one hour!',
    // legacyHeaders: true,
  })
);
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use('/api/v1', api);
app.all('*', notFoundHandler);
app.use(globalErrorHandler);

export default app;
