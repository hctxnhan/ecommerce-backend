import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { Permission, Resource } from '../../rbac/index.js';
import { getOrderItem } from '../order.services.js';

async function handler(req, res) {
  const { userId } = req.user;
  const { itemId } = req.params;

  const result = await getOrderItem({ itemId });

  if (!result.length) {
    throw createHttpError.NotFound('Order item not found!');
  }

  if (result[0].ownerId.toString() !== userId) {
    throw createHttpError.Forbidden(
      'You are not allowed to access this resource!'
    );
  }

  return success({
    status: httpStatus.OK,
    data: result[0]
  }).send(res);
}

const findOrderItem = controllerFactory()
  .method(HttpMethod.GET)
  .path('/order-items/:itemId')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.ORDER_ITEM, Permission.READ_OWN)]);

export default findOrderItem;
