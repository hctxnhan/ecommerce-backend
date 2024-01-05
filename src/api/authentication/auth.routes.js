import express from 'express';
import signUp from './controllers/signUp.js';
import signIn from './controllers/signIn.js';
import refreshToken from './controllers/refreshToken.js';

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
