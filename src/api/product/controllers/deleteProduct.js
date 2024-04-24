import httpStatus from 'http-status';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { Permission, Resource } from '../../rbac/index.js';
import { deleteProductById, doesUserOwnProduct } from '../product.services.js';

async function handler(req, res) {
  const { productId } = req.params;
  const isOwner = await doesUserOwnProduct(req.user.userId, productId);

  if (!isOwner) {
    return success({
      status: httpStatus.FORBIDDEN,
      message: 'You are not authorized to perform this action'
    }).send(res);
  }

  await deleteProductById(productId);

  return success({
    message: 'Product deleted successfully',
    status: httpStatus.OK
  }).send(res);
}

const deleteProduct = controllerFactory()
  .method(HttpMethod.DELETE)
  .path('/:productId')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.PRODUCT, Permission.DELETE_OWN)]);

export default deleteProduct;
