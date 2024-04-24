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
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { Permission, Resource } from '../../rbac/index.js';
import { SHOP_REQUEST_STATUS, getShopRequests } from '../user.services.js';

const reqQuerySchema = z.object({
  status: z
    .enum(Object.values(SHOP_REQUEST_STATUS))
    .optional()
    .default(SHOP_REQUEST_STATUS.PENDING)
});

async function handler(req, res) {
  const requests = await getShopRequests({
    limit: req.query.limit,
    page: req.query.page,
    status: req.query.status
  });

  return success({
    status: httpStatus.OK,
    data: requests,
    metadata: {
      pagination: {
        total: requests.length,
        limit: req.query.limit,
        page: req.query.page
      }
    }
  }).send(res);
}

const getAllShopRequest = controllerFactory()
  .method(HttpMethod.GET)
  .path('/admin/shopRequests')
  .handler(asyncHandler(handler))
  .middlewares([
    validatePaginationQuery,
    validateReqQuery(reqQuerySchema),
    roleCheck(Resource.SHOP_REQUEST, Permission.READ_ANY)
  ]);

export default getAllShopRequest;
