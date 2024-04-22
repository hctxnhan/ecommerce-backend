import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { getOrderItemByShopId } from '../order.services.js';

async function handler(req, res) {
  const result = await getOrderItemByShopId(req.user.userId);

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const getShopOrderItem = controllerFactory()
  .method(HttpMethod.GET)
  .path('/shop-order-items')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default getShopOrderItem;
