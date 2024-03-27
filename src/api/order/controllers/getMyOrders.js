import httpStatus from 'http-status';
import { validatePaginationQuery } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findMyOrders } from '../order.services.js';

async function handler(req, res) {
  const { userId } = req.user;
  const { page, limit } = req.query;

  const result = await findMyOrders(userId, { page, limit });

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const getMyOrders = controllerFactory()
  .method(HttpMethod.GET)
  .path('/my-orders')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery]);

export default getMyOrders;
