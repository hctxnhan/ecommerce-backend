import httpStatus from 'http-status';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { error, success } from '../../../utils/response.js';
import { Permission, Resource } from '../../rbac/index.js';
import {
  SHOP_REQUEST_STATUS,
  confirmShopRequest,
  rejectShopRequest
} from '../user.services.js';

async function handler(req, res) {
  const { requestId, status } = req.params;

  if (status === SHOP_REQUEST_STATUS.APPROVED) {
    const res = await confirmShopRequest(requestId);

    if (!res.success) {
      return error({
        status: httpStatus.BAD_REQUEST,
        message: res.message
      }).send();
    }
  } else if (status === SHOP_REQUEST_STATUS.REJECTED) {
    const res = await rejectShopRequest(requestId);

    if (!res.success) {
      return error({
        status: httpStatus.BAD_REQUEST,
        message: res.message
      }).send();
    }
  } else {
    return error({
      status: httpStatus.BAD_REQUEST,
      message: 'Invalid status'
    }).send();
  }

  return success({
    status: httpStatus.OK,
    data: {
      message: `Request ${status} successfully`
    }
  }).send(res);
}

const confirmShopRegistration = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/:userId/shopRegistration/:requestId/:status')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.SHOP_REQUEST, Permission.UPDATE_ANY)]);

export default confirmShopRegistration;
