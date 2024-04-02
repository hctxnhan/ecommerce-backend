import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { addItemToCart } from '../cart.services.js';
import { findProductById } from '../../product/product.services.js';

const reqBodySchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  price: z.number(),
  ownerId: z.string().optional()
});

async function handler(req, res) {
  const product = await findProductById(req.body.productId);

  if (!product) {
    throw createHttpError.BadRequest('Product not found');
  }

  await addItemToCart(req.user.userId, req.body);

  return success({
    status: httpStatus.OK,
    message: 'Item has been added to your cart!'
  }).send(res);
}

const addItem = controllerFactory()
  .method(HttpMethod.POST)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)]);

export default addItem;
