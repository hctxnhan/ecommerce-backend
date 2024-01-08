import httpStatus from 'http-status';
import { validatePaginationQuery } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findAllDiscounts } from '../../discount/discount.services.js';

async function handler(req, res) {
  const products = await findAllDiscounts(req.params.userId, req.query);

  return success({
    status: httpStatus.OK,
    data: products,
    metadata: {
      pagination: {
        total: products.length,
        limit: req.query.limit,
        page: req.query.page
      }
    }
  }).send(res);
}

const findAllDiscountOfUser = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:userId/discounts')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery])
  .skipAuth();

export default findAllDiscountOfUser;
