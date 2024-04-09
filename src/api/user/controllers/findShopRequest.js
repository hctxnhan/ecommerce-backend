import httpStatus from 'http-status';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { validatePaginationQuery } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { Permission, Resource } from '../../rbac/index.js';
import { SHOP_REQUEST_STATUS, getShopRequests } from '../user.services.js';

async function handler(req, res) {
  const requests = await getShopRequests({
    limit: req.query.limit,
    page: req.query.page,
    status: SHOP_REQUEST_STATUS.ALL,
    userId: req.user.userId
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

const findShopRequest = controllerFactory()
  .method(HttpMethod.GET)
  .path('/my/shopRequests')
  .handler(asyncHandler(handler))
  .middlewares([
    validatePaginationQuery,
    roleCheck(Resource.SHOP_REQUEST, Permission.READ_OWN)
  ]);

export default findShopRequest;
