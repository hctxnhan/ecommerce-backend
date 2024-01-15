import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { z } from 'zod';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findProductById } from '../../product/product.services.js';
import { findCartOfCustomer, updateCart } from '../cart.services.js';
import { validateReqBody } from '../../../middlewares/validateRequest.js';

const reqBodySchema = z
  .object({
    quantity: z.number()
  })
  .strip();

async function handler(req, res) {
  const product = await findProductById(req.params.productId);

  if (!product) {
    throw createHttpError.BadRequest('Product not found');
  }

  const { quantity } = req.body;
  const { productId } = req.params;
  const { userId: customerId } = req.user;

  const cart = await findCartOfCustomer(customerId);

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) throw createHttpError.BadRequest('Item not found!');

  cart.count -= cart.items[itemIndex].quantity;
  cart.total -= cart.items[itemIndex].total;
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].total = quantity * cart.items[itemIndex].price;
  cart.count += quantity;
  cart.total += quantity * cart.items[itemIndex].price;

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  }

  await updateCart(customerId, cart);

  return success({
    status: httpStatus.OK,
    message: 'Item has been updated!'
  }).send(res);
}

const updateItemQuantity = controllerFactory()
  .method(HttpMethod.PATCH)
  .path('/items/:productId')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)]);

export default updateItemQuantity;
