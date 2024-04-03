import express from 'express';
import findAllDiscountOfUser from './controllers/findAllDiscountOfUser.js';
import findUserByIdController from './controllers/findUserById.js';

const router = express.Router();

const controllers = [findAllDiscountOfUser, findUserByIdController];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
