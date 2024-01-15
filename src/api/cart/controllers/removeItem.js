import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { removeItemFromCart } from '../cart.services.js';

async function handler(req, res) {
  await removeItemFromCart(req.user.userId, req.params.productId);

  return success({
    status: httpStatus.OK,
    message: 'Item has been remove from your cart!'
  }).send(res);
}

const removeItem = controllerFactory()
  .method(HttpMethod.DELETE)
  .path('/items/:productId')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default removeItem;
