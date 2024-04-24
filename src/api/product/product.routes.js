import express from 'express';
import createProduct from './controllers/createProduct.js';
import findAllOwnProduct from './controllers/findAllOwnProduct.js';
import publishProduct from './controllers/publishProduct.js';
import unpublishProduct from './controllers/unpublishProduct.js';
import findAllProduct from './controllers/findAllProduct.js';
import findOneProduct from './controllers/findOneProduct.js';
import patchProduct from './controllers/patchProduct.js';
import findProductDiscounts from './controllers/findProductDiscounts.js';
import deleteProduct from './controllers/deleteProduct.js';

const router = express.Router();

const controllers = [
  createProduct,
  findAllOwnProduct,
  publishProduct,
  unpublishProduct,
  findAllProduct,
  findOneProduct,
  patchProduct,
  findProductDiscounts,
  deleteProduct
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
