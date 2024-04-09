import express from 'express';
import findAllDiscountOfUser from './controllers/findAllDiscountOfUser.js';
import findUserByIdController from './controllers/findUserById.js';
import registerAsShop from './controllers/registerAsShop.js';
import findShopRequest from './controllers/findShopRequest.js';
import getAllShopRequest from './controllers/findAllShopRequest.js';
import confirmShopRegistration from './controllers/confirmShopRegistration.js';

const router = express.Router();

const controllers = [
  confirmShopRegistration,
  findShopRequest,
  getAllShopRequest,
  findAllDiscountOfUser,
  findUserByIdController,
  registerAsShop,
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
