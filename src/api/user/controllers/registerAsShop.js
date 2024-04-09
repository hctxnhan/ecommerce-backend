import httpStatus from 'http-status';
import { z } from 'zod';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { error, success } from '../../../utils/response.js';
import { Permission, Resource, UserRole } from '../../rbac/index.js';
import {
  createShopRequest,
  findUserById,
  getShopRequests
} from '../user.services.js';

const reqBodySchema = z.object({
  shopDescription: z.string(),
  shopName: z.string(),
  shopAddress: z.string()
});

async function handler(req, res) {
  const user = await findUserById(req.user.userId);

  if (!user) {
    return success({
      status: httpStatus.NOT_FOUND,
      message: 'User not found'
    }).send(res);
  }

  if (user.role === UserRole.SHOP_OWNER) {
    return error({
      status: httpStatus.BAD_REQUEST,
      message: 'User is already a shop owner'
    }).send(res);
  }

  const { shopDescription, shopName, shopAddress } = req.body;

  const previousRequest = await getShopRequests({
    userId: req.user.userId,
    status: 'pending'
  });

  if (previousRequest.length > 0) {
    return error({
      status: httpStatus.BAD_REQUEST,
      message: `You already have a pending request to register as a shop owner. Request ID: ${previousRequest[0]._id}`
    }).send(res);
  }

  await createShopRequest({
    userId: req.user.userId,
    shopName,
    shopDescription,
    shopAddress
  });

  return success({
    status: httpStatus.OK,
    data: {
      message: 'Shop registration request created successfully'
    }
  }).send(res);
}

const registerAsShop = controllerFactory()
  .method(HttpMethod.POST)
  .path('/shopRegistration')
  .handler(asyncHandler(handler))
  .middlewares([
    validateReqBody(reqBodySchema),
    roleCheck(Resource.SHOP_REQUEST, Permission.CREATE_OWN)
  ]);

export default registerAsShop;
