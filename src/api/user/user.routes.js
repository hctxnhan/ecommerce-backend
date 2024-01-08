import express from 'express';
import findAllDiscountOfUser from './controllers/findAllDiscountOfUser.js';

const router = express.Router();

const controllers = [findAllDiscountOfUser];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
