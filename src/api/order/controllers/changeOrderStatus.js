import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { OrderStatusSchema } from '../order.models.js';
import { updateProductOrderStatus } from '../order.services.js';

async function handler(req, res) {
  const { userId: ownerId } = req.user;
  const { orderId, productId, status } = req.params;

  const parsedStatus = OrderStatusSchema.parse(status);

  const result = await updateProductOrderStatus(
    orderId,
    productId,
    ownerId,
    status
  );

  if (result.matchedCount === 0) {
    throw createHttpError.NotFound(
      'There are no orders with the given order id or order does not contain the product, or you are not the owner of the product!'
    );
  }

  return success({
    status: httpStatus.OK,
    message: `Order status updated to ${parsedStatus}`
  }).send(res);
}

const changeOrderStatus = controllerFactory()
  .method(HttpMethod.POST)
  .path('/:orderId/:productId/:status')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default changeOrderStatus;
