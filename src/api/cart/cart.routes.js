import express from 'express';
import addItem from './controllers/addItem.js';
import getCart from './controllers/getCart.js';
import removeItem from './controllers/removeItem.js';
import emptyCart from './controllers/emptyCart.js';
import updateItemQuantity from './controllers/updateItemQuantity.js';

const router = express.Router();

const controllers = [
  addItem,
  getCart,
  removeItem,
  emptyCart,
  updateItemQuantity
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
