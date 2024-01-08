import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findAllProductDiscounts } from '../../discount/discount.services.js';
import { validatePaginationQuery } from '../../../middlewares/validateRequest.js';

async function handler(req, res) {
  const products = await findAllProductDiscounts(
    req.params.productId,
    req.query
  );

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

const findProductDiscounts = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:productId/discounts')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery])
  .skipAuth();

export default findProductDiscounts;
