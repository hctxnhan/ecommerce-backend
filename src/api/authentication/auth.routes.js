import express from 'express';
import signUp from './controllers/sign-up.js';
import signIn from './controllers/sign-in.js';
import refreshToken from './controllers/refresh-token.js';

const router = express.Router();

const controllers = [signUp, signIn, refreshToken];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
