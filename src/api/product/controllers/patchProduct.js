import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { updateProductFactory } from '../product.model.js';
import { doesUserOwnProduct, updateProductById } from '../product.services.js';

async function handler(req, res) {
  const { productId } = req.params;
  const ownedProduct = await doesUserOwnProduct(req.user.userId, productId);

  if (!ownedProduct) {
    return success({
      status: httpStatus.FORBIDDEN,
      message: 'You are not authorized to perform this action'
    }).send(res);
  }

  const updateData = updateProductFactory({
    ...req.body,
    type: ownedProduct.type
  });

  await updateProductById(productId, {
    ...updateData,
    type: ownedProduct.type,
    attributes: {
      ...ownedProduct.attributes,
      ...updateData.attributes
    }
  });

  return success({
    message: 'Product updated successfully',
    status: httpStatus.OK,
    data: {
      productId: new ObjectId(productId)
    }
  }).send(res);
}

const patchProduct = controllerFactory()
  .method(HttpMethod.PATCH)
  .path('/:productId')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default patchProduct;
