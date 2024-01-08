import express from 'express';
import createDiscountController from './controllers/createDiscount.js';
import findDiscountProducts from './controllers/findDiscountProducts.js';
import applyDiscountToCart from './controllers/applyDiscount.js';
import deleteADiscount from './controllers/deleteDiscount.js';

const router = express.Router();

const controllers = [
  createDiscountController,
  findDiscountProducts,
  applyDiscountToCart,
  deleteADiscount
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
