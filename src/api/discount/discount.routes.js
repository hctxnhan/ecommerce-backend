import express from 'express';
import createDiscountController from './controllers/createDiscount.js';
import deleteADiscount from './controllers/deleteDiscount.js';
import findDiscountProducts from './controllers/findDiscountProducts.js';
import updateDiscountActive from './controllers/updateDiscountActive.js';

const router = express.Router();

const controllers = [
  createDiscountController,
  findDiscountProducts,
  // applyDiscountToCart,
  deleteADiscount,
  updateDiscountActive
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
