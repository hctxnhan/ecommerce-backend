import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { deleteCart } from '../cart.services.js';

async function handler(req, res) {
  await deleteCart(req.user.userId);

  return success({
    status: httpStatus.OK,
    message: 'Cart emptied!'
  }).send(res);
}

const emptyCart = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/empty')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default emptyCart;
