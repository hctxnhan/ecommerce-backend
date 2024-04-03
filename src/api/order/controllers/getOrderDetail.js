import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { getOrderDetailById } from '../order.services.js';

async function handler(req, res) {
  const { userId } = req.user;
  const { orderId } = req.params;

  const result = await getOrderDetailById(orderId);

  if (!result.length) {
    throw createHttpError.NotFound('Order not found!');
  }

  if (result[0].customerId !== userId) {
    throw createHttpError.Forbidden(
      'You are not allowed to access this order!'
    );
  }

  return success({
    status: httpStatus.OK,
    data: result[0]
  }).send(res);
}

const getOrdersDetail = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:orderId')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default getOrdersDetail;
