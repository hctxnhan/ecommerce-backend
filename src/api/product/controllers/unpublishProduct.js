import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { doesUserOwnProduct, updateProductById } from '../product.services.js';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { Permission, Resource } from '../../rbac/index.js';

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
    isPublished: false
  });

  return success({
    message: 'Product unpublished successfully',
    status: httpStatus.OK,
    data: {
      productId: new ObjectId(productId)
    }
  }).send(res);
}

const unpublishProduct = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/:productId/unpublish')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.PRODUCT, Permission.UPDATE_OWN)]);

export default unpublishProduct;
