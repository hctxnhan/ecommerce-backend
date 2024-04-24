import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { OrderItemStatusSchema } from '../order.models.js';
import { updateProductOrderStatus } from '../order.services.js';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { Permission, Resource } from '../../rbac/index.js';

async function handler(req, res) {
  const { userId: ownerId } = req.user;
  const { itemId, status } = req.params;

  const parsedStatus = OrderItemStatusSchema.parse(status);

  const result = await updateProductOrderStatus(
    { itemId, ownerId },
    { status }
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
  .method(HttpMethod.PUT)
  .path('/order-items/:itemId/:status')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.ORDER_ITEM, Permission.UPDATE_OWN)]);

export default changeOrderStatus;
