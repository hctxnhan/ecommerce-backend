import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findCartOfCustomer } from '../cart.services.js';

async function handler(req, res) {
  const result = await findCartOfCustomer(req.user.userId);

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const getCart = controllerFactory()
  .method(HttpMethod.GET)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default getCart;
