import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findAllDiscountProducts } from '../discount.services.js';
import { validatePaginationQuery } from '../../../middlewares/validateRequest.js';

async function handler(req, res) {
  const products = await findAllDiscountProducts(req.params.discountId, req.query);

  return success({
    status: httpStatus.OK,
    data: products
  }).send(res);
}

const findDiscountProducts = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:discountId/products')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery])
  .skipAuth();

export default findDiscountProducts;
