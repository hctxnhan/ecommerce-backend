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
import { OrderStatus } from '../order.models.js';
import { findMyOrders } from '../order.services.js';

const QuerySchema = z.object({
  status: z.enum(Object.values(OrderStatus)).optional().default(OrderStatus.ALL)
});

async function handler(req, res) {
  const { userId } = req.user;
  const { page, limit, status } = req.query;

  const result = await findMyOrders(userId, { page, limit, status });

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const getMyOrders = controllerFactory()
  .method(HttpMethod.GET)
  .path('/my-orders')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery, validateReqQuery(QuerySchema)]);

export default getMyOrders;
