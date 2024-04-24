import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { error, success } from '../../../utils/response.js';
import { findProductById } from '../product.services.js';

async function handler(req, res) {
  const { productId } = req.params;
  const result = await findProductById(productId);

  if (!result) {
    return error({
      message: 'Product not found',
      status: httpStatus.NOT_FOUND
    }).send(res);
  }

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const findOneProduct = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:productId')
  .handler(asyncHandler(handler))
  .middlewares([])
  .skipAuth();

export default findOneProduct;
