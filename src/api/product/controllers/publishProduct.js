import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { doesUserOwnProduct, updateProductById } from '../product.service.js';

async function handler(req, res) {
  const { productId } = req.params;
  const isOwner = await doesUserOwnProduct(req.user.userId, productId);

  if (!isOwner) {
    return success({
      status: httpStatus.FORBIDDEN,
      message: 'You are not authorized to perform this action'
    }).send(res);
  }

  await updateProductById(productId, {
    isPublished: true
  });

  return success({
    message: 'Product published successfully',
    status: httpStatus.OK,
    data: {
      productId: new ObjectId(productId)
    }
  }).send(res);
}

const publishProduct = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/:productId/publish')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default publishProduct;
