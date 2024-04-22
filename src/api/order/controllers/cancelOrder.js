import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { OrderItemStatus } from '../order.models.js';
import { updateOrderStatus } from '../order.services.js';
import createHttpError from 'http-errors';

async function handler(req, res) {
  const { userId: customerId } = req.user;
  const { orderId } = req.params;


  const result = await updateOrderStatus(
    orderId,
    customerId,
    OrderItemStatus.CANCELLED
  );

  if (result.matchedCount === 0) {
    throw createHttpError.Forbidden(
      'There are no orders with the given order id or order does not contain the product, or you are not the owner of the product!'
    );
  }

  return success({
    status: httpStatus.OK,
    message: `Order canceled successfully!`
  }).send(res);
}

const cancelOrder = controllerFactory()
  .method(HttpMethod.DELETE)
  .path('/:orderId/')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default cancelOrder;
