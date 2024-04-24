import httpStatus from 'http-status';
import { z } from 'zod';
import {
  validatePaginationQuery,
  validateReqQuery
} from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { OrderItemStatus } from '../order.models.js';
import { getOrderItemByShopId } from '../order.services.js';

const QuerySchema = z.object({
  status: z
    .enum(Object.values(OrderItemStatus))
    .optional()
    .default(OrderItemStatus.PENDING)
});

async function handler(req, res) {
  const { page, limit, status } = req.query;

  const result = await getOrderItemByShopId({
    shopId: req.user.userId,
    limit,
    page,
    status
  });

  return success({
    status: httpStatus.OK,
    data: result,
    metadata: {
      pagination: {
        total: result.length,
        limit: req.query.limit,
        page: req.query.page
      }
    }
  }).send(res);
}

const getShopOrderItem = controllerFactory()
  .method(HttpMethod.GET)
  .path('/shop-order-items')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery, validateReqQuery(QuerySchema)]);

export default getShopOrderItem;
