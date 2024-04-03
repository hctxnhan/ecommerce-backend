import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import createHttpError from 'http-errors';
import logger from 'morgan';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import indexRouter from './routes.js';
import { error } from './src/utils/response.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

app.use('/', indexRouter);

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);

  if (err instanceof ZodError) {
    return error({
      status: 400,
      errors: fromZodError(err).message,
      message: err.message
    }).send(res);
  }

  return error({
    status: err.status,
    errors: err.errors,
    message: err.message
  }).send(res);
});

export default app;
