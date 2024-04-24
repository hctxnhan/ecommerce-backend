import httpStatus from 'http-status';

import { connect } from '../../../services/dbs/index.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { toObjectId } from '../../../utils/index.js';
import { success } from '../../../utils/response.js';
import { createInventory } from '../../inventory/inventory.services.js';
import { productFactory } from '../product.model.js';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { Permission, Resource } from '../../rbac/index.js';

async function handler(req, res) {
  const product = productFactory(req.body);
  const result = await connect.PRODUCTS().insertOne({
    ...product,
    owner: toObjectId(req.user.userId),
    sold: 0
  });

  const { insertedId: productId } = result;
  await createInventory({
    productId,
    stock: product.stock,
    userId: req.user.userId
  });

  return success({
    message: 'Product has been created successfully!',
    status: httpStatus.CREATED,
    data: {
      id: result.insertedId,
      ...req.body
    }
  }).send(res);
}

const createProduct = controllerFactory()
  .method(HttpMethod.POST)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.PRODUCT, Permission.CREATE_OWN)]);

export default createProduct;
