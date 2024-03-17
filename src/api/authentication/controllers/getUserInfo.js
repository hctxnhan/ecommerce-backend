import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findUserById } from '../../user/user.services.js';

async function handler(req, res) {
  const result = await findUserById(req.user.userId);

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const getUserInfo = controllerFactory()
  .method(HttpMethod.GET)
  .path('/profile')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default getUserInfo;
